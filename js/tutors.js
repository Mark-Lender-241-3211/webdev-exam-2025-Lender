// js/tutors.js

let allTutors = [];
let selectedTutorId = null;

const tutorsTableBody = document.getElementById('tutors-table')?.querySelector('tbody');
const tutorLangSelect = document.getElementById('tutor-lang-filter');
const tutorLevelSelect = document.getElementById('tutor-level-filter');

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Загружает репетиторов и заполняет фильтры
 */
async function loadTutors() {
    try {
        allTutors = await apiRequest('/api/tutors');
        populateTutorFilters();
        renderTutors();
    } catch (e) {
        console.error('Failed to load tutors', e);
    }
}

/**
 * Заполняет выпадающие списки
 */
function populateTutorFilters() {
    if (!allTutors.length || !tutorLangSelect || !tutorLevelSelect) return;

    const languages = [...new Set(allTutors.flatMap(t => t.languages_offered || []))].sort();
    tutorLangSelect.innerHTML = '<option value="">Язык</option>';
    languages.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        tutorLangSelect.appendChild(opt);
    });

    const levels = [...new Set(allTutors.map(t => t.language_level).filter(Boolean))].sort();
    tutorLevelSelect.innerHTML = '<option value="">Уровень</option>';
    levels.forEach(lvl => {
        const opt = document.createElement('option');
        opt.value = lvl;
        opt.textContent = lvl;
        tutorLevelSelect.appendChild(opt);
    });
}

/**
 * Отображает таблицу репетиторов
 */
function renderTutors() {
    if (!tutorsTableBody) return;

    const langFilter = tutorLangSelect?.value || '';
    const levelFilter = tutorLevelSelect?.value || '';

    const filtered = allTutors.filter(tutor => {
        const langMatch = !langFilter || (tutor.languages_offered || []).includes(langFilter);
        const levelMatch = !levelFilter || tutor.language_level === levelFilter;
        return langMatch && levelMatch;
    });

    tutorsTableBody.innerHTML = '';

    if (filtered.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">Репетиторы не найдены</td>';
        tutorsTableBody.appendChild(row);
        return;
    }

    filtered.forEach(tutor => {
        const row = document.createElement('tr');
        if (tutor.id === selectedTutorId) {
            row.classList.add('table-info');
        }
        row.innerHTML = `
            <td>${escapeHtml(tutor.name)}</td>
            <td>${escapeHtml(tutor.language_level)}</td>
            <td>${(tutor.languages_offered || []).map(escapeHtml).join(', ')}</td>
            <td>${tutor.work_experience || 0}</td>
            <td>${tutor.price_per_hour || 0}</td>
            <td class="text-center">
                <button class="btn btn-outline-primary btn-sm" data-tutor-id="${tutor.id}">Выбрать</button>
            </td>
        `;
        tutorsTableBody.appendChild(row);
    });

    // Обработчик кнопки "Выбрать"
    tutorsTableBody.querySelectorAll('button[data-tutor-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.tutorId, 10);
            const tutor = allTutors.find(t => t.id === id);
            if (tutor) {
                window.selectedTutor = tutor;
                window.selectedCourse = null;
                selectedTutorId = id;
                renderTutors();

                const modal = new bootstrap.Modal(document.getElementById('orderModal'));
                modal.show();
            }
        });
    });
}

// Обработчики фильтров
if (tutorLangSelect) {
    tutorLangSelect.addEventListener('change', renderTutors);
}
if (tutorLevelSelect) {
    tutorLevelSelect.addEventListener('change', renderTutors);
}

window.loadTutors = loadTutors;