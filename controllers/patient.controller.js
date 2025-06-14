const factory = require('./factoryHandler');
const Patient = require('../models/patient.model');
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');
const { generateOTP } = require("../utils/otpGenerator");
const { initWhatsapp } = require('../utils/whatsappClient');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


// @desc    Get list of Patient
// @route   GET /api/v1/patients
// @access  Private/Admin
exports.getAllPatients = factory.getAll(Patient, 'Patient');

// @desc    Get specific Patient by id
// @route   GET /api/v1/patients/:id
// @access  Private/Admin
exports.getPatient = factory.getOne(Patient);

// @desc    Create Patient
// @route   POST  /api/v1/branchs
// @access  Private/Admin
exports.createPatient = asyncHandler(async (req, res, next) => {
    const medicalHistory = JSON.parse(req.body.medicalHistory);
    const newPatient = await Patient.create({ ...req.body, medicalHistory }); 
    
    res.status(201).json({
        status: 'success',
        data: {
        patient: newPatient,
        },
    });
    })

// @desc    Update specific Patient
// @route   PUT /api/v1/patients/:id
// @access  Private/Admin
exports.updatePatient = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const medicalHistory = JSON.parse(req.body.medicalHistory);
    const updatedPatient = await Patient.findByIdAndUpdate(
        id,
        { ...req.body, medicalHistory },
        {
            new: true,
            runValidators: true,
        }
    ); 
    
    res.status(201).json({
        status: 'success',
        data: {
        patient: updatedPatient,
        },
    });
    });

// @desc    Delete specific Patient
// @route   DELETE /api/v1/patients/:id
// @access  Private/Admin
exports.deletePatient = factory.deleteOne(Patient);


exports.verifyPatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
        return next(new ApiError('Patient not found', 404));
    }

    patient.verifyAccount = true;
    await patient.save();

    const client = await initWhatsapp();
    const message = `Hello ${patient.firstName}, your registration has been successfully approved. You can now log in and start using your account.`;

    await client.sendMessage(`${patient.phone}@c.us`, message)

    res.status(200).json({
        status: 'success',
        message: 'Patient account verified successfully',
        data: {
            patient
        }
    });
})

exports.declinePatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return next(new apiError('Patient not found', 404));
    }

    if (patient.verifyAccount === true) {
    return next(new apiError('Can not decline a verified patient.', 400));
    }

    const client = await initWhatsapp();
    const message = `Hello ${patient.firstName}, unfortunately your registration could not be approved. Please create a new account with accurate details.`;

    await client.sendMessage(`${patient.phone}@c.us`, message)
    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Patient record deleted and notification sent.',
    });
});



exports.otpForEditPhoneNumber = asyncHandler(async (req, res, next) => {
    const { newphone } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        return next(new apiError('Patient not found', 404));
    }

    if(!patient.verifyAccount) {
        return next(new apiError('Patient account is not verified.', 400));
    }
    
    if (patient.phone === newphone) {
        return next(new apiError('New phone number must be different from the current one.', 400));
    }

    const client = await initWhatsapp();
    const { otp, expiry } = generateOTP();
    const hashedOtp = await crypto.createHash('sha256').update(otp).digest('hex');

    patient.otp = hashedOtp;
    patient.otpExpiry = expiry;
    patient.otpVerified = false;
    
    await patient.save()
    const message = `Hello ${patient.firstName}, your OTP for changing phone number is: ${otp}.\nthis code expires in 5 minutes.`;
    
    await client.sendMessage(`${patient.phone}@c.us`, message);

    res.status(200).json({
        status: 'success',
        message: 'OTP sent to the current phone number for verification.',
        data: {
            patientId: patient._id,
            newPhone: newphone
        }
    });
    
})

exports.verifyOtpForEditPhoneNumber = asyncHandler(async (req, res, next) => {
    // 1) get user based on  reset code
    const hashedOtp = crypto.createHash('sha256').update(req.body.otp).digest('hex');
  
    const patient = await Patient.findOne({ otp: hashedOtp, otpExpiry: { $gt: Date.now() } });
  
    if (!patient) {
      return next(new apiError(`Invalid otp or expired`, 400))
    }
  
    // 2) Reset code valid
    patient.otpVerified = true
  
    await patient.save();
  
    res.status(200).json({ status: 'Success', message: 'otp verified' })
  })


exports.EditPhoneNumber = asyncHandler(async (req, res, next) => {
    // 1) get user based on phone number
    const { newphone } = req.body;
    if (!newphone) {
        return next(new apiError(`new phone number is required`, 400))
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        return next(new apiError(`there is no patient with this  id`, 404))
    }
    // check if reset code verified
    if (!patient.otpVerified) {
        return next(new apiError(`otp has not been verified`, 400))
    }

    patient.phone = newphone;
    patient.isPhoneVerified = true;
    patient.otp = undefined;
    patient.otpExpiry = undefined;
    patient.otpVerified = undefined;



    await patient.save();
    res.status(200).json({
        status: 'success',
        message: 'OTP verified and phone number updated successfully.',
        data: { patient }
    });
})


exports.editMedicalHistory = asyncHandler(async (req, res, next) => {
    const  medicalHistory = req.body.medicalHistory;
    if (!medicalHistory) {
        return next(new apiError('Medical history is required', 400));
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        return next(new apiError('Patient not found', 404));
    }
    patient.medicalHistory = medicalHistory;
    await patient.save();
    res.status(200).json({
        status: 'success',
        message: 'Medical history updated successfully.',
        data: {
            patient
        }
    });
});

exports.editEmail = asyncHandler(async (req, res, next) => {
    const { newEmail } = req.body;
    if (!newEmail) {
        return next(new apiError('New email is required', 400));
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        return next(new apiError('Patient not found', 404));
    }
    if (patient.email === newEmail) {
        return next(new apiError('New email must be different from the current one.', 400));
    }

    patient.email = newEmail;
    await patient.save();
    res.status(200).json({
        status: 'success',
        message: 'Email updated successfully.',
        data: {
            patient
        }
    });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new apiError('Current and new passwords are required', 400));
    }
    
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        return next(new apiError('Patient not found', 404));
    }

    const isMatch = await bcrypt.compare(currentPassword, patient.password);
    if (!isMatch) {
        return next(new apiError('Current password is incorrect', 401));
    }

    if (newPassword === currentPassword) {
        return next(new apiError('New password must be different from the current one.', 400));
    }

    if (newPassword.length < 8) {
        return next(new apiError('New password must be at least 8 characters long.', 400));
    }

    patient.password = newPassword;
    await patient.save();

    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully.',
        data: {
            patient
        }
    });
})
