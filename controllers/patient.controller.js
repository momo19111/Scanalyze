const factory = require('./factoryHandler');
const Patient = require('../models/patient.model');
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');
const { initWhatsapp } = require('../utils/whatsappClient');



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

