// js/orderForm.js

let allCourses = [];
let allTutors = [];
let selectedCourse = null;
let selectedTutor = null;

// DOM
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
 * Сброс формы
 */
function resetOrderForm() {
    selectedCourse = null;
    selectedTutor = null;
    orderTypeSelect.value = '';
    courseSelectGroup.style.display = 'none';
    tutorSelectGroup.style.display = 'none';
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
}

/**
 * Обновление селектов
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
 * Заполнение времени (курс)
 */
function fillDateOptions(startDates) {
    const uniqueDates = [...new Set(startDates.map(dt => dt.split('T')[0]))];
    orderDateInput.value = '';
    orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
}

orderDateInput.addEventListener('change', () => {
    const dateStr = orderDateInput.value;
    if (selectedCourse && dateStr) {
        const times = selectedCourse.start_dates
            .filter(dt => dt.startsWith(dateStr))
            .map(dt => dt.split('T')[1].slice(0, 5));
        orderTimeSelect.innerHTML = '<option value="">Выберите время</option>';
        times.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            orderTimeSelect.appendChild(opt);
        });
        orderDurationInput.value = selectedCourse.week_length * selectedCourse.total_length;
    } else if (selectedTutor && dateStr) {
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
            const day = date.getDay();
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
    if (selectedCourse) {
        const today = new Date();
        const startDate = new Date(orderDateInput.value);
        const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 30) {
            total *= 0.9;
            benefitText.push('ранняя регистрация (-10%)');
        }
        if (persons >= 5) {
            total *= 0.85;
            benefitText.push('групповая запись (-15%)');
        }
        if (selectedCourse.week_length >= 5) {
            total *= 1.2;
            benefitText.push('интенсивный курс (+20%)');
        }
    }

    if (benefitText.length > 0) {
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
 * Загрузка при открытии модалки
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

    // Используем предварительно выбранный курс/репетитор
    if (window.selectedCourse) {
        selectedCourse = window.selectedCourse;
        orderTypeSelect.value = 'course';
        courseSelectGroup.style.display = 'block';
        tutorSelectGroup.style.display = 'none';
        orderNameInput.value = selectedCourse.name;
        orderTeacherInput.value = selectedCourse.teacher;
    } else if (window.selectedTutor) {
        selectedTutor = window.selectedTutor;
        orderTypeSelect.value = 'tutor';
        courseSelectGroup.style.display = 'none';
        tutorSelectGroup.style.display = 'block';
        orderNameInput.value = `Репетитор: ${selectedTutor.name}`;
        orderTeacherInput.value = selectedTutor.name;
    }

        // Режим редактирования
    if (window.editingOrderId && window.editingOrder) {
        const order = window.editingOrder;

        // Установка типа
        if (order.course_id) {
            selectedCourse = allCourses.find(c => c.id === order.course_id);
            orderTypeSelect.value = 'course';
            courseSelectGroup.style.display = 'block';
            tutorSelectGroup.style.display = 'none';
            if (selectedCourse) {
                orderCourseSelect.value = selectedCourse.id.toString();
                orderNameInput.value = selectedCourse.name;
                orderTeacherInput.value = selectedCourse.teacher;
            }
        } else if (order.tutor_id) {
            selectedTutor = allTutors.find(t => t.id === order.tutor_id);
            orderTypeSelect.value = 'tutor';
            courseSelectGroup.style.display = 'none';
            tutorSelectGroup.style.display = 'block';
            if (selectedTutor) {
                orderTutorSelect.value = selectedTutor.id.toString();
                orderNameInput.value = `Репетитор: ${selectedTutor.name}`;
                orderTeacherInput.value = selectedTutor.name;
            }
        }

        // Заполнение остальных полей
        orderDateInput.value = order.date_start;
        orderTimeSelect.innerHTML = `<option value="${order.time_start}" selected>${order.time_start}</option>`;
        orderDurationInput.value = order.duration;
        orderPersonsInput.value = order.persons;
        orderTotalInput.value = order.price;

        // Восстановление опций
        optSupplementary.checked = order.supplementary;
        optPersonalized.checked = order.personalized;
        optExcursions.checked = order.excursions;
        optAssessment.checked = order.assessment;
        optInteractive.checked = order.interactive;

        // Обновление заголовка модалки
        document.getElementById('orderModalLabel').textContent = 'Редактирование заявки';
        orderSubmitBtn.textContent = 'Сохранить';

        // Замена обработчика отправки на PUT
        orderSubmitBtn.removeEventListener('click', handleCreateOrder);
        orderSubmitBtn.addEventListener('click', handleUpdateOrder);
    } else {
        // Режим создания
        document.getElementById('orderModalLabel').textContent = 'Оформление заявки';
        orderSubmitBtn.textContent = 'Отправить';
        orderSubmitBtn.removeEventListener('click', handleUpdateOrder);
        orderSubmitBtn.addEventListener('click', handleCreateOrder);
    }

    delete window.selectedCourse;
    delete window.selectedTutor;
});

/**
 * Отправка заявки
 */
orderSubmitBtn.addEventListener('click', async () => {
    const persons = parseInt(orderPersonsInput.value) || 1;
    const dateStart = orderDateInput.value;
    const timeStart = orderTimeSelect.value;
    let duration = 0;

    if (!dateStart || !timeStart) {
        showNotification('Укажите дату и время', 'warning');
        return;
    }

    if (selectedCourse) {
        duration = selectedCourse.week_length * selectedCourse.total_length;
    } else if (selectedTutor) {
        duration = parseInt(orderDurationInput.value) || 1;
        if (duration < 1 || duration > 40) {
            showNotification('Продолжительность для репетитора: 1–40 часов', 'warning');
            return;
        }
    } else {
        showNotification('Выберите курс или репетитора', 'warning');
        return;
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

    if (selectedCourse) {
        const today = new Date();
        const startDate = new Date(dateStart);
        const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        payload.early_registration = diffDays >= 30;
        payload.group_enrollment = persons >= 5;
        payload.intensive_course = selectedCourse.week_length >= 5;
    }

    try {
        await apiRequest('/api/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        showNotification('Заявка успешно оформлена!', 'success');
        bootstrap.Modal.getInstance(orderModal).hide();
    } catch (e) {
        showNotification('Не удалось отправить заявку', 'danger');
    }
});