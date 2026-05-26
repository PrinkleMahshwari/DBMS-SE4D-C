const express = require('express');
const router = express.Router();
const attendanceMarksController = require('../controllers/attendanceMarksController');

router.post('/', attendanceMarksController.createAttendanceMarks);

module.exports = router;