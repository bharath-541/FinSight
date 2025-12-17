const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['cash', 'investment', 'property', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
assetSchema.index({ user: 1, type: 1 });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
