const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Patient = require('../../models/patient.model');

exports.createUserValidator = [


    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
        Patient.findOne({ email: val }).then((user) => {
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
    
    check('gender')
        .notEmpty()
        .withMessage('Gender required'),
    
    check('firstName')
        .notEmpty()     
        .withMessage('First name required')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long'),
    
    check('lastName')
        .notEmpty()     
        .withMessage('Last name required')
        .isLength({ min: 3 })
        .withMessage('Last name must be at least 3 characters long'),
        
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers')
        .custom((val) =>
            Patient.findOne({ phone: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('phone number already in user'));
                    }
            })
        ),
    ,

    body('nationalID')
        .notEmpty()
        .withMessage('National ID required')
        .isLength({ min: 14, max: 14 }) 
        .withMessage('National ID must be exactly 14 characters long')
        .custom((val) =>
            Patient.findOne({nationalID: val }).then((user) => {
            if (user) {
            return Promise.reject(new Error('national id already in user'));
            }
        })
        ),

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
            const PatientId = req.params.id;
            
            if (!PatientId) {
                return Promise.reject(new Error('Patient ID is required'));
            }

            return Patient.findById(PatientId)
                .then((Patient) => {
                    if (!Patient) {
                    return Promise.reject(new Error('Patient not found'));
                    }
                    const currentPatientEmail = Patient.email; 

                    if (val === currentPatientEmail) {
                        return true; 
                    }
            });
        }),
    
    body('nationalID')
        .notEmpty()
        .withMessage('National ID required')
        .isLength({ min: 14, max: 14 }) 
        .withMessage('National ID must be exactly 14 characters long')
        .custom((val, { req }) => {
            const PatientId = req.params.id;

            if (!PatientId) {
                return Promise.reject(new Error('Patient ID is required'));
            }


            return Patient.findById(PatientId)
                .then((Patient) => {
                    if (!Patient) {
                        return Promise.reject(new Error('Patient not found'));
                    }
                    const currentPatientNationalId = Patient.nationalID; 

                    if (val === currentPatientNationalId) {
                        return true; 
                    }

            });
        }),,

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers')
        .matches(/^201(0|1|2|5)[0-9]{8}$/)
        .withMessage('Please enter a valid Egyptian phone number starting with 2010, 2011, 2012, or 2015')
        .custom((val, { req }) => {
            const PatientId = req.params.id;

            if (!PatientId) {
                return Promise.reject(new Error('Patient ID is required'));
            }


            return Patient.findById(PatientId)
                .then((Patient) => {
                    if (!Patient) {
                        return Promise.reject(new Error('Patient not found'));
                    }
                    const currentPatientPhone = Patient.phone; 

                    if (val === currentPatientPhone) {
                        return true; 
                    }
            });
        }),
    validatorMiddleware,
];