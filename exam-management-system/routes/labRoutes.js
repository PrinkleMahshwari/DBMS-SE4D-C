const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

router.post('/', labController.createLab);
router.get('/', labController.getAllLabs);

module.exports = router;