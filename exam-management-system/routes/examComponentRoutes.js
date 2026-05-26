const express = require('express');
const router = express.Router();
const examComponentController = require('../controllers/examComponentController');

router.post('/', examComponentController.createComponent);
router.get('/:exam_id', examComponentController.getComponentsByExam);

module.exports = router;