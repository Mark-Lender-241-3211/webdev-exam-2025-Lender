// js/api.js

const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
const API_KEY = '4a4017d0-af17-40d9-af18-96b0550c49a9';

/**
 * запрос к API
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