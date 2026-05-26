const express = require('express');
const router = express.Router();

const {
    getAllAttendanceMarks,
    createAttendanceMarks
} = require('../controllers/attendanceMarksController');

// get all attendance marks
router.get('/', getAllAttendanceMarks);

// create attendance marks
router.post('/', createAttendanceMarks);

module.exports = router;