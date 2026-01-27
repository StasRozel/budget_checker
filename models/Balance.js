const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g., "Cash", "Card"
    amount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique balance names per user
balanceSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);
