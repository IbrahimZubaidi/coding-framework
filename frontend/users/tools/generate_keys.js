/**
 * Auto-generates i18n keys from text values in { i18n: '...', text: '...' } objects.
 * Always regenerates keys from text — overwrites existing keys.
 * Writes keys back into the source .js files.
 *
 * Usage: node generate_keys.js
 */

const fs   = require('fs');
const path = require('path');

const SCAN_DIR = path.join(__dirname, '../public/assets/js');


/* ── Key Generator ── */

function generateKey(text) {
    let hash = 0;
    for (const char of text.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) & 0xfffffff;
    return hash.toString(16).padStart(7, '0');
}


/* ── File Walker ── */

function walkDir(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDir(full, files);
        else if (path.extname(entry.name) === '.js') files.push(full);
    }
    return files;
}


/* ── Process File ── */

function processFile(filePath) {
    let content  = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Match i18n: 'anything' with text value — regenerate key from text (both orders)
    content = content.replace(
        /i18n\s*:\s*(['"`])[^'"`]*\1\s*,\s*text\s*:\s*(['"`])([^'"`]+)\2/g,
        (match, q1, q2, text) => {
            const key = generateKey(text);
            modified  = true;
            return `i18n: ${q1}${key}${q1}, text: ${q2}${text}${q2}`;
        }
    );

    // Same but text first, i18n second
    content = content.replace(
        /text\s*:\s*(['"`])([^'"`]+)\1\s*,\s*i18n\s*:\s*(['"`])[^'"`]*\3/g,
        (match, q1, text, q3) => {
            const key = generateKey(text);
            modified  = true;
            return `text: ${q1}${text}${q1}, i18n: ${q3}${key}${q3}`;
        }
    );

    if (modified) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}


/* ── Main ── */

const files    = walkDir(SCAN_DIR);
let filesCount = 0;

files.forEach(f => {
    if (processFile(f)) filesCount++;
});

console.log(`Done. Updated ${filesCount} file(s).`);
