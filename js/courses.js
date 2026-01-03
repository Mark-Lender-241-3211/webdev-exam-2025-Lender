// js/courses.js

let allCourses = [];
let filteredCourses = [];
let currentCoursePage = 1;
const COURSES_PER_PAGE = 5;

const coursesContainer = document.getElementById('courses-list-container');
const paginationNav = document.getElementById('courses-pagination');
const courseSearchInput = document.getElementById('course-search-input');
const courseLevelSelect = document.getElementById('course-level-filter');

/**
 * Загружает курсы с API
 */
async function loadCourses() {
    try {
        allCourses = await apiRequest('/api/courses');
        applyCourseFilters();
    } catch (e) {
        console.error('Failed to load courses', e);
    }
}

/**
 * Применяет фильтрацию по названию и уровню
 */
function applyCourseFilters() {
    const searchTerm = courseSearchInput?.value.trim().toLowerCase() || '';
    const levelFilter = courseLevelSelect?.value || '';

    filteredCourses = allCourses.filter(course => {
        const matchesName = course.name.toLowerCase().includes(searchTerm);
        const matchesLevel = !levelFilter || course.level === levelFilter;
        return matchesName && matchesLevel;
    });

    currentCoursePage = 1;
    renderCourseList();
    renderCoursePagination();
}

/**
 * Отображает список курсов
 */
function renderCourseList() {
    if (!coursesContainer) return;
    coursesContainer.innerHTML = '';

    const startIndex = (currentCoursePage - 1) * COURSES_PER_PAGE;
    const pageCourses = filteredCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);

    if (pageCourses.length === 0) {
        coursesContainer.innerHTML = '<p class="text-center col-12">Курсы не найдены.</p>';
        return;
    }

    pageCourses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'col-12 mb-3';
        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(course.name)}</h5>
                    <p class="card-text">${escapeHtml(course.description)}</p>
                    <small class="text-muted">Преподаватель: ${escapeHtml(course.teacher)} | Уровень: ${course.level}</small>
                    <br><br>
                    <button class="btn btn-primary" data-course-id="${course.id}">Подать заявку</button>
                </div>
            </div>
        `;
        coursesContainer.appendChild(card);
    });

    // Обработчик кнопки "Подать заявку"
    coursesContainer.querySelectorAll('button[data-course-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.courseId, 10);
            const course = allCourses.find(c => c.id === id);
            if (course) {
                window.selectedCourse = course;
                window.selectedTutor = null;
                const modal = new bootstrap.Modal(document.getElementById('orderModal'));
                modal.show();
            }
        });
    });
}

/**
 * Отображает пагинацию
 */
function renderCoursePagination() {
    if (!paginationNav) return;
    const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
    if (totalPages <= 1) {
        paginationNav.classList.add('d-none');
        return;
    }
    paginationNav.classList.remove('d-none');

    let html = '';
    html += `<li class="page-item ${currentCoursePage <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentCoursePage - 1}">Назад</a>
             </li>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentCoursePage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                 </li>`;
    }

    html += `<li class="page-item ${currentCoursePage >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentCoursePage + 1}">Вперёд</a>
             </li>`;

    paginationNav.innerHTML = html;

    paginationNav.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page, 10);
            if (page >= 1 && page <= totalPages) {
                currentCoursePage = page;
                renderCourseList();
                renderCoursePagination();
                window.scrollTo({ top: document.querySelector('#courses').offsetTop - 100, behavior: 'smooth' });
            }
        });
    });
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Обработчики фильтрации
if (courseSearchInput) {
    courseSearchInput.addEventListener('input', applyCourseFilters);
}
if (courseLevelSelect) {
    courseLevelSelect.addEventListener('change', applyCourseFilters);
}

window.loadCourses = loadCourses;