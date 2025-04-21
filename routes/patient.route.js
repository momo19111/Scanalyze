const express = require('express');
const router = express.Router();
const { getPatient,
        getAllPatients,
        createPatient,
        updatePatient,
        deletePatient,
        verifyPatient

} = require('../controllers/patient.controller');
const { protect, allowedTo, uploadUserImage, resizeImage } = require('../controllers/auth.controller');
const { createUserValidator, getUserValidator, deleteUserValidator,  updateUserValidator } = require('../utils/validator/patientValidator');

router.use(protect, allowedTo('Admin', 'Receptionist'));

router
    .route('/')
    .get(getAllPatients)
    .post(uploadUserImage, resizeImage, createUserValidator, createPatient);
router
    .route('/verifyPatient/:id')
    .post(verifyPatient)
    .get(getUserValidator, getPatient)
    .put(uploadUserImage, resizeImage, updateUserValidator, updatePatient)
    .delete(deleteUserValidator, deletePatient);


module.exports = router;