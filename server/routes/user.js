const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateIncome } = require('../controllers/userController');

// GET /api/user/profile (spec endpoint)
router.get('/profile', auth, getProfile);

// GET /api/user/me (legacy alias)
router.get('/me', auth, getProfile);

// PUT /api/user/income
router.put('/income', auth, updateIncome);

module.exports = router;
