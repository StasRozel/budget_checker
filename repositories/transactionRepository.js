const Transaction = require('../models/Transaction');

class TransactionRepository {
    async createTransaction(data) {
        const transaction = new Transaction(data);
        return transaction.save();
    }

    async getTransactionsByUserId(userId, startDate, endDate) {
        const query = { userId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        return Transaction.find(query).sort({ date: -1 });
    }
    
    async getStats(userId, startDate, endDate) {
         const match = { userId };
         if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = startDate;
            if (endDate) match.date.$lte = endDate;
        }

        return Transaction.aggregate([
            { $match: match },
            { 
                $group: {
                    _id: { type: "$type", tag: "$tag" },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $group: {
                    _id: "$_id.type",
                    tags: { 
                        $push: { 
                            tag: "$_id.tag", 
                            amount: "$totalAmount" 
                        } 
                    },
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);
    }
}

module.exports = new TransactionRepository();
