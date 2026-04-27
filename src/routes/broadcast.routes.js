const express = require('express');
const { getLiveContent } = require('../controllers/broadcast.controller');

const router = express.Router();

router.get('/:teacherId', getLiveContent);

module.exports = router;
