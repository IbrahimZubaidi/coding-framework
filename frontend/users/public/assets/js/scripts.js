// ─── Dropdown Auto-close ─────────────────────────────
// Bootstrap closes dropdowns on any internal click by default.
// This patches all dropdowns (static + dynamic) to only close on outside clicks.

// · Helper — sets data-bs-auto-close="outside" on all dropdown toggles in root
function applyDropdownAutoClose(root = document) {
    root.querySelectorAll('.dropdown-toggle[data-bs-toggle="dropdown"]').forEach((toggle) => {
        toggle.setAttribute('data-bs-auto-close', 'outside');
    });
}

// ─── Section Spinners ─────────────────────────────────
// Any element with data-spinner gets a Bootstrap spinner injected on load.
// The page JS replaces it with real content via innerHTML when ready.

const SPINNER_HTML = `
    <div class="spinner-wrapper">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;

function initSectionSpinners() {
    document.querySelectorAll('[data-spinner]').forEach(el => {
        el.innerHTML = SPINNER_HTML;
    });
}

// · Init — apply to all dropdowns already in the DOM
document.addEventListener('DOMContentLoaded', () => {
    initSectionSpinners();
    applyDropdownAutoClose();
});

// · Observer — apply to dropdowns injected into the DOM after page load
const dropdownObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches('.dropdown-toggle[data-bs-toggle="dropdown"]')) {
                node.setAttribute('data-bs-auto-close', 'outside');
                return;
            }
            applyDropdownAutoClose(node);
        });
    });
});

dropdownObserver.observe(document.documentElement, { childList: true, subtree: true });
