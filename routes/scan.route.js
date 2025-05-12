const express = require('express');
const router = express.Router();

const { getScan, getAllScans, createScan, updateScan, deleteScan, uploadUserImage, resizeImage } = require('../controllers/scan.controller'); 
const { getScanValidator, createScanValidator, updateScanValidator, deleteScanValidator } = require('../utils/validator/scanValidator') 
const { protect, allowedTo } = require('../controllers/auth.controller');

router.route('/')
    .get(getAllScans)
    .post(protect, allowedTo('ScanTechnician', 'Admin'), uploadUserImage, resizeImage, createScanValidator,createScan);

router.route('/:id')
    .get(getScanValidator, getScan)
    .put(protect, allowedTo('ScanTechnician', 'Admin'), uploadUserImage, resizeImage, updateScanValidator, updateScan)
    .delete(protect, allowedTo('ScanTechnician', 'Admin'), deleteScanValidator, deleteScan);

module.exports = router;


