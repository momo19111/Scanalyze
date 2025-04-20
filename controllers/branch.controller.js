const factory = require('./factoryHandler');
const Branch = require('../models/branch.model');



// @desc    Get list of Branch
// @route   GET /api/v1/branches
// @access  Private/Admin
exports.getAllBranches = factory.getAll(Branch);

// @desc    Get specific Branch by id
// @route   GET /api/v1/branches/:id
// @access  Private/Admin
exports.getBranch = factory.getOne(Branch);

// @desc    Create Branch
// @route   POST  /api/v1/branchs
// @access  Private/Admin
exports.createBranch = factory.createOne(Branch);

// @desc    Update specific Branch
// @route   PUT /api/v1/branches/:id
// @access  Private/Admin
exports.updateBranch = factory.updateOne(Branch);

// @desc    Delete specific Branch
// @route   DELETE /api/v1/branches/:id
// @access  Private/Admin
exports.deleteBranch = factory.deleteOne(Branch);


