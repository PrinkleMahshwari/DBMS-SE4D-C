const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');

router.post('/', marksController.createMarks);
router.get('/student/:student_id', marksController.getMarksByStudent);

module.exports = router;