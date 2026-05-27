const express = require('express');
const router = express.Router();

const {
    allocateSeat,
    getAllSeats,
    getSeatsBySchedule,
    updateSeat,
    deleteSeat
} = require('../controllers/seatAllocationController');

// get all seat allocations
router.get('/', getAllSeats);

// get seats by schedule
router.get('/schedule/:schedule_id', getSeatsBySchedule);

// allocate seat
router.post('/', allocateSeat);

// update seat
router.put('/:id', updateSeat);

// delete seat
router.delete('/:id', deleteSeat);

module.exports = router;