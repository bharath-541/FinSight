const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createDebt,
    getDebts,
    getDebt,
    updateDebt,
    deleteDebt,
    payEMI
} = require('../controllers/debtController');

// All routes are protected (require authentication)
router.use(auth);

router.route('/')
    .get(getDebts)
    .post(createDebt);

// Pay EMI for a specific debt
router.post('/:id/pay-emi', payEMI);

router.route('/:id')
    .get(getDebt)
    .put(updateDebt)
    .delete(deleteDebt);

module.exports = router;
