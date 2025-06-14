const express = require('express');
const router = express.Router();
const { getStaff,
        getAllStaff,
        createStaff,
        updateStaff,
        deleteStaff,
        uploadUserImage,
        resizeImage,
        deActiveStaff,
        activeStaff

} = require('../controllers/staff.controller');
const { protect, allowedTo } = require('../controllers/auth.controller');
const { createUserValidator, getUserValidator, deleteUserValidator, updateUserValidator } = require('../utils/validator/staffValidator');

router.use(protect);

router
    .route('/')
    .get(getAllStaff)
    .post(allowedTo('Admin'), uploadUserImage, resizeImage, createUserValidator, createStaff);
router
    .route('/:id')
    .get(getUserValidator, getStaff)
    .put(allowedTo('Admin'), uploadUserImage, resizeImage, updateUserValidator, updateStaff )
    .delete(allowedTo('Admin'), deleteUserValidator, deleteStaff);

router
    .route('/deactivate/:id')
    .put(allowedTo('Admin'), deActiveStaff);

router
    .route('/activate/:id')
    .put(allowedTo('Admin'), activeStaff);



module.exports = router;