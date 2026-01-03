// js/orderForm.js

let selectedCourse = null;
let selectedTutor = null;
let allCourses = [];
let allTutors = [];

const orderModal = document.getElementById('orderModal');
const orderTypeSelect = document.getElementById('order-type');
const courseSelectGroup = document.getElementById('course-select-group');
const tutorSelectGroup = document.getElementById('tutor-select-group');
const orderCourseSelect = document.getElementById('order-course');
const orderTutorSelect = document.getElementById('order-tutor');
const orderNameInput = document.getElementById('order-name');
const orderTeacherInput = document.getElementById('order-teacher');
const orderDateInput = document.getElementById('order-date');
const orderTimeSelect = document.getElementById('order-time');
const orderDurationInput = document.getElementById('order-duration');
const orderPersonsInput = document.getElementById('order-persons');
const orderSubmitBtn = document.getElementById('order-submit');
const autoBenefitsEl = document.getElementById('auto-benefits');
const benefitTextEl = document.getElementById('benefit-text');
const orderTotalInput = document.getElementById('order-total');

// Опции
const optSupplementary = document.getElementById('opt-supplementary');
const optPersonalized = document.getElementById('opt-personalized');
const optExcursions = document.getElementById('opt-excursions');
const optAssessment = document.getElementById('opt-assessment');
const optInteractive = document.getElementById('opt-interactive');

/**
 * Обновление списка курсов в форме
 */
function updateCourseOptions() {
    orderCourseSelect.innerHTML = '<option value="">Выберите курс</option>';
    allCourses.forEach(course => {
        const opt = document.createElement('option');
        opt.value = course.id;
        opt.textContent = course.name;
        orderCourseSelect.appendChild(opt);
    });
}

/**
 * Обновление списка репетиторов в форме
 */
function updateTutorOptions() {
    orderTutorSelect.innerHTML = '<option value="">Выберите репетитора</option>';
    allTutors.forEach(tutor => {
        const opt = document.createElement('option');
        opt.value = tutor.id;
        opt.textContent = tutor.name;
        orderTutorSelect.appendChild(opt);
    });
}

/**
 * Сброс формы
 */
function resetOrderForm() {
    orderTypeSelect.value = '';
    courseSelectGroup.style.display = 'none';
    tutorSelectGroup.style.display = 'none';
    orderCourseSelect.value = '';
    orderTutorSelect.value = '';
    orderNameInput.value = '';
    orderTeacherInput.value = '';
    orderDateInput.value = '';
    orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
    orderDurationInput.value = '';
    orderPersonsInput.value = '1';
    optSupplementary.checked = false;
    optPersonalized.checked = false;
    optExcursions.checked = false;
    optAssessment.checked = false;
    optInteractive.checked = false;
    autoBenefitsEl.style.display = 'none';
    orderTotalInput.value = '';
    selectedCourse = null;
    selectedTutor = null;
}

/**
 * Загрузка данных курсов и репетиторов при открытии модалки
 */
orderModal.addEventListener('show.bs.modal', async () => {
    resetOrderForm();
    try {
        allCourses = await apiRequest('/api/courses');
        allTutors = await apiRequest('/api/tutors');
        updateCourseOptions();
        updateTutorOptions();
    } catch (e) {
        console.error('Failed to load data for order form', e);
    }
});

/**
 * Изменение типа заявки
 */
orderTypeSelect.addEventListener('change', () => {
    const type = orderTypeSelect.value;
    courseSelectGroup.style.display = type === 'course' ? 'block' : 'none';
    tutorSelectGroup.style.address = type === 'tutor' ? 'block' : 'none';
    resetRelatedFields();
});

function resetRelatedFields() {
    orderNameInput.value = '';
    orderTeacherInput.value = '';
    orderDateInput.value = '';
    orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
    orderDurationInput.value = '';
    orderTotalInput.value = '';
}

/**
 * Выбор курса
 */
orderCourseSelect.addEventListener('change', () => {
    const id = parseInt(orderCourseSelect.value);
    selectedCourse = allCourses.find(c => c.id === id);
    selectedTutor = null;

    if (selectedCourse) {
        orderNameInput.value = selectedCourse.name;
        orderTeacherInput.value = selectedCourse.teacher;
        fillDateOptions(selectedCourse.start_dates);
    } else {
        orderNameInput.value = '';
        orderTeacherInput.value = '';
        orderDateInput.value = '';
        orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
    }
});

/**
 * Выбор репетитора
 */
orderTutorSelect.addEventListener('change', () => {
    const id = parseInt(orderTutorSelect.value);
    selectedTutor = allTutors.find(t => t.id === id);
    selectedCourse = null;

    if (selectedTutor) {
        orderNameInput.value = `Репетитор: ${selectedTutor.name}`;
        orderTeacherInput.value = selectedTutor.name;
        orderDurationInput.value = ''; // пользователь сам укажет
        orderDateInput.value = '';
        orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
    } else {
        orderNameInput.value = '';
        orderTeacherInput.value = '';
        orderDurationInput.value = '';
    }
});

/**
 * Заполнение дат и времён (только для курса)
 */
function fillDateOptions(startDates) {
    const uniqueDates = [...new Set(startDates.map(dt => dt.split('T')[0]))];
    orderDateInput.setAttribute('list', 'date-suggestions');
    // Для простоты — будем использовать обычный date input; времена — отдельно
}

orderDateInput.addEventListener('change', () => {
    if (selectedCourse) {
        const selectedDate = orderDateInput.value; // YYYY-MM-DD
        const times = selectedCourse.start_dates
            .filter(dt => dt.startsWith(selectedDate))
            .map(dt => dt.split('T')[1].slice(0, 5)); // HH:MM

        orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
        times.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            orderTimeSelect.appendChild(opt);
        });
        orderDurationInput.value = selectedCourse.week_length * selectedCourse.total_length;
    } else if (selectedTutor) {
        // Для репетитора: время вводится вручную, но можно ограничить диапазон
        orderTimeSelect.innerHTML = `
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
        `;
        // Продолжительность — вручную через input number отдельно (но в форме она readonly, поэтому оставим возможность задать через JS при отправке)
    }
});

/**
 * Пересчёт стоимости
 */
function recalculateTotal() {
    const persons = parseInt(orderPersonsInput.value) || 1;
    let baseRate = 0;
    let durationHours = 0;
    let isWeekend = false;
    let morningSurcharge = 0;
    let eveningSurcharge = 0;

    if (selectedCourse) {
        baseRate = selectedCourse.course_fee_per_hour;
        durationHours = selectedCourse.week_length * selectedCourse.total_length;
        const dateStr = orderDateInput.value;
        if (dateStr) {
            const date = new Date(dateStr);
            const day = date.getDay(); // 0 = воскресенье, 6 = суббота
            isWeekend = day === 0 || day === 6;
        }
        const timeStr = orderTimeSelect.value;
        if (timeStr) {
            const [hours] = timeStr.split(':').map(Number);
            if (hours >= 9 && hours < 12) morningSurcharge = 400;
            if (hours >= 18 && hours < 20) eveningSurcharge = 1000;
        }
    } else if (selectedTutor) {
        baseRate = selectedTutor.price_per_hour;
        durationHours = parseInt(orderDurationInput.value) || 1;
        durationHours = Math.min(Math.max(durationHours, 1), 40);
        const dateStr = orderDateInput.value;
        if (dateStr) {
            const date = new Date(dateStr);
            const day = date.getDay();
            isWeekend = day === 0 || day === 6;
        }
        const timeStr = orderTimeSelect.value;
        if (timeStr) {
            const [hours] = timeStr.split(':').map(Number);
            if (hours >= 9 && hours < 12) morningSurcharge = 400;
            if (hours >= 18 && hours < 20) eveningSurcharge = 1000;
        }
    } else {
        orderTotalInput.value = '';
        return;
    }

    // Базовая стоимость
    let total = (baseRate * durationHours * (isWeekend ? 1.5 : 1)) + morningSurcharge + eveningSurcharge;
    total *= persons;

    // Пользовательские опции
    if (optSupplementary.checked) total += 2000 * persons;
    if (optPersonalized.checked && selectedCourse) total += 1500 * selectedCourse.total_length;
    if (optExcursions.checked) total *= 1.25;
    if (optAssessment.checked) total += 300;
    if (optInteractive.checked) total *= 1.5;

    // Автоматические скидки
    let benefitText = [];
    let hasEarly = false;
    let hasGroup = false;
    let hasIntensive = false;

    if (selectedCourse) {
        const dateStart = orderDateInput.value;
        if (dateStart) {
            const today = new Date();
            const startDate = new Date(dateStart);
            const diffTime = startDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 30) {
                total *= 0.9;
                hasEarly = true;
                benefitText.push('ранняя регистрация (-10%)');
            }
        }

        if (persons >= 5) {
            total *= 0.85;
            hasGroup = true;
            benefitText.push('групповая запись (-15%)');
        }

        if (selectedCourse.week_length >= 5) {
            total *= 1.2;
            hasIntensive = true;
            benefitText.push('интенсивный курс (+20%)');
        }
    }

    // Отображение автоматических скидок
    if (hasEarly || hasGroup || hasIntensive) {
        benefitTextEl.textContent = benefitText.join(', ');
        autoBenefitsEl.style.display = 'block';
    } else {
        autoBenefitsEl.style.display = 'none';
    }

    orderTotalInput.value = Math.round(total);
}

// Слушатели для пересчёта
[
    orderPersonsInput,
    orderDurationInput,
    orderDateInput,
    orderTimeSelect,
    optSupplementary,
    optPersonalized,
    optExcursions,
    optAssessment,
    optInteractive
].forEach(el => {
    el.addEventListener('input', recalculateTotal);
    el.addEventListener('change', recalculateTotal);
});

/**
 * Отправка заявки
 */
orderSubmitBtn.addEventListener('click', async () => {
    const type = orderTypeSelect.value;
    if (!type) {
        showNotification('Выберите тип заявки', 'warning');
        return;
    }

    if (type === 'course' && !selectedCourse) {
        showNotification('Выберите курс', 'warning');
        return;
    }
    if (type === 'tutor' && !selectedTutor) {
        showNotification('Выберите репетитора', 'warning');
        return;
    }

    const dateStart = orderDateInput.value;
    const timeStart = orderTimeSelect.value;
    const persons = parseInt(orderPersonsInput.value) || 1;

    if (!dateStart || !timeStart) {
        showNotification('Укажите дату и время', 'warning');
        return;
    }

    let duration = 0;
    if (selectedCourse) {
        duration = selectedCourse.week_length * selectedCourse.total_length;
    } else {
        duration = parseInt(orderDurationInput.value) || 1;
        if (duration < 1 || duration > 40) {
            showNotification('Продолжительность для репетитора: 1–40 часов', 'warning');
            return;
        }
    }

    const payload = {
        course_id: selectedCourse ? selectedCourse.id : null,
        tutor_id: selectedTutor ? selectedTutor.id : null,
        date_start: dateStart,
        time_start: timeStart,
        duration: duration,
        persons: persons,
        price: parseInt(orderTotalInput.value) || 0,
        early_registration: false,
        group_enrollment: false,
        intensive_course: false,
        supplementary: optSupplementary.checked,
        personalized: optPersonalized.checked,
        excursions: optExcursions.checked,
        assessment: optAssessment.checked,
        interactive: optInteractive.checked
    };

    // Устанавливаем автоматические флаги
    if (selectedCourse) {
        const today = new Date();
        const startDate = new Date(dateStart);
        const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        payload.early_registration = diffDays >= 30;
        payload.group_enrollment = persons >= 5;
        payload.intensive_course = selectedCourse.week_length >= 5;
    }

    try {
        const result = await apiRequest('/api/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        showNotification('Заявка успешно оформлена!', 'success');
        const modal = bootstrap.Modal.getInstance(orderModal);
        modal.hide();
    } catch (e) {
        showNotification('Не удалось отправить заявку', 'danger');
    }
});