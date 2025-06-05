const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const factory = require('./factoryHandler');
const Staff = require('../models/staff.model');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');


// Upload single image
exports.uploadUserImage = uploadSingleImage('imageProfile');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const filename = `profile-${uuidv4()}-${Date.now()}`;

    const buffer = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toBuffer();

    await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: 'staff/profile', 
            public_id: filename,
            resource_type: 'image',
        },
        (error, result) => {
            if (error) return reject(error);
            req.body.imageProfile = result.secure_url; 
            resolve();
        }
        );
        streamifier.createReadStream(buffer).pipe(upload_stream);
    });

    next();
});
// @desc    Get list of staff
// @route   GET /api/v1/staff
// @access  Private/Admin
exports.getAllStaff = factory.getAll(Staff, '', { path: 'branch', select: 'name _id' })

// @desc    Get specific staff by id
// @route   GET /api/v1/staff/:id
// @access  Private/Admin
exports.getStaff = factory.getOne(Staff,  { path: 'branch', select: 'name _id' });

// @desc    Create Staff
// @route   POST  /api/v1/staffs
// @access  Private/Admin
exports.createStaff = factory.createOne(Staff);

// @desc    Update specific Staff
// @route   PUT /api/v1/staffs/:id
// @access  Private/Admin
exports.updateStaff = factory.updateOne(Staff);

// @desc    Delete specific Staff
// @route   DELETE /api/v1/Staffs/:id
// @access  Private/Admin
exports.deleteStaff = factory.deleteOne(Staff);

// exports.changeStaffPassword = asyncHandler(async (req, res, next) => {
//     const document = await Staff.findByIdAndUpdate(
//         req.params.id,
//         {
//         password: await bcrypt.hash(req.body.password, 12),
//         passwordChangedAt: Date.now(),
//         },
//         {
//         new: true,
//         }
//     );

//     if (!document) {
//         return next(new ApiError(`No document for this id ${req.params.id}`, 404));
//     }
//     res.status(200).json({ data: document });
// });


// // @desc    Get Logged Staff data
// // @route   GET /api/v1/Staffs/getMe
// // @access  Private/Protect
// exports.getLoggedStaffData = asyncHandler(async (req, res, next) => {
//     req.params.id = req.Staff._id;
//     next();
// });

// // @desc    Update logged Staff password
// // @route   PUT /api/v1/Staffs/updateMyPassword
// // @access  Private/Protect
// exports.updateLoggedStaffPassword = asyncHandler(async (req, res, next) => {
//   // 1) Update Staff password based Staff payload (req.Staff._id)
//     const Staff = await Staff.findByIdAndUpdate(
//         req.user._id,
//         {
//         password: await bcrypt.hash(req.body.password, 12),
//         passwordChangedAt: Date.now(),
//         },
//         {
//         new: true,
//         }
//     );

//     // 2) Generate token
//     const token = createToken(user._id);

//     res.status(200).json({ data: user, token });
// });

// // @desc    Update logged user data (without password, role)
// // @route   PUT /api/v1/users/updateMe
// // @access  Private/Protect
// exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
//     const updatedUser = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//         name: req.body.name,
//         email: req.body.email,
//         phone: req.body.phone,
//         },
//         { new: true }
//     );

//     res.status(200).json({ data: updatedUser });
// });

// // @desc    Deactivate logged user
// // @route   DELETE /api/v1/users/deleteMe
// // @access  Private/Protect
// exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
//     await User.findByIdAndUpdate(req.user._id, { active: false });

//     res.status(204).json({ status: 'Success' });
// });
