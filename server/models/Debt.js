const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  principal: {
    type: Number,
    required: true,
    min: 0
  },
  remainingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  monthlyEMI: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for user queries
debtSchema.index({ user: 1 });

const Debt = mongoose.model('Debt', debtSchema);

module.exports = Debt;
