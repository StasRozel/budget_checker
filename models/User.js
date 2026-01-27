const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    customTags: { 
        type: [String], 
        default: ['Еда', 'Транспорт', 'Развлечения', 'Здоровье', 'Зарплата'] 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
