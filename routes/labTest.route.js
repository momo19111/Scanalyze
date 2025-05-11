const express = require('express');
const router = express.Router();

const { getAlllabTests, getlabTest, updatelabTest, deletelabTest, createlabTest } = require('../controllers/labTest.controller'); 
const { protect, allowedTo } = require('../controllers/auth.controller');

router.use(protect);

router.route('/')
    .get(getAlllabTests)
    .post(allowedTo('Admin', 'LabTechnician'), createlabTest);

router.route('/:id')
    .get(getlabTest)
    .put(allowedTo('Admin', 'LabTechnician'), updatelabTest)
    .delete(allowedTo('Admin', 'LabTechnician'), deletelabTest);

module.exports = router;