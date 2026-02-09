require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const mongoose = require('mongoose');
const cron = require('node-cron');
const http = require('http');

const startHandler = require('./handlers/start');
const budgetHandler = require('./handlers/budget');
const statisticsHandler = require('./handlers/statistics');
const { mainMenu } = require('./utils/keyboards');

// Scenes
const createBalanceScene = require('./handlers/scenes/balanceScene');
const createTransactionScene = require('./handlers/scenes/transactionScene');
const addTagScene = require('./handlers/scenes/tagScene');

// Setup DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

const bot = new Telegraf(process.env.BOT_TOKEN);

// Scenes Setup
const stage = new Scenes.Stage([
    createBalanceScene, 
    createTransactionScene, 
    addTagScene
]);

bot.use(session());
bot.use(stage.middleware());

// Command Handlers
bot.start(startHandler);

// Text Handlers (Menu Buttons)
bot.hears('💰 Создать запись', (ctx) => ctx.scene.enter('create_transaction_scene'));
bot.hears('📊 Просмотреть бюджет', budgetHandler);
bot.hears('➕ Новый баланс', (ctx) => ctx.scene.enter('create_balance_scene'));
bot.hears('📈 Статистика', statisticsHandler.showMenu);
bot.hears('🏷️ Добавить тег', (ctx) => ctx.scene.enter('add_tag_scene'));

// Callback Queries for Statistics
bot.action('stats_week', (ctx) => statisticsHandler.getStats(ctx, 'week'));
bot.action('stats_month', (ctx) => statisticsHandler.getStats(ctx, 'month'));
bot.action('stats_year', (ctx) => statisticsHandler.getStats(ctx, 'year'));

// Reminder Cron Job (Every day at 20:00)
cron.schedule('0 20 * * *', async () => {
    // Ideally, iterate over all users and send message. 
    // retrieving all users might be heavy, but for simple bot it is ok.
    const User = require('./models/User');
    try {
        const users = await User.find({});
        for (const user of users) {
             try {
                await bot.telegram.sendMessage(user.telegramId, '🔔 Не забудьте внести свои доходы и расходы за сегодня!');
             } catch (e) {
                 console.log(`Failed to send reminder to ${user.telegramId}: ${e.message}`);
             }
        }
    } catch (err) {
        console.error('Error in cron job:', err);
    }
});

const server = http.createServer((req, res) => {
  // Устанавливаем заголовки ответа
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  
  // Обрабатываем разные маршруты
  if (req.url === '/ping' && req.method === 'GET') {
    res.end('I am alive');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

bot.launch();
console.log('Bot started');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
