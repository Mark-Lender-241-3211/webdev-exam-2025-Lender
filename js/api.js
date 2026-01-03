// js/api.js

const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
const API_KEY = '0f2152ae-2c33-46cc-94d9-51656c675b81';

/**
 * Унифицированный запрос к API с поддержкой ошибок
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}?api_key=${API_KEY}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Ошибка API: ${error.message}`, 'danger');
        throw error;
    }
}

window.apiRequest = apiRequest;