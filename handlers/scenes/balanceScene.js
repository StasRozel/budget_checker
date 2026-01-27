const { Scenes, Markup } = require('telegraf');
const balanceRepository = require('../../repositories/balanceRepository');
const userRepository = require('../../repositories/userRepository');

const nameStep = async (ctx) => {
    await ctx.reply('Введите название нового баланса (например: "Наличные", "Вклад"):', Markup.removeKeyboard());
    return ctx.wizard.next();
};

const amountStep = async (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply('Введите начальную сумму (число):');
    return ctx.wizard.next();
};

const finalStep = async (ctx) => {
    const amount = parseFloat(ctx.message.text);
    if (isNaN(amount)) {
        await ctx.reply('Пожалуйста, введите корректное число. Попробуйте снова.');
        return; // Stay on same step
    }
    
    const user = await userRepository.findByTelegramId(ctx.from.id);
    await balanceRepository.createBalance(user._id, ctx.wizard.state.name, amount);
    
    await ctx.reply(`Баланс "${ctx.wizard.state.name}" создан успешно!`, require('../../utils/keyboards').mainMenu);
    return ctx.scene.leave();
};

const createBalanceScene = new Scenes.WizardScene(
    'create_balance_scene',
    nameStep,
    amountStep,
    finalStep
);

module.exports = createBalanceScene;
