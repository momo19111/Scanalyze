const express = require('express');
const router = express.Router();
const { getPatient,
        getAllPatients,
        createPatient,
        updatePatient,
        deletePatient,
        verifyPatient,
        declinePatient

} = require('../controllers/patient.controller');
const { protect, allowedTo, uploadUserImage, resizeImage } = require('../controllers/auth.controller');
const { createUserValidator, getUserValidator, deleteUserValidator,  updateUserValidator } = require('../utils/validator/patientValidator');

router.use(protect);

router
    .route('/')
    .get(getAllPatients)
    .post(allowedTo('Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'), uploadUserImage, resizeImage, createUserValidator, createPatient);
router
    .route('/verifyPatient/:id')
    .post(allowedTo('Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'), verifyPatient)
router
    .route('/declinePatient/:id')
    .post(allowedTo('Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'), declinePatient)
router
    .route('/:id')
    .get(getUserValidator, getPatient)
    .put(allowedTo('Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'), uploadUserImage,  resizeImage, updateUserValidator, updatePatient)
    .delete(allowedTo('Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'), deleteUserValidator, deletePatient);


module.exports = router;
