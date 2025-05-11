const factory = require('./factoryHandler');
const labTest = require('../models/labTest.model');



// @desc    Get list of labTest
// @route   GET /api/v1/labTests
// @access  Private/Admin
exports.getAlllabTests = factory.getAll(labTest);

// @desc    Get specific labTest by id
// @route   GET /api/v1/labTests/:id
// @access  Private/Admin
exports.getlabTest = factory.getOne(labTest);

// @desc    Create labTest
// @route   POST  /api/v1/labTests
// @access  Private/Admin
exports.createlabTest = factory.createOne(labTest);

// @desc    Update specific labTest
// @route   PUT /api/v1/labTests/:id
// @access  Private/Admin
exports.updatelabTest = factory.updateOne(labTest);

// @desc    Delete specific labTest
// @route   DELETE /api/v1/labTests/:id
// @access  Private/Admin
exports.deletelabTest = factory.deleteOne(labTest);


