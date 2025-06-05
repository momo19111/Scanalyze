const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Patient = require('../../models/patient.model');


exports.createScanValidator = [
    check('type')
        .notEmpty()
        .withMessage('Scan name is required') 
        .toLowerCase()
        .isIn(['brain analysis', 'lung analysis (x-ray)', 'kidney analysis', 'lung analysis (Plasma)', 'retinal analysis', 'knee analysis'])
        .withMessage('Name must be one of: Brain Analysis, Lung Analysis (X-Ray), Kidney Analysis, Lung Analysis (Plasma), Retinal Analysis, Knee Analysis'),
    
    
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
        .isIn(['brain analysis', 'lung analysis (x-ray)', 'kidney analysis', 'lung analysis (Plasma)', 'retinal analysis', 'knee analysis'])
        .withMessage('Name must be one of: Brain Analysis, Lung Analysis (X-Ray), Kidney Analysis, Lung Analysis (Plasma), Retinal Analysis, Knee Analysis'),
    
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
