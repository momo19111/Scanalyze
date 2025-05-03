const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Patient = require('../../models/patient.model');


exports.createScanValidator = [
    check('type')
        .notEmpty()
        .withMessage('Scan name is required') 
        .toLowerCase()
        .isIn(['pneumonia', 'lung cancer', 'kidney diseases', 'covid-19', 'knee osteoarthritis', 'diabetic retinopathy'])
        .withMessage('Name must be one of: Pneumonia, Lung Cancer, Kidney Diseases, Covid-19, Knee Osteoarthrit'),
    
    
    check('patient')
        .notEmpty()
        .withMessage('Patient id is required') 
        .isMongoId()
        .withMessage('Invalid Patient id format')
        .custom(async (value) => {
            const existingPatient = await Patient.findOne({ _id: value });
            if (!existingPatient) {
                return Promise.reject(new Error('Patient not found'));
            }
        }),
    validatorMiddleware,
]

exports.getScanValidator = [
    check('id').isMongoId().withMessage('Invalid Scan id format'),
    validatorMiddleware,
];

exports.deleteScanValidator = [
    check('id').isMongoId().withMessage('Invalid Scan id format'),
    validatorMiddleware,
];

exports.updateScanValidator = [
    check('id').isMongoId().withMessage('Invalid Scan id format'),
    check('type')
        .optional() 
        .toLowerCase()
        .isIn(['pneumonia', 'lung cancer', 'kidney diseases', 'covid-19', 'knee osteoarthritis', 'diabetic retinopathy'])
        .withMessage('Name must be one of: Pneumonia, Lung Cancer, Kidney Diseases, Covid-19, Knee Osteoarthritis, Diabetic Retinopathy'),
    
    check('patient')
        .optional() 
        .isMongoId()
        .withMessage('Invalid Patient id format')
        .custom(async (value) => {
            const existingPatient = await Patient.findOne({ _id: value });
            if (!existingPatient) {
                return Promise.reject(new Error('Patient not found'));
            }
        }),
    validatorMiddleware,
];
