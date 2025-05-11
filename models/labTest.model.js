const mongoose = require('mongoose');

const SingleTestSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    value: { type: String, required: true },
    normalRange: { type: String, required: true },
    unit: { type: String },
    status: { type: String } 
}, { _id: false });

const TestCategorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    tests: [SingleTestSchema]
}, { _id: false });

const labSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide the patient.']
    },
    branch: {
        type: mongoose.Schema.ObjectId,
        ref: 'Branch',
        required: [true, 'Please provide the branch.']
    },
    labTechnician: {
        type: mongoose.Schema.ObjectId,
        ref: 'Staff',
        required: [true, 'Please provide the lab technician.']
    },
    testResults: {
        type: [TestCategorySchema],
        required: [true, 'Please provide the test results.']
    },
})


module.exports = mongoose.model('Lab', labSchema);