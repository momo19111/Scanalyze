const factory = require('./factoryHandler');
const labTest = require('../models/labTest.model');
const Patient = require('../models/patient.model');
const { initWhatsapp } = require('../utils/whatsappClient');
const asyncHandler = require('express-async-handler');



// @desc    Get list of labTest
// @route   GET /api/v1/labTests
// @access  Private/Admin
exports.getAlllabTests = factory.getAll(labTest, 'Branch',  { path: 'branch', select: 'name _id' });

// @desc    Get specific labTest by id
// @route   GET /api/v1/labTests/:id
// @access  Private/Admin
exports.getlabTest = factory.getOne(labTest, { path: 'branch', select: 'name _id' });

// @desc    Create labTest
// @route   POST  /api/v1/labTests
// @access  Private/Admin
exports.createlabTest = asyncHandler(async (req, res) => {
  const client = await initWhatsapp();
  const { patient, branch, labTechnician, testResults } = req.body;

  if (!Array.isArray(testResults) || testResults.length === 0) {
    res.status(400);
    throw new Error("Test results must be a non-empty array.");
  }

  const patient1 = await Patient.findById(patient);
  if (!patient1) {
    return res.status(404).json({
      success: false, message: 'Patient not found'
    });
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
    const url = `https://scanalyze-fcds.vercel.app/test/${report._id}`;
    const nowFormatted = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      hour12: true
    });
const message = `Hello ${patient1.firstName},

Your *${report.testResults[0].category}* test results are ready.

Test Date: ${nowFormatted}

Please view them securely here: ${url}

If you have any questions, feel free to contact us.

Thank you,
Scanalyze Team`;
    await client.sendMessage(`${patient1.phone}@c.us`, message);
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


