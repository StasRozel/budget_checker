const { periodKeyboard } = require('../utils/keyboards');
const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');

const showMenu = async (ctx) => {
    await ctx.reply('Выберите период для статистики:', periodKeyboard);
};

const getStats = async (ctx, period) => {
    const user = await userRepository.findByTelegramId(ctx.from.id);
    if (!user) return ctx.reply('Пользователь не найден');

    const now = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const stats = await transactionRepository.getStats(user._id, startDate, now);

    if (stats.length === 0) {
        return ctx.reply('Нет данных за выбранный период.');
    }

    let message = `📊 <b>Статистика за ${period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'год'}:</b>\n\n`;

    stats.forEach(group => {
        const typeIcon = group._id === 'income' ? '📈 Доход' : '📉 Расход';
        message += `<b>${typeIcon}: ${group.total}</b>\n`;
        group.tags.forEach(t => {
            message += `  - ${t.tag}: ${t.amount}\n`;
        });
        message += '\n';
    });

    try {
        await ctx.editMessageText(message, { parse_mode: 'HTML' });
    } catch (e) {
        await ctx.replyWithHTML(message);
    }
};

module.exports = {
    showMenu,
    getStats
};
