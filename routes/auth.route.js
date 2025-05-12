const express = require('express');
const router = express.Router();
const { registerPatientInfo, loginEmail, loginPhone, loginPhonePatient, loginNationalID, getProfile, uploadUserImage, resizeImage } = require('../controllers/auth.controller');
const { loginEmailValidator, loginPhoneValidator, loginNationalIDValidator, registerValidator } = require('../utils/validator/authValidator');
const {sendOtpToWhatsApp, verifyOtp} = require("../controllers/auth.controller");

router.post("/send-otp", sendOtpToWhatsApp);
router.post("/verify-otp", verifyOtp); 
router.post('/staff/registerInfo', uploadUserImage, resizeImage, registerValidator, registerPatientInfo);
router.post('/staff/login/email', loginEmailValidator, loginEmail);
router.post('/staff/login/phone', loginPhoneValidator, loginPhone);
router.post('/patient/login/phone', loginPhoneValidator, loginPhonePatient);
router.post('/patient/login/national-id', loginNationalIDValidator, loginNationalID);
router.get('/patient/getProfile/:patientId', getProfile);


module.exports = router ;