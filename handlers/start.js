const userRepository = require('../repositories/userRepository');
const balanceRepository = require('../repositories/balanceRepository');
const { mainMenu } = require('../utils/keyboards');

module.exports = async (ctx) => {
    const { id, username, first_name } = ctx.from;
    
    let user = await userRepository.findByTelegramId(id);
    if (!user) {
        user = await userRepository.createUser({
            telegramId: id,
            username,
            firstName: first_name
        });
        
        // Create default balance
        await balanceRepository.createBalance(user._id, 'Основной', 0);
        await ctx.reply(`Привет, ${first_name}! Я бот для учета финансов. Я создал для тебя баланс "Основной".`, mainMenu);
    } else {
        await ctx.reply(`С возвращением, ${first_name}!`, mainMenu);
    }
};
