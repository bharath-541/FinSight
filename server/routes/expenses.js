const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');

// POST /api/expenses
router.post('/', auth, createExpense);

// GET /api/expenses?month=YYYY-MM
router.get('/', auth, getExpenses);

// PUT /api/expenses/:id
router.put('/:id', auth, updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', auth, deleteExpense);

module.exports = router;
