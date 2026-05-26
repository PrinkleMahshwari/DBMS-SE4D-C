const express = require('express');
const router = express.Router();

const {
    createResult,
    getAllResults,
    getResultsByStudent
} = require('../controllers/resultController');

// Get all results
router.get('/', getAllResults);

// Get results by student
router.get('/student/:student_id', getResultsByStudent);

// Create result
router.post('/', createResult);

module.exports = router;