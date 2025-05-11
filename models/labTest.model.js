const mongoose = require('mongoose');

// Schema for individual test inside a category
const SingleTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  value: { type: String, required: true },
  normalRange: { type: String, required: true },
  unit: { type: String },
  status: { type: String }
}, { _id: false });

// Schema for a category of tests (e.g., CBC, Kidney Function)
const TestCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  tests: {
    type: [SingleTestSchema],
    required: true,
    validate: {
      validator: val => Array.isArray(val) && val.length > 0,
      message: 'Each category must include at least one test.'
    }
  }
}, { _id: false });

// Main Lab schema
const labSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide the patient.']
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Please provide the branch.']
  },
  labTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Please provide the lab technician.']
  },
  testResults: {
    type: [TestCategorySchema],
    required: [true, 'Please provide the test results.']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);
