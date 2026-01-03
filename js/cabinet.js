// js/cabinet.js

let allOrders = [];
let currentOrderPage = 1;
const ORDERS_PER_PAGE = 5;

const ordersTableBody = document.getElementById('orders-table')?.querySelector('tbody');
const paginationNav = document.getElementById('orders-pagination');
const noOrdersEl = document.getElementById('no-orders');

let currentOrderIdForDelete = null;
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteModal = document.getElementById('delete-confirm-modal');

/**
 * Загружает заявки
 */
async function loadOrders() {
    try {
        allOrders = await apiRequest('/api/orders');
        renderOrders();
    } catch (e) {
        console.error('Failed to load orders', e);
    }
}

/**
 * Отображает заявки (текущая страница)
 */
function renderOrders() {
    const totalPages = Math.ceil(allOrders.length / ORDERS_PER_PAGE);
    if (allOrders.length === 0) {
        noOrdersEl.classList.remove('d-none');
        paginationNav.classList.add('d-none');
        if (ordersTableBody) ordersTableBody.innerHTML = '';
        return;
    }

    noOrdersEl.classList.add('d-none');
    renderOrderTable();
    renderOrderPagination();
}

/**
 * Рендер таблицы (текущая страница)
 */
function renderOrderTable() {
    if (!ordersTableBody) return;

    const startIndex = (currentOrderPage - 1) * ORDERS_PER_PAGE;
    const pageOrders = allOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

    ordersTableBody.innerHTML = '';

    pageOrders.forEach((order, idx) => {
        const row = document.createElement('tr');

        let itemName = '—';
        if (order.course_id) {
            itemName = `Курс #${order.course_id}`;
        } else if (order.tutor_id) {
            itemName = `Репетитор #${order.tutor_id}`;
        }

        row.innerHTML = `
            <td>${startIndex + idx + 1}</td>
            <td>${itemName}</td>
            <td>${order.date_start}</td>
            <td>${order.price} ₽</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" data-order-id="${order.id}">Подробнее</button>
                <button class="btn btn-sm btn-outline-warning me-1" data-order-id="${order.id}">Изменить</button>
                <button class="btn btn-sm btn-outline-danger" data-order-id="${order.id}">Удалить</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });

    // Обработчики
    ordersTableBody.querySelectorAll('button[data-order-id]').forEach(btn => {
        const id = parseInt(btn.dataset.orderId, 10);
        const order = allOrders.find(o => o.id === id);

        if (btn.textContent === 'Подробнее') {
            btn.addEventListener('click', () => showOrderDetails(order));
        } else if (btn.textContent === 'Изменить') {
            btn.addEventListener('click', () => openEditOrder(order));
        } else if (btn.textContent === 'Удалить') {
            btn.addEventListener('click', () => {
                currentOrderIdForDelete = id;
                const modal = new bootstrap.Modal(deleteModal);
                modal.show();
            });
        }
    });
}

/**
 * Показать детали заявки
 */
function showOrderDetails(order) {
    const modalBody = document.getElementById('order-detail-content');
    const courseOrTutor = order.course_id ? `Курс ID: ${order.course_id}` : `Репетитор ID: ${order.tutor_id}`;
    modalBody.innerHTML = `
        <p><strong>ID заявки:</strong> ${order.id}</p>
        <p><strong>Тип:</strong> ${courseOrTutor}</p>
        <p><strong>Дата:</strong> ${order.date_start}</p>
        <p><strong>Время:</strong> ${order.time_start}</p>
        <p><strong>Продолжительность:</strong> ${order.duration} ч</p>
        <p><strong>Студентов:</strong> ${order.persons}</p>
        <p><strong>Стоимость:</strong> ${order.price} ₽</p>
        <h6>Опции:</h6>
        <ul class="mb-0">
            ${order.early_registration ? '<li>Ранняя регистрация (-10%)</li>' : ''}
            ${order.group_enrollment ? '<li>Групповая запись (-15%)</li>' : ''}
            ${order.intensive_course ? '<li>Интенсивный курс (+20%)</li>' : ''}
            ${order.supplementary ? '<li>Доп. материалы (+2000 ₽/студент)</li>' : ''}
            ${order.personalized ? '<li>Индивидуальные занятия (+1500 ₽/неделя)</li>' : ''}
            ${order.excursions ? '<li>Экскурсии (+25%)</li>' : ''}
            ${order.assessment ? '<li>Оценка уровня (+300 ₽)</li>' : ''}
            ${order.interactive ? '<li>Интерактивная платформа (+50%)</li>' : ''}
        </ul>
    `;
    const modal = new bootstrap.Modal(document.getElementById('order-detail-modal'));
    modal.show();
}

/**
 * Открыть форму редактирования
 */
function openEditOrder(order) {
    // Устанавливаем данные в глобальный контекст для orderForm.js
    window.editingOrderId = order.id;
    window.editingOrder = order;

    // Открываем основную форму
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

/**
 * Рендер пагинации
 */
function renderOrderPagination() {
    if (!paginationNav) return;
    const totalPages = Math.ceil(allOrders.length / ORDERS_PER_PAGE);
    if (totalPages <= 1) {
        paginationNav.classList.add('d-none');
        return;
    }
    paginationNav.classList.remove('d-none');

    let html = '';
    html += `<li class="page-item ${currentOrderPage <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentOrderPage - 1}">Назад</a>
             </li>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentOrderPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                 </li>`;
    }

    html += `<li class="page-item ${currentOrderPage >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentOrderPage + 1}">Вперёд</a>
             </li>`;

    paginationNav.innerHTML = html;

    paginationNav.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page, 10);
            if (page >= 1 && page <= totalPages) {
                currentOrderPage = page;
                renderOrderTable();
                window.scrollTo({ top: document.querySelector('section').offsetTop - 100, behavior: 'smooth' });
            }
        });
    });
}

// Удаление заявки
confirmDeleteBtn?.addEventListener('click', async () => {
    if (!currentOrderIdForDelete) return;

    try {
        await apiRequest(`/api/orders/${currentOrderIdForDelete}`, { method: 'DELETE' });
        showNotification('Заявка удалена', 'success');
        allOrders = allOrders.filter(o => o.id !== currentOrderIdForDelete);
        currentOrderPage = 1;
        renderOrders();
        bootstrap.Modal.getInstance(deleteModal).hide();
    } catch (e) {
        showNotification('Не удалось удалить заявку', 'danger');
    }
});

// Загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    clearNotifications();
    loadOrders();
});