
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/staff.model');
const Patient = require('../../models/patient.model');

exports.registerValidator = [
    check('firstName')
        .notEmpty()
        .withMessage('name required')
        .isLength({ min: 3 })
        .withMessage('Too short User name'),
    
    check('lastName')
        .notEmpty()
        .withMessage('name required')
        .isLength({ min: 3 })
        .withMessage('Too short User name'),
    
    check('gender')
        .notEmpty()
        .withMessage('Gender is required'),
    
    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email'),
    

    check('nationalID')
        .notEmpty()
        .withMessage('nationalID required')
        .isLength({ min: 14, max: 14 })
        .withMessage('nationalID must be exactly 14 characters long')
        .custom((val) =>
        Patient.findOne({ nationalID: val }).then((user) => {
            if (user) {
            return Promise.reject(new Error('nationalID already exists'));
            }
        })
        ),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validatorMiddleware,
];

exports.loginEmailValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    


    validatorMiddleware,
];

exports.loginPhoneValidator = [
    check('phone')
        .notEmpty()
        .withMessage('phone required')
        .isMobilePhone('any')
        .withMessage('Invalid phone number'),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    

    validatorMiddleware,
];

exports.loginNationalIDValidator = [
    check('nationalID')
        .notEmpty()
        .withMessage('nationalID required')
        .isLength({ min: 14, max: 14 })
        .withMessage('nationalID must be exactly 14 characters long'),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    

    validatorMiddleware,
];