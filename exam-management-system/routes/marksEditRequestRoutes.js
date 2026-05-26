const express = require('express');
const router = express.Router();

const {
    getAllMarksEditRequests,
    createMarksEditRequest,
    approveMarksEditRequest,
    rejectMarksEditRequest
} = require('../controllers/marksEditRequestController');

// get all marks edit requests
router.get('/', getAllMarksEditRequests);

// create marks edit request
router.post('/', createMarksEditRequest);

// approve request
router.put('/:id/approve', approveMarksEditRequest);

// reject request
router.put('/:id/reject', rejectMarksEditRequest);

module.exports = router;