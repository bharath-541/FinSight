const Expense = require('../models/Expense');

/**
 * Calculate 50/30/20 budget analysis for a given month
 * @param {string} userId - User ID
 * @param {number} monthlyIncome - User's monthly income
 * @param {string} month - Month in YYYY-MM format
 * @returns {Object} Budget analysis with status and insights
 */
const calculateBudget = async (userId, monthlyIncome, month) => {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Get all expenses for the month
    const expenses = await Expense.find({
        user: userId,
        date: { $gte: startDate, $lt: endDate }
    });

    // Calculate totals by bucket
    const needsTotal = expenses
        .filter(e => e.bucket === 'needs')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const wantsTotal = expenses
        .filter(e => e.bucket === 'wants')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const savingsTotal = expenses
        .filter(e => e.bucket === 'savings')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalSpent = needsTotal + wantsTotal + savingsTotal;

    // Calculate percentages
    const needsPercentage = monthlyIncome > 0 ? (needsTotal / monthlyIncome) * 100 : 0;
    const wantsPercentage = monthlyIncome > 0 ? (wantsTotal / monthlyIncome) * 100 : 0;
    const savingsPercentage = monthlyIncome > 0 ? (savingsTotal / monthlyIncome) * 100 : 0;

    // Determine status based on 50/30/20 rule
    let status = 'on_track';
    const warnings = [];

    if (needsPercentage > 50) {
        status = needsPercentage > 60 ? 'off_track' : 'warning';
        warnings.push('Needs spending exceeds 50%');
    }
    if (wantsPercentage > 30) {
        status = wantsPercentage > 40 ? 'off_track' : status === 'on_track' ? 'warning' : status;
        warnings.push('Wants spending exceeds 30%');
    }
    if (savingsPercentage < 20 && monthlyIncome > 0) {
        status = savingsPercentage < 10 ? 'off_track' : status === 'on_track' ? 'warning' : status;
        warnings.push('Savings below 20%');
    }

    return {
        income: monthlyIncome,
        totalSpent,
        needs: {
            amount: needsTotal,
            percentage: parseFloat(needsPercentage.toFixed(2)),
            limit: monthlyIncome * 0.5
        },
        wants: {
            amount: wantsTotal,
            percentage: parseFloat(wantsPercentage.toFixed(2)),
            limit: monthlyIncome * 0.3
        },
        savings: {
            amount: savingsTotal,
            percentage: parseFloat(savingsPercentage.toFixed(2)),
            target: monthlyIncome * 0.2
        },
        status,
        warnings: warnings.length > 0 ? warnings : null
    };
};

/**
 * Calculate additional insights
 */
const calculateInsights = async (userId, monthlyIncome, month) => {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
        user: userId,
        date: { $gte: startDate, $lt: endDate }
    });

    // Safe to spend calculation
    const needsSpent = expenses
        .filter(e => e.bucket === 'needs')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const safeToSpend = Math.max(0, monthlyIncome - needsSpent - (monthlyIncome * 0.2));

    // Top 3 categories
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

    // Daily average
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const dailyAverage = expenses.reduce((sum, e) => sum + e.amount, 0) / daysInMonth;

    // Previous month comparison
    const prevMonthStart = new Date(startDate);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(startDate);

    const prevExpenses = await Expense.find({
        user: userId,
        date: { $gte: prevMonthStart, $lt: prevMonthEnd }
    });

    const currentTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyChange = prevTotal > 0 
        ? parseFloat((((currentTotal - prevTotal) / prevTotal) * 100).toFixed(2))
        : 0;

    // Expense streak (simplified: days where total spending <= daily budget)
    const dailyBudget = monthlyIncome / daysInMonth;
    const expensesByDay = {};
    
    expenses.forEach(expense => {
        const day = new Date(expense.date).toISOString().split('T')[0];
        expensesByDay[day] = (expensesByDay[day] || 0) + expense.amount;
    });

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < daysInMonth; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        
        if (checkDate > today) break;
        
        const dateKey = checkDate.toISOString().split('T')[0];
        const dayTotal = expensesByDay[dateKey] || 0;
        
        if (dayTotal <= dailyBudget) {
            currentStreak++;
        } else {
            currentStreak = 0;
        }
    }

    return {
        safeToSpend: parseFloat(safeToSpend.toFixed(2)),
        topCategories,
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        monthlyComparison: {
            currentMonth: currentTotal,
            previousMonth: prevTotal,
            changePercentage: monthlyChange
        },
        expenseStreak: currentStreak
    };
};

module.exports = {
    calculateBudget,
    calculateInsights
};
