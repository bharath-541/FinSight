const Asset = require('../models/Asset');
const { round2 } = require('../utils/number');

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private
exports.createAsset = async (req, res) => {
  try {
    const { type, name, currentValue } = req.body;

    // Validation
    if (!type || !name || currentValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, name, and currentValue'
      });
    }

    const asset = await Asset.create({
      user: req.userId,
      type,
      name,
      currentValue
    });

    res.status(201).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all assets for user
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.userId }).sort('-createdAt');

    // Calculate totals by type
    const summaryRaw = {
      totalAssets: 0,
      byType: {
        cash: 0,
        investment: 0,
        property: 0,
        other: 0
      }
    };

    assets.forEach(asset => {
      summaryRaw.totalAssets += asset.currentValue;
      summaryRaw.byType[asset.type] += asset.currentValue;
    });

    // Apply rounding to prevent floating-point leaks
    const summary = {
      totalAssets: round2(summaryRaw.totalAssets),
      byType: {
        cash: round2(summaryRaw.byType.cash),
        investment: round2(summaryRaw.byType.investment),
        property: round2(summaryRaw.byType.property),
        other: round2(summaryRaw.byType.other)
      }
    };

    res.status(200).json({
      success: true,
      count: assets.length,
      summary,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check ownership
    if (asset.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this asset'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
exports.updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check ownership
    if (asset.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this asset'
      });
    }

    // Update only allowed fields
    const { type, name, currentValue } = req.body;
    
    if (type) asset.type = type;
    if (name) asset.name = name;
    if (currentValue !== undefined) asset.currentValue = currentValue;

    await asset.save();

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check ownership
    if (asset.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this asset'
      });
    }

    await asset.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * CRITICAL: Assets must ONLY be created/updated via explicit user actions.
 * 
 * remainingCash is a DERIVED, MONTH-SCOPED metric and must NEVER:
 * - Be stored in the database
 * - Be converted into an asset automatically
 * - Be carried forward to the next month
 * - Influence net worth calculations
 * 
 * Formula: remainingCash = monthlyIncome - totalSpent (for current month only)
 * 
 * When a month ends:
 * - remainingCash expires and resets
 * - Assets remain unchanged unless user explicitly modifies them
 * - Net worth remains: totalAssets - totalDebts
 * 
 * Any auto-asset creation logic has been removed to prevent:
 * - Double counting
 * - Fake money inflation
 * - Incorrect net worth
 * - Violation of real-world financial accounting principles
 */
