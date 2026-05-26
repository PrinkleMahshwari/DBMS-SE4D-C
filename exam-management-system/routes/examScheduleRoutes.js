const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');

router.post('/', examScheduleController.createSchedule);
router.get('/', examScheduleController.getAllSchedules);
router.put('/approve/:id', examScheduleController.approveSchedule);

module.exports = router;