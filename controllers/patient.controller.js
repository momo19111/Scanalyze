const factory = require('./factoryHandler');
const Patient = require('../models/patient.model');
const asyncHandler = require('express-async-handler')



// @desc    Get list of Patient
// @route   GET /api/v1/patients
// @access  Private/Admin
exports.getAllPatients = factory.getAll(Patient, '');

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
exports.updatePatient = factory.updateOne(Patient);

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

    res.status(200).json({
        status: 'success',
        message: 'Patient account verified successfully',
        data: {
            patient
        }
    });
})

