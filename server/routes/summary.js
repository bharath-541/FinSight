const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSummary } = require('../controllers/summaryController');

// GET /api/summary?month=YYYY-MM
router.get('/', auth, getSummary);

module.exports = router;
