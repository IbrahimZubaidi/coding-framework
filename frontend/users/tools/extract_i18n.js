/**
 * Extracts all i18n keys and their English values from .js files.
 * Scans for: { i18n: 'key', text: 'value' } objects (any order, any quote style)
 *
 * Convention: never hardcode translatable strings inline.
 * Always define them as { i18n: 'some.key', text: 'English text' }
 *
 * Usage: node extract_i18n.js
 * Output: public/assets/js/locales/en.json
 */

const fs   = require('fs');
const path = require('path');

const SCAN_DIR = path.join(__dirname, '../public/assets/js');
const OUT_FILE = path.join(__dirname, '../public/assets/js/locales/en.json');

// Matches { i18n: 'key', text: 'value' } in both orders, any quote style
const PATTERNS = [
    /i18n\s*:\s*['"`]([^'"`]+)['"`]\s*,\s*text\s*:\s*['"`]([^'"`]+)['"`]/g,  // i18n first
    /text\s*:\s*['"`]([^'"`]+)['"`]\s*,\s*i18n\s*:\s*['"`]([^'"`]+)['"`]/g,  // text first
];


/* ── File Walker ── */

function walkDir(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDir(full, files);
        else if (path.extname(entry.name) === '.js') files.push(full);
    }
    return files;
}


/* ── Extract Keys ── */

function extractFromFile(filePath, results) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Pattern 0: i18n first → key=group1, value=group2
    // Pattern 1: text first → key=group2, value=group1
    PATTERNS.forEach((pattern, i) => {
        const reversed = i === 1;
        let match;
        pattern.lastIndex = 0;

        while ((match = pattern.exec(content)) !== null) {
            const key   = reversed ? match[2].trim() : match[1].trim();
            const value = reversed ? match[1].trim() : match[2].trim();

            if (key && value && !results[key]) {
                results[key] = value;
            }
        }
    });
}


/* ── Main ── */

const files   = walkDir(SCAN_DIR);
const results = {};

files.forEach(f => extractFromFile(f, results));

const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2));

console.log(`Done. ${Object.keys(sorted).length} keys → ${OUT_FILE}`);
