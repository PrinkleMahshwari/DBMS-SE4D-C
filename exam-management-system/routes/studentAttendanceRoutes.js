const express = require('express');
const router = express.Router();
const studentAttendanceController = require('../controllers/studentAttendanceController');

router.post('/', studentAttendanceController.recordAttendance);

module.exports = router;