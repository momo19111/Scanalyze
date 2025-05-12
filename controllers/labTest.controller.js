const factory = require('./factoryHandler');
const labTest = require('../models/labTest.model');
const asyncHandler = require('express-async-handler');



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
exports.createlabTest = asyncHandler(async (req, res) => {
  const { patient, branch, labTechnician, testResults } = req.body;

  if (!Array.isArray(testResults) || testResults.length === 0) {
    res.status(400);
    throw new Error("Test results must be a non-empty array.");
  }

  const now = new Date();
  const savedReports = [];

  for (const result of testResults) {
    const report = new labTest({
      patient,
      branch,
      labTechnician,
      testResults: [result], // isolate each category
      createdAt: now,
      updatedAt: now,
    });

    // This will trigger the pre('save') middleware, and populate patientSnapshot
    await report.save();

    savedReports.push(report);
  }

  res.status(201).json({
    message: `${savedReports.length} lab report(s) created successfully.`,
    reports: savedReports,
  });
});


// @desc    Update specific labTest
// @route   PUT /api/v1/labTests/:id
// @access  Private/Admin
exports.updatelabTest = factory.updateOne(labTest);

// @desc    Delete specific labTest
// @route   DELETE /api/v1/labTests/:id
// @access  Private/Admin
exports.deletelabTest = factory.deleteOne(labTest);


