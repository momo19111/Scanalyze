const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Staff = require('../../models/staff.model');

exports.createUserValidator = [


    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
        Staff.findOne({ email: val }).then((user) => {
            if (user) {
            return Promise.reject(new Error('E-mail already in user'));
            }
        })
        ),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),


    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers')
        .custom((val) =>
            Staff.findOne({ phone: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('phone number already in user'));
                    }
            })
        ),
    ,

    body('nationalId')
        .notEmpty()
        .withMessage('National ID required')
        .isLength({ min: 14, max: 14 }) 
        .withMessage('National ID must be exactly 14 characters long')
        .custom((val) =>
            Staff.findOne({nationalId: val }).then((user) => {
            if (user) {
            return Promise.reject(new Error('national id already in user'));
            }
        })
        ),

    check('profileImg').optional(),
    check('role')
        .notEmpty()
        .withMessage('Role required'),

    validatorMiddleware,
];


exports.getUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware,
];



exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware,
];


exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),

    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val, { req }) => {
            const staffId = req.params.id;
            
            if (!staffId) {
                return Promise.reject(new Error('Staff ID is required'));
            }

            return Staff.findById(staffId)
                .then((staff) => {
                    if (!staff) {
                    return Promise.reject(new Error('Staff not found'));
                    }
                    const currentStaffEmail = staff.email; 

                    if (val === currentStaffEmail) {
                        return true; 
                    }

            return Staff.findOne({ email: val }).then((user) => {
                    if (user) {
                        return Promise.reject(new Error('E-mail already in use by another user'));
                    }
                });
            });
        }),
    
    body('nationalId')
        .notEmpty()
        .withMessage('National ID required')
        .isLength({ min: 14, max: 14 }) 
        .withMessage('National ID must be exactly 14 characters long')
        .custom((val, { req }) => {
            const staffId = req.params.id;

            if (!staffId) {
                return Promise.reject(new Error('Staff ID is required'));
            }


            return Staff.findById(staffId)
                .then((staff) => {
                    if (!staff) {
                        return Promise.reject(new Error('Staff not found'));
                    }
                    const currentStaffNationalId = staff.nationalId; 

                    if (val === currentStaffNationalId) {
                        return true; 
                    }

            return Staff.findOne({ nationalId: val }).then((user) => {
                    if (user) {
                        return Promise.reject(new Error('nationalId already in use by another user'));
                    }
                });
            });
        }),,

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers')
        .custom((val, { req }) => {
            const staffId = req.params.id;

            if (!staffId) {
                return Promise.reject(new Error('Staff ID is required'));
            }


            return Staff.findById(staffId)
                .then((staff) => {
                    if (!staff) {
                        return Promise.reject(new Error('Staff not found'));
                    }
                    const currentStaffPhone = staff.phone; 

                    if (val === currentStaffPhone) {
                        return true; 
                    }

            return Staff.findOne({ phone: val }).then((user) => {
                    if (user) {
                        return Promise.reject(new Error('Phone already in use by another user'));
                    }
                });
            });
        }),
    

    check('profileImg').optional(),
    
    check('role')
        .notEmpty()
        .withMessage('Role required'),
    validatorMiddleware,
];