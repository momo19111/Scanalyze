const factory = require('./factoryHandler');
const Patient = require('../models/patient.model');



// @desc    Get list of Patient
// @route   GET /api/v1/patients
// @access  Private/Admin
exports.getAllPatients = factory.getAll(Patient);

// @desc    Get specific Patient by id
// @route   GET /api/v1/patients/:id
// @access  Private/Admin
exports.getPatient = factory.getOne(Patient);

// @desc    Create Patient
// @route   POST  /api/v1/branchs
// @access  Private/Admin
exports.createPatient = factory.createOne(Patient);

// @desc    Update specific Patient
// @route   PUT /api/v1/patients/:id
// @access  Private/Admin
exports.updatePatient = factory.updateOne(Patient);

// @desc    Delete specific Patient
// @route   DELETE /api/v1/patients/:id
// @access  Private/Admin
exports.deletePatient = factory.deleteOne(Patient);


