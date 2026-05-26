const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.createResult);
router.get('/student/:student_id', resultController.getResultsByStudent);

module.exports = router;