const Expense = require('../models/Expense');

/**
 * Create a new expense
 * POST /api/expenses
 */
const createExpense = async (req, res) => {
    try {
        const { amount, category, bucket, note, date } = req.body;

        // Validate required fields
        if (!amount || !category || !bucket) {
            return res.status(400).json({
                success: false,
                message: 'Please provide amount, category, and bucket'
            });
        }

        // Validate bucket
        if (!['needs', 'wants', 'savings'].includes(bucket.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Bucket must be one of: needs, wants, savings'
            });
        }

        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        // Create expense
        const expense = new Expense({
            user: req.userId,
            amount,
            category: category.trim(),
            bucket: bucket.toLowerCase(),
            note: note?.trim(),
            date: date ? new Date(date) : new Date()
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating expense'
        });
    }
};

/**
 * Get expenses with optional month filter
 * GET /api/expenses?month=YYYY-MM
 */
const getExpenses = async (req, res) => {
    try {
        const { month, bucket, category } = req.query;
        const query = { user: req.userId };

        // Filter by month if provided
        if (month) {
            // Validate month format
            if (!/^\d{4}-\d{2}$/.test(month)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid month format. Use YYYY-MM'
                });
            }

            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            query.date = {
                $gte: startDate,
                $lt: endDate
            };
        }

        // Filter by bucket if provided
        if (bucket) {
            if (!['needs', 'wants', 'savings'].includes(bucket.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Bucket must be one of: needs, wants, savings'
                });
            }
            query.bucket = bucket.toLowerCase();
        }

        // Filter by category if provided
        if (category) {
            query.category = new RegExp(category.trim(), 'i'); // Case-insensitive match
        }

        // Get expenses sorted by date (newest first)
        const expenses = await Expense.find(query).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching expenses'
        });
    }
};

/**
 * Update an expense
 * PUT /api/expenses/:id
 */
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, bucket, note, date } = req.body;

        // Find expense and verify ownership
        const expense = await Expense.findOne({ _id: id, user: req.userId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Validate bucket if provided
        if (bucket && !['needs', 'wants', 'savings'].includes(bucket.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Bucket must be one of: needs, wants, savings'
            });
        }

        // Validate amount if provided
        if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        // Update fields
        if (amount !== undefined) expense.amount = amount;
        if (category) expense.category = category.trim();
        if (bucket) expense.bucket = bucket.toLowerCase();
        if (note !== undefined) expense.note = note?.trim();
        if (date) expense.date = new Date(date);

        await expense.save();

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating expense'
        });
    }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete expense, verify ownership
        const expense = await Expense.findOneAndDelete({ _id: id, user: req.userId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting expense'
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense
};
