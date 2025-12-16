const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateIncome } = require('../controllers/userController');

// GET /api/user/me
router.get('/me', auth, getProfile);

// PUT /api/user/income
router.put('/income', auth, updateIncome);

module.exports = router;
