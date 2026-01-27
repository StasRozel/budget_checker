const { Scenes, Markup } = require('telegraf');
const userRepository = require('../../repositories/userRepository');

const askTagStep = async (ctx) => {
    await ctx.reply('Введите название нового тега (категории):', Markup.removeKeyboard());
    return ctx.wizard.next();
};

const saveTagStep = async (ctx) => {
    const tagName = ctx.message.text;
    const user = await userRepository.findByTelegramId(ctx.from.id);
    
    await userRepository.addCustomTag(user._id, tagName);
    
    await ctx.reply(`Тег "${tagName}" добавлен!`, require('../../utils/keyboards').mainMenu);
    return ctx.scene.leave();
};

const addTagScene = new Scenes.WizardScene(
    'add_tag_scene',
    askTagStep,
    saveTagStep
);

module.exports = addTagScene;
