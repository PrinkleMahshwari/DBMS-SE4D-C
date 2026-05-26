const express = require('express');
const router = express.Router();
const invigilationController = require('../controllers/invigilationController');

router.post('/', invigilationController.assignInvigilator);

module.exports = router;