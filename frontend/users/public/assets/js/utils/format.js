// ─── Date ────────────────────────────────────────────
// Formats an ISO datetime string (e.g. "2026-03-20T14:35:00Z") into
// a readable date string: "Mar 20, 2026"
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Count ───────────────────────────────────────────
// Rounds down to nearest readable threshold and appends "+".
// 9 → "9+"  |  150 → "100+"  |  1200 → "1.2k+"  |  15000 → "15k+"  |  1200000 → "1.2M+"
export function formatCount(n) {
    if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
    if (n >= 10_000)    return `${Math.floor(n / 1_000)}k+`;
    if (n >= 1_000)     return `${Math.floor(n / 100) / 10}k+`;
    if (n >= 100)       return `${Math.floor(n / 10) * 10}+`;
    return `${n}+`;
}

// ─── Currency ────────────────────────────────────────
// Formats a numeric amount: max 2 decimal places, trailing zeros stripped.
// 162.2131 → "162.21"  |  123.10 → "123.1"  |  123.00 → "123"
export function formatAmount(amount, decimals = 2) {
    const raw = Number(amount).toFixed(Math.min(decimals, 2));
    return parseFloat(raw).toString();
}

// Formats amount with currency symbol using the active currency config.
// Falls back to JOD if APP_CONFIG or the requested currency is missing.
export function formatCurrency(amount, currencyCode = window.APP_CONFIG?.defaultCurrency ?? 'JOD') {
    const def      = { symbol: 'JD', symbolAfter: true, decimals: 2 };
    const currency = window.APP_CONFIG?.currencies?.[currencyCode] ?? def;
    const value    = formatAmount(amount, currency.decimals);
    return currency.symbolAfter ? `${value} ${currency.symbol}` : `${currency.symbol}${value}`;
}

// ─── Pagination ──────────────────────────────────────
export function buildPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4)         return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
}

// ─── Ordinal ─────────────────────────────────────────
// Appends the correct English suffix to a number.
// 1 → "1st"  |  2 → "2nd"  |  3 → "3rd"  |  4 → "4th"  |  11 → "11th"  |  21 → "21st"
export function formatOrdinal(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}