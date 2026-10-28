// bot.js - Full code

const TelegramBot = require('node-telegram-bot-api');

// ============================================
// CONFIGURATION
// ============================================
const BOT_TOKEN = '8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68';
const CHAT_ID = '-1003983565500'; // Your group ID

// Create bot instance with polling
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot is starting...');
console.log(`📌 Target CHAT_ID: ${CHAT_ID}`);

// ============================================
// TEST COMMAND FOR COPY BUTTONS
// ============================================
bot.onText(/\/test/, (msg) => {
    const targetChatId = CHAT_ID;

    const replyMarkup = {
        inline_keyboard: [
            [
                {
                    text: "📧 Copy Test Email",
                    copy_text: { text: "dgbshd@gmail.com" }
                }
            ],
            [
                {
                    text: "🔑 Copy Test Password",
                    copy_text: { text: "12121212" }
                }
            ]
        ]
    };

    const messageText = 
        '🧪 <b>Copy Button Test</b>\n' +
        '━━━━━━━━━━━━━━━━━━━━━\n' +
        'If you see blue buttons below, tap them.\n' +
        'The text should copy instantly.';

    bot.sendMessage(targetChatId, messageText, {
        parse_mode: 'HTML',
        reply_markup: replyMarkup
    })
    .then(() => {
        console.log('✅ Test message with copy buttons sent successfully.');
        bot.sendMessage(msg.chat.id, 'Test message sent to the group. Check it now.');
    })
    .catch((error) => {
        console.error('❌ Failed to send test message:', error.message);
        bot.sendMessage(msg.chat.id, `Failed to send test: ${error.message}`);
    });
});

// ============================================
// STARTUP LOG
// ============================================
console.log('✅ Bot is running.');
console.log('📱 To test the copy buttons, send /test in a private chat with the bot.');