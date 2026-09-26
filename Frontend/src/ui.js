import { register, login, getProfile } from './api.js';

// Делаем функции доступными для onclick в index.html
window.showTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('login-form').style.display = 'block';
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('register-form').style.display = 'block';
    }
};

window.closeOverlay = () => {
    document.getElementById('auth-overlay').classList.remove('active');
};

window.handleRegister = async () => {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    errorEl.textContent = '';
    
    if (!username || !password) {
        errorEl.textContent = 'Заполните все поля';
        return;
    }
    
    const result = await register(username, password);
    if (result.success) {
        await loadProfile();
    } else {
        errorEl.textContent = result.error;
    }
};

window.handleLogin = async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    
    const result = await login(username, password);
    if (result.success) {
        await loadProfile();
    } else {
        errorEl.textContent = result.error;
    }
};

window.handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('auth-tabs').style.display = 'flex';
};

async function loadProfile() {
    const profile = await getProfile();
    if (!profile) return;
    
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('auth-tabs').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    
    document.getElementById('profile-name').textContent = profile.username;
    document.getElementById('profile-level').textContent = profile.level;
    document.getElementById('profile-xp').textContent = profile.xp;
    document.getElementById('profile-score').textContent = profile.total_score;
    document.getElementById('profile-scenarios').textContent = profile.scenarios_completed;
    document.getElementById('profile-loyalty').textContent = profile.loyalty_skill;
    document.getElementById('profile-safety').textContent = profile.safety_skill;
    document.getElementById('profile-avatar').src = profile.avatar_url;
    document.getElementById('daily-tip').textContent = profile.daily_tip;
    
    const achList = document.getElementById('achievements-list');
    achList.innerHTML = '';
    if (profile.achievements && profile.achievements.length > 0) {
        profile.achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = `${ach.icon || '🏆'} ${ach.title}: ${ach.description}`;
            achList.appendChild(li);
        });
    } else {
        achList.innerHTML = '<li>Пока нет достижений</li>';
    }
}

// Слушаем событие открытия оверлея из Phaser
window.addEventListener('open-auth-overlay', async () => {
    document.getElementById('auth-overlay').classList.add('active');
    if (localStorage.getItem('token')) {
        await loadProfile();
    } else {
        window.showTab('login');
    }
});