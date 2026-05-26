const express = require('express');
const router = express.Router();
const marksEditRequestController = require('../controllers/marksEditRequestController');

router.post('/', marksEditRequestController.createEditRequest);
router.put('/approve/:id', marksEditRequestController.approveEditRequest);

module.exports = router;