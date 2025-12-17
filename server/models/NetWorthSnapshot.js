const mongoose = require('mongoose');

const netWorthSnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-(0[1-9]|1[0-2])$/
  },
  totalAssets: {
    type: Number,
    required: true,
    default: 0
  },
  totalDebts: {
    type: Number,
    required: true,
    default: 0
  },
  netWorth: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one snapshot per user per month
netWorthSnapshotSchema.index({ user: 1, month: 1 }, { unique: true });

const NetWorthSnapshot = mongoose.model('NetWorthSnapshot', netWorthSnapshotSchema);

module.exports = NetWorthSnapshot;
