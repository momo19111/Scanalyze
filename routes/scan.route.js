const express = require('express');
const router = express.Router();

const { getScan, getAllScans, createScan, updateScan, deleteScan, uploadUserImage, resizeImage } = require('../controllers/scan.controller'); 
const { getScanValidator, createScanValidator, updateScanValidator, deleteScanValidator } = require('../utils/validator/scanValidator') 
const { protect, allowedTo } = require('../controllers/auth.controller');
router.use(protect, allowedTo('ScanTechnician', 'Admin'));

router.route('/')
    .get(getAllScans)
    .post(uploadUserImage, resizeImage, createScanValidator,createScan);

router.route('/:id')
    .get(getScanValidator, getScan)
    .put(uploadUserImage, resizeImage, updateScanValidator, updateScan)
    .delete(deleteScanValidator, deleteScan);

module.exports = router;


