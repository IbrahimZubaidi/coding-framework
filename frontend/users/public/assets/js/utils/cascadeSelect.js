import { fetchRequestData } from './fetchData.js';
import { refreshCustomSelect } from './customSelect.js';

// Wires a university <select> to a dependent specialty/major <select>.
// On university change: fetches specialities for that university_id and
// repopulates the dependent select. Clears it when university is deselected.
//
// Options:
//   universitySelect  — the university <select> element
//   dependentSelect   — the specialty / major <select> element
//   text              — { default, loading, none, select } — option label strings
//   valueKey          — field on each specialty object to use as <option value> (default: 'name')
//   labelKey          — field on each specialty object to use as <option> text  (default: 'name')
export function initCascadeSelect({ universitySelect, dependentSelect, text, valueKey = 'name', labelKey = 'name' }) {
    universitySelect.addEventListener('change', async () => {
        const universityId = universitySelect.value;

        if (!universityId) {
            dependentSelect.innerHTML = `<option value="" disabled selected>${text.default}</option>`;
            refreshCustomSelect(dependentSelect);
            return;
        }

        dependentSelect.innerHTML = `<option value="" disabled selected>${text.loading}</option>`;
        refreshCustomSelect(dependentSelect);

        const req = {
            apiKey      : 'read_specialities',
            requestData : { lang: true, university_id: Number(universityId) },
            responseData: null,
            params      : null,
        };
        await fetchRequestData(req);

        const specialities = req.responseData?.data?.specialities ?? [];

        if (specialities.length === 0) {
            dependentSelect.innerHTML = `<option value="" disabled selected>${text.none}</option>`;
        } else {
            dependentSelect.innerHTML = `
                <option value="" disabled selected>${text.select}</option>
                ${specialities.map(s => {
                    const value = s[valueKey] ?? s.id ?? s.code ?? '';
                    const label = s[labelKey] ?? s.name ?? '';
                    return `<option value="${value}">${label}</option>`;
                }).join('')}
            `;
        }
        refreshCustomSelect(dependentSelect);
    });
}
