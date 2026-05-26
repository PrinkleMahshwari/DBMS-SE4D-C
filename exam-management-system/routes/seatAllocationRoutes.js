const express = require('express');
const router = express.Router();
const seatAllocationController = require('../controllers/seatAllocationController');

router.post('/', seatAllocationController.allocateSeat);
router.get('/:schedule_id', seatAllocationController.getSeatsBySchedule);

module.exports = router;