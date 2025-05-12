const express = require('express');
const router = express.Router();

const { getAlllabTests, getlabTest, updatelabTest, deletelabTest, createlabTest } = require('../controllers/labTest.controller'); 
const { protect, allowedTo } = require('../controllers/auth.controller');

router.route('/')
    .get(getAlllabTests)
    .post(protect, allowedTo('Admin', 'LabTechnician'), createlabTest);

router.route('/:id')
    .get(getlabTest)
    .put(protect, allowedTo('Admin', 'LabTechnician'), updatelabTest)
    .delete(protect, allowedTo('Admin', 'LabTechnician'), deletelabTest);

module.exports = router;
