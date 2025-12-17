const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getNetWorth,
    getNetWorthHistory,
    createSnapshot
} = require('../controllers/netWorthController');

// All routes are protected (require authentication)
router.use(auth);

// Get current net worth (with optional month query)
router.get('/', getNetWorth);

// Get net worth history (snapshots)
router.get('/history', getNetWorthHistory);

// Create/update snapshot for a month
router.post('/snapshot', createSnapshot);

module.exports = router;
