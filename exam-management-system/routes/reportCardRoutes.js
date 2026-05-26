const express = require('express');
const router = express.Router();

const {
    createReportCard,
    getAllReportCards,
    getReportCard
} = require('../controllers/reportCardController');

// Get all report cards
router.get('/', getAllReportCards);

// Get single report card
router.get('/:id', getReportCard);

// Create report card
router.post('/', createReportCard);

module.exports = router;