const Balance = require('../models/Balance');

class BalanceRepository {
    async createBalance(userId, name, initialAmount = 0) {
        const balance = new Balance({ userId, name, amount: initialAmount });
        return balance.save();
    }

    async getBalancesByUserId(userId) {
        return Balance.find({ userId });
    }

    async getBalanceById(balanceId) {
        return Balance.findById(balanceId);
    }

    async updateBalanceAmount(balanceId, amountChange) {
        // amountChange can be negative for expense
        return Balance.findByIdAndUpdate(
            balanceId, 
            { $inc: { amount: amountChange } },
            { new: true }
        );
    }
}

module.exports = new BalanceRepository();
