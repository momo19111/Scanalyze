const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Patient = require('../../models/patient.model');


exports.createScanValidator = [
    check('type')
        .notEmpty()
        .withMessage('Scan name is required') 
        .toLowerCase()
        .isIn(['brain scan', 'lung scan (x-ray)', 'kidney scan', 'lung scan (Plasma)', 'retinal scan', 'knee scan'])
        .withMessage('Name must be one of: Brain Scan, Lung Scan (X-Ray), Kidney Scan, Lung Scan (Plasma), Retinal Scan, Knee Scan'),
    
    
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
        .isIn(['brain scan', 'lung scan (x-ray)', 'kidney scan', 'lung scan (Plasma)', 'retinal scan', 'knee scan'])
        .withMessage('Name must be one of: Brain Scan, Lung Scan (X-Ray), Kidney Scan, Lung Scan (Plasma), Retinal Scan, Knee Scan'),
    
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
