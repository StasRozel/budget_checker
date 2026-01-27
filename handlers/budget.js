const balanceRepository = require('../repositories/balanceRepository');
const userRepository = require('../repositories/userRepository');

module.exports = async (ctx) => {
    const user = await userRepository.findByTelegramId(ctx.from.id);
    if (!user) return ctx.reply('Пожалуйста, введите /start');

    const balances = await balanceRepository.getBalancesByUserId(user._id);
    
    if (balances.length === 0) {
        return ctx.reply('У вас пока нет счетов.');
    }

    let message = '💰 <b>Ваш бюджет:</b>\n\n';
    let total = 0;

    balances.forEach(b => {
        message += `🔹 ${b.name}: ${b.amount}\n`;
        total += b.amount;
    });

    message += `\n<b>Всего:</b> ${total}`;
    
    await ctx.replyWithHTML(message);
};
