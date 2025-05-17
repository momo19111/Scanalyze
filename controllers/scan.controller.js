const factory = require('./factoryHandler');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Scan = require('../models/scan.model');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const Patient = require('../models/patient.model');
const { initWhatsapp } = require('../utils/whatsappClient');

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
exports.getAllScans = factory.getAll(Scan);

// @desc    Get specific Scan by id
// @route   GET /api/v1/Scans/:id
// @access  Private/Admin
exports.getScan = factory.getOne(Scan);

// @desc    Create Scan
// @route   POST  /api/v1/Scans
// @access  Private/Admin
exports.createScan = asyncHandler(async (req, res) => {
const client = await initWhatsapp();
const { patient } = req.body;   
const patient1 = await Patient.findById(patient);
    if (!patient1) {
        return res.status(404).json({
            success: false, message: 'Patient not found'
        });
    }
const scan = await Scan.create(req.body)

const url = `https://scanalyze-fcds.vercel.app/scan/${scan._id}`;
    
const nowFormatted = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        hour12: true
});
const message = `Hello ${patient1.firstName},

Your *${scan.type}* scan results are ready.

Scan Date: ${nowFormatted}

Please view them securely here: ${url}

If you have any questions, feel free to contact us.

Thank you,
Scanalyze Team`;
    
await client.sendMessage(`${patient1.phone}@c.us`, message);
    
res.status(201).json({
        status: 'success',
        data: {
            scan,
        },
    });
})

// @desc    Update specific Scan
// @route   PUT /api/v1/Scans/:id
// @access  Private/Admin
exports.updateScan = factory.updateOne(Scan);

// @desc    Delete specific Scan
// @route   DELETE /api/v1/Scans/:id
// @access  Private/Admin
exports.deleteScan = factory.deleteOne(Scan);