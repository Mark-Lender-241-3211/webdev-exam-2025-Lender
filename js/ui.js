// js/ui.js

/**
 * Отображает уведомление с авто-скрытием через 5 сек
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
    `;
    container.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode === container) {
            container.removeChild(alert);
        }
    }, 5000);
}

/**
 * Очищает все уведомления
 */
function clearNotifications() {
    const container = document.getElementById('notifications');
    if (container) container.innerHTML = '';
}

window.showNotification = showNotification;
window.clearNotifications = clearNotifications;