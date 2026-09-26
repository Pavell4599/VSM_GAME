import { register, login, getProfile } from './api.js';

// Переключение вкладок
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.modal-form').forEach(f => f.classList.add('hidden'));
        document.getElementById(`${tabName}-form`).classList.remove('hidden');
    });
});

// Открытие модалки
document.getElementById('btn-profile').addEventListener('click', async () => {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('active');
    
    const token = localStorage.getItem('token');
    if (token) {
        await loadProfile();
    } else {
        document.querySelectorAll('.modal-form').forEach(f => f.classList.add('hidden'));
        document.getElementById('login-form').classList.remove('hidden');
    }
});

// Закрытие модалки
document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('auth-modal').classList.remove('active');
});

document.getElementById('auth-modal').addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal') {
        e.target.classList.remove('active');
    }
});

// Форма входа
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    const result = await login(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        await loadProfile();
    } else {
        errorEl.textContent = result.error;
    }
});

// Форма регистрации
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    
    const result = await register(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        await loadProfile();
    } else {
        errorEl.textContent = result.error;
    }
});

// Загрузка профиля
async function loadProfile() {
    const profile = await getProfile();
    if (!profile) return;
    
    document.querySelectorAll('.modal-form').forEach(f => f.classList.add('hidden'));
    document.getElementById('profile-view').classList.remove('hidden');
    
    document.getElementById('profile-name').textContent = profile.username;
    document.getElementById('profile-level').textContent = profile.level;
    document.getElementById('profile-xp').textContent = profile.xp;
    document.getElementById('profile-score').textContent = profile.total_score;
    document.getElementById('profile-sessions').textContent = profile.scenarios_completed || 0;
    document.getElementById('profile-avatar').textContent = profile.username.substring(0, 2).toUpperCase();
}

// Выход
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    document.getElementById('auth-modal').classList.remove('active');
});

// Скролл к лидерборду
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('.leaderboard-section').scrollIntoView({ behavior: 'smooth' });
});