const API_URL = 'http://127.0.0.1:8000/api';

export async function register(username, password) {
    try {
        const res = await fetch(`${API_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.access);
            localStorage.setItem('refresh', data.refresh);
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Ошибка регистрации' };
    } catch (e) {
        return { success: false, error: 'Ошибка сети' };
    }
}

export async function login(username, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.access);
            localStorage.setItem('refresh', data.refresh);
            return { success: true };
        }
        return { success: false, error: data.detail || 'Ошибка входа' };
    } catch (e) {
        return { success: false, error: 'Ошибка сети' };
    }
}

export async function getProfile() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const res = await fetch(`${API_URL}/profile/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

export async function getLeaderboard() {
    try {
        const res = await fetch(`${API_URL}/leaderboard/`);
        return res.ok ? await res.json() : [];
    } catch (e) {
        return [];
    }
}

export async function getScenarios(difficulty = null) {
    try {
        let url = `${API_URL}/scenarios/`;
        if (difficulty) url += `?difficulty=${difficulty}`;
        const res = await fetch(url);
        return res.ok ? await res.json() : [];
    } catch (e) {
        return [];
    }
}

export async function completeScenario(scenarioId, finalLoyalty, finalSafety, choicesMade) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/scenarios/complete/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                scenario_id: scenarioId,
                final_loyalty: finalLoyalty,
                final_safety: finalSafety,
                choices_made: choicesMade
            })
        });
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

export async function aiChat(message, scenarioContext) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://127.0.0.1:8000/api/ai/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ message, scenario_context: scenarioContext })
        });
        
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.warn('ИИ недоступен (503/Network Error). Активирую заглушку для демо...');
    }

    // ЖЕЛЕЗОБЕТОННАЯ ЗАГЛУШКА
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                response: '[ДЕМО-РЕЖИМ] Понял вас! Модель Qwen сейчас не запущена на сервере, но этот ответ имитирует её работу. Шкалы обновляются!',
                loyalty_change: 5,
                safety_change: 2
            });
        }, 1000);
    });
}