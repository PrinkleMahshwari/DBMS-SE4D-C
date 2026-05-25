const express = require('express');
const router = express.Router();
const classSubjectController = require('../controllers/classSubjectController');

router.post('/', classSubjectController.addSubjectToClass);
router.get('/:class_id', classSubjectController.getSubjectsByClass);

module.exports = router;