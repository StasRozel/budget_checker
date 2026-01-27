const { Markup } = require('telegraf');

const mainMenu = Markup.keyboard([
    ['💰 Создать запись', '📊 Просмотреть бюджет'],
    ['➕ Новый баланс', '📈 Статистика'],
    ['🏷️ Добавить тег']
]).resize();

const periodKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Неделя', 'stats_week'), Markup.button.callback('Месяц', 'stats_month')],
    [Markup.button.callback('Год', 'stats_year')]
]);

module.exports = {
    mainMenu,
    periodKeyboard
};
