const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const Staff = require("../models/staff.model");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Patient = require("../models/patient.model");
const generateToken = require("../utils/generateToken");
const { generateOTP } = require("../utils/otpGenerator");
const { initWhatsapp } = require("../utils/whatsappClient");
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');


exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await Staff.create({
    name,
    email,
    password,
  });

  // Generate token
  generateToken(res, user, "account created successfully");
});

exports.loginEmail = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await Staff.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid email or password", 401));
  }

  delete user._doc.password; // Remove password from response

  // Generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.loginNationalID = asyncHandler(async (req, res, next) => {
  const { nationalID, password } = req.body;

  const user = await Patient.findOne({ nationalID });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid national-id or password", 401));
  }

  delete user._doc.password; // Remove password from response

  // Generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.loginPhone = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  const user = await Staff.findOne({ phone });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid phone number or password", 401));
  }

  delete user._doc.password; // Remove password from response

  // Generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.loginPhonePatient = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  const user = await Patient.findOne({ phone });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid phone number or password", 401));
  }

  delete user._doc.password; // Remove password from response

  // Generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await Staff.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.sendOtpToWhatsApp = asyncHandler(async (req, res, next) => {
  const client = await initWhatsapp();
  const { phone } = req.body;

  if (!phone || !/^201(0|1|2|5)[0-9]{8}$/.test(phone)) {
    return next(new ApiError("Invalid Egyptian phone number format"), 400);
  }

  const { otp, expiry } = generateOTP();
  const message = `Your 6-digit OTP is: ${otp}. It will expire in 5 minutes.`;

  await client.sendMessage(`${phone}@c.us`, message);

  await Patient.updateOne(
    { phone },
    {
      $setOnInsert: { phone }, // Set phone only if inserting
      $set: {
        otp,
        otpExpiry: expiry,
        isPhoneVerified: false,
      },
    },
    { upsert: true }
  );

  res.status(200).json({ message: "OTP sent to WhatsApp successfully" });
});

exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(new ApiError("Phone and OTP are required", 400));
  }

  const patient = await Patient.findOne({ phone });

  if (!patient) {
    return next(new ApiError("Patient not found", 400));
  }

  if (patient.otp !== otp) {
    return next(new ApiError("Invalid OTP", 400));
  }

  if (new Date() > patient.otpExpiry) {
    await Patient.deleteOne({ phone });
    return next(new ApiError("OTP has expired", 400));
  }

  patient.isPhoneVerified = true;
  patient.otp = null;
  patient.otpExpiry = null;
  await patient.save();

  return res
    .status(200)
    .json({ message: "Phone number verified successfully" });
});

// Phase 3: Complete Registration
exports.registerPatientInfo = asyncHandler(async (req, res, next) => {
  const {
    phone,
    firstName,
    lastName,
    email,
    gender,
    nationalID,
    nationalIDImg,
    password,
  } = req.body;

  const patient = await Patient.findOne({ phone });
  if (!patient) return next(new ApiError("Patient not found", 404));
  if (!patient.isPhoneVerified)
    return next(new ApiError("Phone not verified", 403));

  const medicalHistory = JSON.parse(req.body.medicalHistory);

  patient.firstName = firstName;
  patient.lastName = lastName;
  patient.email = email;
  patient.gender = gender;
  patient.nationalID = nationalID;
  patient.password = password;
  patient.nationalIDImg = nationalIDImg;
  patient.medicalHistory = medicalHistory;

  const token = generateToken(patient._id);

  await patient.save();

  res
    .status(200)
    .json({ message: "Patient registered successfully", patient, token });
});

// Upload single image
exports.uploadUserImage = uploadSingleImage("nationalIDImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const filename = `nationalId-${uuidv4()}-${Date.now()}`;

    const buffer = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toBuffer();

    await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: 'patient/nationalId',
            public_id: filename,
            resource_type: 'image',
        },
        (error, result) => {
            if (error) return reject(error);
            req.body.nationalIDImg = result.secure_url; 
            resolve();
        }
        );
        streamifier.createReadStream(buffer).pipe(upload_stream);
    });

    next();
});
