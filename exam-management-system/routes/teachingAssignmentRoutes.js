const express = require('express');
const router = express.Router();
const teachingAssignmentController = require('../controllers/teachingAssignmentController');

router.post('/', teachingAssignmentController.assignTeacher);
router.get('/', teachingAssignmentController.getAllAssignments);

module.exports = router;