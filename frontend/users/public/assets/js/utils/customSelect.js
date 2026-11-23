// ─── Custom Select ────────────────────────────────────
// Wraps every .form-field select with a styled dropdown.
// The native <select> stays hidden and in sync for FormData / validation.

const MAX_VISIBLE = 6; // options visible before scroll

function buildCustomSelect(select) {
    if (select.dataset.customSelect) return;
    select.dataset.customSelect = '1';

    const wrap = select.closest('.form-field__input-wrap');
    if (!wrap) return;

    // ── Trigger button ──
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cs-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerText = document.createElement('span');
    triggerText.className = 'cs-trigger__text';

    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'cs-trigger__icon';
    triggerIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    trigger.appendChild(triggerText);
    trigger.appendChild(triggerIcon);

    // ── Listbox ──
    const listbox = document.createElement('ul');
    listbox.className = 'cs-listbox';
    listbox.setAttribute('role', 'listbox');
    listbox.style.setProperty('--cs-max', MAX_VISIBLE);

    function syncTrigger() {
        const opt = select.options[select.selectedIndex];
        const isPlaceholder = !opt || opt.disabled || opt.value === '';
        triggerText.textContent = opt ? opt.text : '';
        trigger.classList.toggle('cs-trigger--placeholder', isPlaceholder);
    }

    function buildOptions() {
        listbox.innerHTML = '';
        Array.from(select.options).forEach((opt, i) => {
            const li = document.createElement('li');
            li.className = 'cs-option';
            li.setAttribute('role', 'option');
            li.dataset.value = opt.value;
            li.textContent = opt.text;
            if (opt.disabled) {
                li.classList.add('cs-option--disabled');
                li.setAttribute('aria-disabled', 'true');
                listbox.appendChild(li);
                return;
            }
            if (select.selectedIndex === i) li.classList.add('cs-option--selected');
            li.addEventListener('mousedown', e => {
                e.preventDefault();
                select.value = opt.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                select.dispatchEvent(new Event('input',  { bubbles: true }));
                close();
            });
            listbox.appendChild(li);
        });
    }

    function open() {
        buildOptions();
        listbox.classList.add('cs-listbox--open');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.classList.add('cs-trigger--open');
        // Scroll selected option into view
        const selected = listbox.querySelector('.cs-option--selected');
        if (selected) selected.scrollIntoView({ block: 'nearest' });
    }

    function close() {
        syncTrigger();
        listbox.classList.remove('cs-listbox--open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.classList.remove('cs-trigger--open');
    }

    trigger.addEventListener('click', () => {
        listbox.classList.contains('cs-listbox--open') ? close() : open();
    });

    // Close on outside click
    document.addEventListener('mousedown', e => {
        if (!wrap.contains(e.target)) close();
    }, true);

    // Keyboard nav
    trigger.addEventListener('keydown', e => {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            listbox.classList.contains('cs-listbox--open') ? close() : open();
        }
    });

    // Keep in sync when native select changes externally (e.g. register.js university→major)
    select.addEventListener('change', () => { syncTrigger(); buildOptions(); });

    // Hide native, insert custom
    select.style.display = 'none';
    wrap.appendChild(trigger);
    wrap.appendChild(listbox);

    syncTrigger();
}

export function initCustomSelects(root = document) {
    root.querySelectorAll('.form-field select').forEach(buildCustomSelect);
}

// Rebuild options for a select that was repopulated (e.g. university → major cascade)
export function refreshCustomSelect(select) {
    if (!select.dataset.customSelect) {
        buildCustomSelect(select);
        return;
    }
    const wrap = select.closest('.form-field__input-wrap');
    if (!wrap) return;
    const trigger = wrap.querySelector('.cs-trigger');
    const listbox = wrap.querySelector('.cs-listbox');
    if (!trigger || !listbox) return;

    const triggerText = trigger.querySelector('.cs-trigger__text');
    const opt = select.options[select.selectedIndex];
    const isPlaceholder = !opt || opt.disabled || opt.value === '';
    if (triggerText) triggerText.textContent = opt ? opt.text : '';
    trigger.classList.toggle('cs-trigger--placeholder', isPlaceholder);

    listbox.innerHTML = '';
    Array.from(select.options).forEach((opt, i) => {
        const li = document.createElement('li');
        li.className = 'cs-option';
        li.setAttribute('role', 'option');
        li.dataset.value = opt.value;
        li.textContent = opt.text;
        if (opt.disabled) {
            li.classList.add('cs-option--disabled');
            li.setAttribute('aria-disabled', 'true');
            listbox.appendChild(li);
            return;
        }
        if (select.selectedIndex === i) li.classList.add('cs-option--selected');
        li.addEventListener('mousedown', e => {
            e.preventDefault();
            select.value = opt.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input',  { bubbles: true }));
            listbox.classList.remove('cs-listbox--open');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('cs-trigger--open');
            if (triggerText) triggerText.textContent = opt.text;
            trigger.classList.remove('cs-trigger--placeholder');
        });
        listbox.appendChild(li);
    });
}
