const User = require('../models/User');

class UserRepository {
    async findByTelegramId(telegramId) {
        return User.findOne({ telegramId });
    }

    async createUser(userData) {
        const user = new User(userData);
        return user.save();
    }

    async addCustomTag(userId, tag) {
        return User.findByIdAndUpdate(
            userId, 
            { $addToSet: { customTags: tag } },
            { new: true }
        );
    }
    
    async getTags(userId) {
        const user = await User.findById(userId);
        return user ? user.customTags : [];
    }
}

module.exports = new UserRepository();
