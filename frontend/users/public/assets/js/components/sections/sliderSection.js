import { t } from '../../services/i18n.js';

// ─── mountSliderSection ──────────────────────────────
// Renders a slider section into `container` and wires up its listeners.
// Uses a WeakSet to ensure click listeners are only bound once per container
// even if called again on re-renders (e.g. locale change).
//
// container  Element   — the persistent wrapper element (e.g. #featuredCourses)
// options    object    — same as renderSliderSection
const _bound = new WeakSet();

export function mountSliderSection(container, options) {
    container.innerHTML = renderSliderSection(options);

    const track    = container.querySelector('.slider-section__track');
    const controls = container.querySelector('.slider-section__controls');

    const updateButtons = () => {
        const overflows = track.scrollWidth > track.clientWidth;
        controls.hidden = !overflows;
        if (!overflows) return;

        const atStart = track.scrollLeft <= 0;
        const atEnd   = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
        container.querySelector('[data-dir="prev"]')?.toggleAttribute('disabled', atStart);
        container.querySelector('[data-dir="next"]')?.toggleAttribute('disabled', atEnd);
    };

    if (!_bound.has(container)) {
        _bound.add(container);
        container.addEventListener('click', e => {
            const btn = e.target.closest('.slider-section__btn[data-dir]');
            if (!btn) return;
            const t = container.querySelector('.slider-section__track');
            const cardWidth = t?.firstElementChild?.offsetWidth ?? 300;
            t?.scrollBy({ left: btn.dataset.dir === 'next' ? cardWidth : -cardWidth, behavior: 'smooth' });
        });
    }

    track.addEventListener('scroll', updateButtons, { passive: true });

    const ro = new ResizeObserver(updateButtons);
    ro.observe(track);
}

// ─── renderSliderSection ─────────────────────────────
// Section with a header (title · subtitle · optional link) and a horizontal card slider.
//
// options:
//   title    { i18n, text }
//   subtitle { i18n, text }                          — optional
//   link     { href: string, label: { i18n, text } } — optional "view all" link
//   cards    string[]                                 — pre-rendered card HTML strings
export function renderSliderSection({ title, subtitle, link, cards = [] }) {
    const linkHtml = link ? `
        <a class="slider-section__link" href="${link.href}">
            <span data-i18n="${link.label.i18n}">${t(link.label)}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.3335 8H12.6668"/>
                <path d="M8 3.33337L12.6667 8.00004L8 12.6667"/>
            </svg>
        </a>` : '';

    return `
        <div class="slider-section">
            <div class="slider-section__header">
                <div class="slider-section__titles">
                    <h2 class="slider-section__title" data-i18n="${title.i18n}">${t(title)}</h2>
                    ${subtitle ? `<p class="slider-section__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
                </div>
                ${linkHtml}
            </div>
            <div class="slider-section__track">
                ${cards.join('')}
            </div>
            <div class="slider-section__controls">
                <button class="slider-section__btn" data-dir="prev" type="button" aria-label="Previous">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 12L6 8l4-4"/>
                    </svg>
                </button>
                <button class="slider-section__btn" data-dir="next" type="button" aria-label="Next">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 4l4 4-4 4"/>
                    </svg>
                </button>
            </div>
        </div>`;
}
