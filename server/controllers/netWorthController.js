const Asset = require('../models/Asset');
const Debt = require('../models/Debt');
const NetWorthSnapshot = require('../models/NetWorthSnapshot');
const { round2 } = require('../utils/number');

// @desc    Get current net worth
// @route   GET /api/net-worth
// @access  Private
exports.getNetWorth = async (req, res) => {
  try {
    const { month } = req.query;

    // Calculate current net worth from assets and debts
    const assets = await Asset.find({ user: req.userId });
    const debts = await Debt.find({ user: req.userId });

    // CRITICAL: Net worth is DERIVED, never stored directly
    // Formula: Net Worth = Total Assets - Total Debts (remainingBalance)
    const totalAssetsRaw = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDebtsRaw = debts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
    
    // Apply rounding at response level only
    const totalAssets = round2(totalAssetsRaw);
    const totalDebts = round2(totalDebtsRaw);
    const netWorth = round2(totalAssetsRaw - totalDebtsRaw);

    // Breakdown by asset type
    const assetBreakdown = {
      cash: 0,
      investment: 0,
      property: 0,
      other: 0
    };

    assets.forEach(asset => {
      assetBreakdown[asset.type] += asset.currentValue;
    });

    // If month is provided, also return snapshot
    let snapshot = null;
    if (month) {
      snapshot = await NetWorthSnapshot.findOne({ 
        user: req.userId, 
        month 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        current: {
          totalAssets,
          totalDebts,
          netWorth,
          assetBreakdown,
          assetCount: assets.length,
          debtCount: debts.length
        },
        snapshot: snapshot || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get net worth history (snapshots)
// @route   GET /api/net-worth/history
// @access  Private
exports.getNetWorthHistory = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const snapshots = await NetWorthSnapshot
      .find({ user: req.userId })
      .sort('-month')
      .limit(parseInt(limit));

    // Calculate trends
    let trend = null;
    if (snapshots.length >= 2) {
      const latest = snapshots[0];
      const previous = snapshots[1];
      const change = latest.netWorth - previous.netWorth;
      const percentageChange = previous.netWorth !== 0 
        ? (change / Math.abs(previous.netWorth)) * 100 
        : 0;

      trend = {
        change: round2(change),
        percentageChange: round2(percentageChange),
        direction: change >= 0 ? 'up' : 'down'
      };
    }

    res.status(200).json({
      success: true,
      count: snapshots.length,
      trend,
      data: snapshots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create or update net worth snapshot for a month
// @route   POST /api/net-worth/snapshot
// @access  Private (called internally by summary controller)
exports.createSnapshot = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid month in format YYYY-MM'
      });
    }

    // Calculate current totals
    const assets = await Asset.find({ user: req.userId });
    const debts = await Debt.find({ user: req.userId });

    const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDebts = debts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
    const netWorth = totalAssets - totalDebts;

    // Upsert snapshot (update if exists, create if not)
    const snapshot = await NetWorthSnapshot.findOneAndUpdate(
      { user: req.userId, month },
      { totalAssets, totalDebts, netWorth },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Internal function to calculate net worth (no HTTP response)
// @usage   Called by summaryController
exports.calculateNetWorth = async (userId) => {
  try {
    const assets = await Asset.find({ user: userId });
    const debts = await Debt.find({ user: userId });

    const totalAssetsRaw = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDebtsRaw = debts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
    
    // Round at response level
    const totalAssets = round2(totalAssetsRaw);
    const totalDebts = round2(totalDebtsRaw);
    const netWorth = round2(totalAssetsRaw - totalDebtsRaw);

    return {
      totalAssets,
      totalDebts,
      netWorth
    };
  } catch (error) {
    throw new Error(`Failed to calculate net worth: ${error.message}`);
  }
};

// @desc    Internal function to create/update snapshot (no HTTP response)
// @usage   Called by summaryController
exports.saveSnapshot = async (userId, month) => {
  try {
    const assets = await Asset.find({ user: userId });
    const debts = await Debt.find({ user: userId });

    const totalAssetsRaw = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDebtsRaw = debts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
    
    // Round before saving snapshot
    const totalAssets = round2(totalAssetsRaw);
    const totalDebts = round2(totalDebtsRaw);
    const netWorth = round2(totalAssetsRaw - totalDebtsRaw);

    const snapshot = await NetWorthSnapshot.findOneAndUpdate(
      { user: userId, month },
      { totalAssets, totalDebts, netWorth },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return snapshot;
  } catch (error) {
    throw new Error(`Failed to save snapshot: ${error.message}`);
  }
};
