const factory = require('./factoryHandler');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Scan = require('../models/scan.model');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload single image
exports.uploadUserImage = uploadSingleImage('scanImage');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const filename = `scan-${uuidv4()}-${Date.now()}`;

    // Resize and convert image to JPEG buffer
    const buffer = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toBuffer();

  // Upload to Cloudinary using a stream
    await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: 'patient/scan',  // Cloudinary "folder" structure
            public_id: filename,
            resource_type: 'image',
        },
        (error, result) => {
            if (error) return reject(error);
            req.body.scanImage = result.secure_url; // Save Cloudinary image URL
            resolve();
        }
        );
        streamifier.createReadStream(buffer).pipe(upload_stream);
    });

    next();
});

// @desc    Get list of Scan
// @route   GET /api/v1/Scans
// @access  Private/Admin
exports.getAllScans = factory.getAll(Scan, '', {path: 'patient', select: 'firstName lastName gender nationalID phone medicalHistory age -_id'});

// @desc    Get specific Scan by id
// @route   GET /api/v1/Scans/:id
// @access  Private/Admin
exports.getScan = factory.getOne(Scan, {path: 'patient', select: 'firstName lastName gender phone nationalID age medicalHistory -_id'});

// @desc    Create Scan
// @route   POST  /api/v1/Scans
// @access  Private/Admin
exports.createScan = factory.createOne(Scan);

// @desc    Update specific Scan
// @route   PUT /api/v1/Scans/:id
// @access  Private/Admin
exports.updateScan = factory.updateOne(Scan);

// @desc    Delete specific Scan
// @route   DELETE /api/v1/Scans/:id
// @access  Private/Admin
exports.deleteScan = factory.deleteOne(Scan);