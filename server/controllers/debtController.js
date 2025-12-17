const Debt = require('../models/Debt');
const Expense = require('../models/Expense');
const { round2 } = require('../utils/number');

// @desc    Create new debt
// @route   POST /api/debts
// @access  Private
exports.createDebt = async (req, res) => {
  try {
    const { name, principal, remainingBalance, interestRate, monthlyEMI } = req.body;

    // Validation
    if (!name || !principal || remainingBalance === undefined || !interestRate || !monthlyEMI) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, principal, remainingBalance, interestRate, monthlyEMI'
      });
    }

    // Business rule: remainingBalance cannot exceed principal
    if (remainingBalance > principal) {
      return res.status(400).json({
        success: false,
        message: 'Remaining balance cannot exceed principal amount'
      });
    }

    const debt = await Debt.create({
      user: req.userId,
      name,
      principal,
      remainingBalance,
      interestRate,
      monthlyEMI
    });

    res.status(201).json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all debts for user
// @route   GET /api/debts
// @access  Private
exports.getDebts = async (req, res) => {
  try {
    const debts = await Debt.find({ user: req.userId }).sort('-createdAt');

    // Calculate summary
    const summaryRaw = {
      totalPrincipal: 0,
      totalRemainingBalance: 0,
      totalMonthlyEMI: 0,
      debtCount: debts.length
    };

    debts.forEach(debt => {
      summaryRaw.totalPrincipal += debt.principal;
      summaryRaw.totalRemainingBalance += debt.remainingBalance;
      summaryRaw.totalMonthlyEMI += debt.monthlyEMI;
    });

    // Apply rounding to prevent floating-point leaks
    const summary = {
      totalPrincipal: round2(summaryRaw.totalPrincipal),
      totalRemainingBalance: round2(summaryRaw.totalRemainingBalance),
      totalMonthlyEMI: round2(summaryRaw.totalMonthlyEMI),
      debtCount: debts.length
    };

    res.status(200).json({
      success: true,
      count: debts.length,
      summary,
      data: debts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single debt
// @route   GET /api/debts/:id
// @access  Private
exports.getDebt = async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check ownership
    if (debt.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this debt'
      });
    }

    res.status(200).json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
exports.updateDebt = async (req, res) => {
  try {
    let debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check ownership
    if (debt.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this debt'
      });
    }

    // Update allowed fields
    const { name, principal, remainingBalance, interestRate, monthlyEMI } = req.body;
    
    if (name) debt.name = name;
    if (principal !== undefined) debt.principal = principal;
    if (remainingBalance !== undefined) debt.remainingBalance = remainingBalance;
    if (interestRate !== undefined) debt.interestRate = interestRate;
    if (monthlyEMI !== undefined) debt.monthlyEMI = monthlyEMI;

    // Business rule: remainingBalance cannot exceed principal
    if (debt.remainingBalance > debt.principal) {
      return res.status(400).json({
        success: false,
        message: 'Remaining balance cannot exceed principal amount'
      });
    }

    await debt.save();

    res.status(200).json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
exports.deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check ownership
    if (debt.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this debt'
      });
    }

    await debt.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Debt deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Pay EMI (CRITICAL FUNCTION)
// @route   POST /api/debts/:id/pay-emi
// @access  Private
exports.payEMI = async (req, res) => {
  try {
    const { date, note } = req.body;

    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check ownership
    if (debt.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay EMI for this debt'
      });
    }

    // Check if debt is already fully paid
    if (debt.remainingBalance === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debt is already fully paid'
      });
    }

    const emiAmount = debt.monthlyEMI;
    
    // CRITICAL: Calculate interest and principal components
    // Interest = (Remaining Balance × Interest Rate) / 12 months / 100
    const monthlyInterestRate = debt.interestRate / 12 / 100;
    const interestComponent = debt.remainingBalance * monthlyInterestRate;
    const principalComponent = emiAmount - interestComponent;

    // Step 1: Create expense for FULL EMI amount
    // This affects totalSpent and budget calculations
    const expense = await Expense.create({
      user: req.userId,
      amount: emiAmount,
      category: 'EMI',
      bucket: 'needs', // EMIs are essential expenses
      note: note || `EMI payment for ${debt.name}`,
      date: date || new Date()
    });

    // Step 2: Reduce debt's remaining balance by PRINCIPAL component only
    // Interest is already accounted for in the expense
    // DO NOT create an asset for principal repayment - reducing debt increases net worth automatically
    const newBalance = Math.max(0, debt.remainingBalance - principalComponent);
    debt.remainingBalance = newBalance;
    await debt.save();

    res.status(200).json({
      success: true,
      message: 'EMI paid successfully',
      data: {
        debt: {
          id: debt._id,
          name: debt.name,
          previousBalance: debt.remainingBalance + principalComponent,
          newBalance: debt.remainingBalance,
          fullyPaid: debt.remainingBalance === 0
        },
        expense: {
          id: expense._id,
          amount: emiAmount,
          category: expense.category,
          bucket: expense.bucket,
          date: expense.date
        },
        breakdown: {
          totalEMI: emiAmount,
          interestComponent: round2(interestComponent),
          principalComponent: round2(principalComponent)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
