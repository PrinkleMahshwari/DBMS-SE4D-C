const express = require('express');
const router = express.Router();
const classTeacherAssignmentController = require('../controllers/classTeacherAssignmentController');

router.post('/', classTeacherAssignmentController.assignClassTeacher);

module.exports = router;