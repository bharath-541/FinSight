const User = require('../models/User');
const { calculateBudget, calculateInsights } = require('../services/budgetService');

/**
 * Get budget summary and insights for a month
 * GET /api/summary?month=YYYY-MM
 */
const getSummary = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate month parameter
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Please provide month parameter in YYYY-MM format'
            });
        }

        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month format. Use YYYY-MM'
            });
        }

        // Get user
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has set monthly income
        if (!user.monthlyIncome || user.monthlyIncome === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please set your monthly income first using PUT /api/user/income'
            });
        }

        // Calculate budget analysis
        const budget = await calculateBudget(req.userId, user.monthlyIncome, month);

        // Calculate additional insights
        const insights = await calculateInsights(req.userId, user.monthlyIncome, month);

        res.status(200).json({
            success: true,
            data: {
                month,
                budget,
                insights
            }
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating summary'
        });
    }
};

module.exports = {
    getSummary
};
