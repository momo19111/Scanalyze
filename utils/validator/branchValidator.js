const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Branch = require('../../models/branch.model');

// Validation for creating a branch
exports.createBranchValidator = [
    check('name')
        .notEmpty()
        .withMessage('Branch name is required') // Ensures the branch name is provided
        .isLength({ min: 3 })
        .withMessage('Branch name must be at least 3 characters long') // Minimum length for name
        .custom(async (value) => {
            // Check if a branch with the same name already exists
            const existingBranch = await Branch.findOne({ name: value });
            if (existingBranch) {
                return Promise.reject(new Error('Branch name already exists'));
            }
        }),
    validatorMiddleware,
];

// Validation for getting a branch
exports.getBranchValidator = [
    check('id').isMongoId().withMessage('Invalid Branch id format'),
    validatorMiddleware,
];

// Validation for deleting a branch
exports.deleteBranchValidator = [
    check('id').isMongoId().withMessage('Invalid Branch id format'),
    validatorMiddleware,
];


exports.updateBranchValidator = [
    check('id').isMongoId().withMessage('Invalid Branch id format'),
    check('name')
        .optional() 
        .isLength({ min: 3 })
        .withMessage('Branch name must be at least 3 characters long')
        .custom(async (value, { req }) => {
            if (value) {
                const existingBranch = await Branch.findOne({ name: value });
                if (existingBranch && existingBranch._id.toString() !== req.params.id) {
                    return Promise.reject(new Error('Branch name already exists'));
                }
            }
        }),
    validatorMiddleware,
];
