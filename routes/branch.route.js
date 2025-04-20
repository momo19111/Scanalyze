const express = require('express');
const router = express.Router();

const { getBranch, getAllBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller'); 
const { createBranchValidator, getBranchValidator, deleteBranchValidator, updateBranchValidator } = require('../utils/validator/branchValidator');  
const { protect, allowedTo } = require('../controllers/auth.controller');

router.use(protect, allowedTo('Admin'));

router.route('/')
    .get(getAllBranches)
    .post(createBranchValidator, createBranch);

router.route('/:id')
    .get(getBranchValidator, getBranch)
    .put(updateBranchValidator, updateBranch)
    .delete(deleteBranchValidator, deleteBranch);


module.exports = router;


