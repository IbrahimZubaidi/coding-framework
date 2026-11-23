/**
 * Translates en.json into all supported locales using Gemini API (free tier).
 * Reads supported languages from config.js — no hardcoding needed.
 * Preserves existing translated values — only translates missing keys.
 *
 * Usage: node translate_i18n.js
 * Requires: GEMINI_API_KEY in .env  (get free key from aistudio.google.com)
 */

const fs   = require('fs');
const path = require('path');

/* ── Config ── */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const LOCALES_DIR = path.join(__dirname, '../public/assets/js/locales');
const EN_FILE     = path.join(LOCALES_DIR, 'en.json');

// Load APP_CONFIG from config.js by stripping the window. assignment
const configRaw = fs.readFileSync(path.join(__dirname, '../public/assets/js/config.js'), 'utf8');
const APP_CONFIG = eval(configRaw.replace('window.APP_CONFIG =', '').replace(/;\s*$/, '').trim());


/* ── Helpers ── */

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
}

function writeJson(filePath, data) {
    const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2));
}

async function translateBatch(values, targetLanguage) {
    const prompt = `Translate the values in this JSON object from English to ${targetLanguage}.
Return ONLY valid JSON with exactly the same keys. Do not translate the keys. Do not add any explanation.

${JSON.stringify(values, null, 2)}`;

    const res = await fetch(GEMINI_URL, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        })
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code blocks if Gemini wraps the response
    const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(clean);
}


/* ── Main ── */

async function main() {
    if (!GEMINI_API_KEY) {
        console.error('Missing GEMINI_API_KEY. Get a free key from aistudio.google.com');
        console.error('Then run: GEMINI_API_KEY=your_key node translate_i18n.js');
        process.exit(1);
    }

    const enData  = readJson(EN_FILE);
    const targets = Object.entries(APP_CONFIG.locales).filter(([code]) => code !== 'en');

    if (!Object.keys(enData).length) {
        console.error('en.json is empty. Run extract_i18n.js first.');
        process.exit(1);
    }

    console.log(`Translating ${Object.keys(enData).length} keys into: ${targets.map(([, { label }]) => label).join(', ')}\n`);

    for (const [code, { label }] of targets) {
        const outFile  = path.join(LOCALES_DIR, `${code}.json`);
        console.log(`${label} (${code}) — translating ${Object.keys(enData).length} keys...`);

        try {
            const translated = await translateBatch(enData, label);
            writeJson(outFile, translated);
            console.log(`${label} (${code}) — done → ${outFile}`);
        } catch (err) {
            console.error(`${label} (${code}) — failed: ${err.message}`);
            console.error('Tip: chunking prompt — "In translate_i18n.js, update the translation logic to send keys in chunks of 200 instead of all at once."');
        }
    }

    console.log('\nAll done.');
}

main();

/*
 * NOTE:
 * 1) Improvement prompt (Chunking):
 * In translate_i18n.js, update the translation logic to send keys in chunks of 200 
 * instead of all at once. After each chunk, verify all sent keys came back in the response — if any are missing, retry that chunk once. Merge all chunk results 
 * together at the end. The translateBatch function itself should not change."
 * 
 * 2) Google Cloud Translation API:
 * is purpose-built for translation. It's faster, more accurate for UI strings, and handles large batches better. 
 * But it's paid.
 */