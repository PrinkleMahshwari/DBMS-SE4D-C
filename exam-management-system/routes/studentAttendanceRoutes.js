const express = require('express');
const router = express.Router();

const {
    getAllAttendance,
    createAttendance
} = require('../controllers/studentAttendanceController');

// get all attendance
router.get('/', getAllAttendance);

// create attendance
router.post('/', createAttendance);

module.exports = router;