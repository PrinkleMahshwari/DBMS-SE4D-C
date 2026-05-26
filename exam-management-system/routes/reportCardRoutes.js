const express = require('express');
const router = express.Router();
const reportCardController = require('../controllers/reportCardController');

router.post('/', reportCardController.createReportCard);
router.get('/:id', reportCardController.getReportCard);

module.exports = router;