const express = require('express');
const router = express.Router();

const { getBranch, getAllBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller'); 
const { createBranchValidator, getBranchValidator, deleteBranchValidator, updateBranchValidator } = require('../utils/validator/branchValidator');  
const { protect, allowedTo } = require('../controllers/auth.controller');

router.use(protect);

router.route('/')
    .get(getAllBranches)
    .post(allowedTo('Admin'), createBranchValidator, createBranch);

router.route('/:id')
    .get(getBranchValidator, getBranch)
    .put(allowedTo('Admin'), updateBranchValidator, updateBranch)
    .delete(allowedTo('Admin'), deleteBranchValidator, deleteBranch);


module.exports = router;


