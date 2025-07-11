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
const crypto = require('crypto');

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

  if (!user.active) {
    return next(new ApiError("Your account has been deactivated. Please contact your administrator", 401));
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

  if (!user.verifyAccount) {
    return next(new ApiError("Your account is not verified yet", 401));
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

  if (!user.active) {
    return next(new ApiError("Your account has been deactivated. Please contact your administrator", 401));
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

  if (!user.verifyAccount) {
    return next(new ApiError("Your account is not verified yet", 401));
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
  // Get token from cookie or Authorization header
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Then check for Authorization header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please login to access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await Staff.findById(decoded.userId) || await Patient.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The user that belongs to this token no longer exists", 401)
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
  const { phone } = req.body;
  if (!phone || !/^201(0|1|2|5)[0-9]{8}$/.test(phone)) {
      return next(new ApiError("Invalid Egyptian phone number format"), 400);
  }

  const patient = await Patient.findOne({ phone });
  if (patient?.isPhoneVerified) {
    return next(new ApiError("Phone number already verified", 400));
  } 

    const client = await initWhatsapp();

    const { otp, expiry } = generateOTP();
    const message = `*${otp}* is your verification code.\ndo not share this code with anyone,\nthis code expires in 5 minutes.`;

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
  patient.otpVerified = true; // Mark OTP as verified
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
  patient.otp = undefined;
  patient.otpExpiry = undefined;
  patient.otpVerified = undefined;

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




exports.getProfile = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const publicPatientProfile = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    gender: patient.gender,
    birthDate: patient.birthDate,
    nationalID: patient.nationalID,
    age: patient.age,
    medicalHistory: {
      chronicDiseases: patient.medicalHistory.chronicDiseases,
      allergies: patient.medicalHistory.allergies,
      medications: patient.medicalHistory.medications,
      surgeries: patient.medicalHistory.surgeries,
      currentSymptoms: patient.medicalHistory.currentSymptoms,
      lifestyle: patient.medicalHistory.lifestyle
    }
  };

  res.status(200).json({
    message: "Patient profile retrieved successfully",
    patient: publicPatientProfile
  });
});

// @desc forget password
// @route POST /api/v1/auth/forgetPassword
// @access Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const client = await initWhatsapp();
  const { nationalID } = req.body;

  if (!nationalID || nationalID.length !== 14) {
    return next(new ApiError("Invalid national ID format", 400));
  }
  const patient = await Patient.findOne({ nationalID });
  if (!patient) {
    return next(new ApiError("Patient not found", 404));
  }

  const phone = patient.phone;

  if (!phone || !/^201(0|1|2|5)[0-9]{8}$/.test(phone)) {
    return next(new ApiError("Invalid Egyptian phone number format"), 400);
  }



  const { otp, expiry } = generateOTP();
  const hashedOtp = await crypto.createHash('sha256').update(otp).digest('hex');

  patient.otp = hashedOtp;
  patient.otpExpiry = expiry;
  patient.otpVerified = false;
  await patient.save();

  const message = `*${otp}* is your password reset code.\ndo not share this code with anyone,\nthis code expires in 5 minutes.`;

  try {
    await client.sendMessage(`${phone}@c.us`, message);
  }
  catch (error) {
    patient.otp = undefined;
    patient.otpExpiry = undefined;
    patient.otpVerified = undefined;
    await patient.save();
    return next(new ApiError("Failed to send OTP via WhatsApp", 500));
  }
    const countryCode = phone.slice(0, 3); 
    const maskedSection = '*'.repeat(phone.length - 6);
    const lastTwoDigits = phone.slice(-2);
    const maskedNumber = `${countryCode}${maskedSection}${lastTwoDigits}`;

  res.status(200).json({ status: 'Success', message:  `OTP sent successfully to your WhatsApp number`, phone: maskedNumber})
})


// @desc verify otp
// @route POST /api/v1/auth/verifyOtp
// @access Public

exports.verifyOtpForPassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on  reset code
  const hashedOtp = crypto.createHash('sha256').update(req.body.otp).digest('hex');

  const patient = await Patient.findOne({ otp: hashedOtp, otpExpiry: { $gt: Date.now() } });

  if (!patient) {
    return next(new ApiError(`Invalid otp or expired`, 400))
  }

  // 2) Reset code valid
  patient.otpVerified = true

  await patient.save();

  res.status(200).json({ status: 'Success', message: 'otp verified' })
})

// @desc reset password
// @route PUT /api/v1/auth/resetPassword
// @access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on phone number

  const patient = await Patient.findOne({ nationalID: req.body.nationalID });
  if (!patient) {
    return next(new ApiError(`there is no patient with this national id`, 404))
  }
  // check if reset code verified
  if (!patient.otpVerified) {
    return next(new ApiError(`otp has not been verified`, 400))
  }

  patient.password = req.body.newPassword;
  patient.otp = undefined;
  patient.otpExpiry = undefined;
  patient.otpVerified = undefined;

  await patient.save();
  // 3) if everything is ok, generate token
  const token = generateToken(patient._id);

  res.status(200).json({ data: patient, token });
})

exports.changePasswordForStaff = asyncHandler(async(req, res, next) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    return next(new ApiError("staff not found", 404));
  }

  // update password
  
  staff.password = req.body.newPassword;
  await staff.save();

  res.status(200).json({ message: "Password changed successfully" });
})