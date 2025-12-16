const User = require('../models/User');

/**
 * Get current user profile
 * GET /api/user/me
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome,
                age: user.age,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

/**
 * Update monthly income
 * PUT /api/user/income
 */
const updateIncome = async (req, res) => {
    try {
        const { monthlyIncome } = req.body;

        // Validate input
        if (monthlyIncome === undefined || monthlyIncome === null) {
            return res.status(400).json({
                success: false,
                message: 'Please provide monthlyIncome'
            });
        }

        if (typeof monthlyIncome !== 'number' || monthlyIncome < 0) {
            return res.status(400).json({
                success: false,
                message: 'Monthly income must be a positive number'
            });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.userId,
            { monthlyIncome },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Monthly income updated successfully',
            data: {
                monthlyIncome: user.monthlyIncome
            }
        });
    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating income'
        });
    }
};

module.exports = {
    getProfile,
    updateIncome
};
