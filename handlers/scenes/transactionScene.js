const { Scenes, Markup } = require('telegraf');
const balanceRepository = require('../../repositories/balanceRepository');
const userRepository = require('../../repositories/userRepository');
const transactionRepository = require('../../repositories/transactionRepository');

const typeStep = async (ctx) => {
    await ctx.reply('Выберите тип операции:', Markup.keyboard([
        ['Доход', 'Расход']
    ]).oneTime().resize());
    return ctx.wizard.next();
};

const balanceStep = async (ctx) => {
    const typeMap = { 'Доход': 'income', 'Расход': 'expense' };
    const type = typeMap[ctx.message.text];
    
    if (!type) {
        await ctx.reply('Пожалуйста, выберите "Доход" или "Расход" используя кнопки.');
        return; 
    }
    
    ctx.wizard.state.type = type;
    
    const user = await userRepository.findByTelegramId(ctx.from.id);
    const balances = await balanceRepository.getBalancesByUserId(user._id);
    
    if (balances.length === 0) {
        await ctx.reply('У вас нет балансов. Сначала создайте баланс.');
        return ctx.scene.leave();
    }
    
    const buttons = balances.map(b => `${b.name} (${b.amount})`);
    ctx.wizard.state.balancesPreview = balances; // Store to find ID later
    
    await ctx.reply('Выберите баланс:', Markup.keyboard(buttons.map(b => [b])).oneTime().resize());
    return ctx.wizard.next();
};

const amountStep = async (ctx) => {
    const selectedBalanceName = ctx.message.text.split(' (')[0]; // simple parsing
    const balance = ctx.wizard.state.balancesPreview.find(b => b.name === selectedBalanceName);
    
    if (!balance) {
         await ctx.reply('Баланс не найден. Попробуйте снова или отмените /cancel.');
         return; 
    }
    
    ctx.wizard.state.balanceId = balance._id;
    
    await ctx.reply('Введите сумму:', Markup.removeKeyboard());
    return ctx.wizard.next();
};

const tagStep = async (ctx) => {
    const amount = parseFloat(ctx.message.text);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply('Введите корректную положительную сумму.');
        return;
    }
    
    ctx.wizard.state.amount = amount;
    
    const user = await userRepository.findByTelegramId(ctx.from.id);
    const tags = user.customTags;
    
    // Group tags into rows of 2 or 3
    const tagButtons = [];
    let row = [];
    for (const tag of tags) {
        row.push(tag);
        if (row.length === 2) {
            tagButtons.push([...row]);
            row = [];
        }
    }
    if (row.length > 0) tagButtons.push(row);
    
    await ctx.reply('Выберите категорию (тег):', Markup.keyboard(tagButtons).oneTime().resize());
    return ctx.wizard.next();
};

const saveStep = async (ctx) => {
    const tag = ctx.message.text;
    ctx.wizard.state.tag = tag;
    
    const { type, amount, balanceId } = ctx.wizard.state;
    const user = await userRepository.findByTelegramId(ctx.from.id);
    
    // Save transaction
    await transactionRepository.createTransaction({
        userId: user._id,
        balanceId: balanceId,
        type: type,
        amount: amount,
        tag: tag
    });
    
    // Update balance
    const amountChange = type === 'income' ? amount : -amount;
    await balanceRepository.updateBalanceAmount(balanceId, amountChange);
    
    await ctx.reply(`Запись успешно добавлена!\n${type === 'income' ? '📈' : '📉'} ${amount} (${tag})`, require('../../utils/keyboards').mainMenu);
    return ctx.scene.leave();
};

const createTransactionScene = new Scenes.WizardScene(
    'create_transaction_scene',
    typeStep,
    balanceStep,
    amountStep,
    tagStep,
    saveStep
);

module.exports = createTransactionScene;
