import { register, login, getProfile } from './api.js';

// ===== МОДАЛКА АВТОРИЗАЦИИ =====
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.modal-form').forEach(f => f.classList.add('hidden'));
        document.getElementById(`${tabName}-form`).classList.remove('hidden');
    });
});

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('auth-modal').classList.remove('active');
});

document.getElementById('auth-modal').addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal') {
        e.target.classList.remove('active');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    const result = await login(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        document.getElementById('auth-modal').classList.remove('active');
        await loadProfilePage();
        window.showPage('page-profile');
    } else {
        errorEl.textContent = result.error;
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    
    const result = await register(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        document.getElementById('auth-modal').classList.remove('active');
        await loadProfilePage();
        window.showPage('page-profile');
    } else {
        errorEl.textContent = result.error;
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    window.showPage('page-landing');
});

// ===== РЕНДЕР СЛОЖНОСТИ =====
window.renderDifficulty = () => {
    const playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const grid = document.getElementById('difficulty-grid');
    
    const difficulties = [
        { id: 'standard', label: 'СТАНДАРТ', desc: 'Базовые ситуации', color: '#3498db', requiredLevel: 1 },
        { id: 'comfort', label: 'КОМФОРТ', desc: 'Повышенные требования', color: '#2ecc71', requiredLevel: 3 },
        { id: 'business', label: 'БИЗНЕС', desc: 'Сложные конфликты', color: '#f39c12', requiredLevel: 5 },
        { id: 'first', label: 'ПЕРВЫЙ КЛАСС', desc: 'Максимальный стресс', color: '#e63946', requiredLevel: 8 }
    ];
    
    grid.innerHTML = difficulties.map(diff => {
        const isLocked = playerLevel < diff.requiredLevel;
        return `
            <div class="difficulty-card ${isLocked ? 'locked' : ''}" 
                 data-difficulty="${diff.id}" 
                 style="${!isLocked ? `border-color: ${diff.color}` : ''}">
                <h3 style="color: ${isLocked ? '#666' : diff.color}">${diff.label}</h3>
                <p>${diff.desc}</p>
                ${isLocked ? `<div class="lock-icon">🔒 Требуется ур. ${diff.requiredLevel}</div>` : ''}
            </div>
        `;
    }).join('');
    
    grid.querySelectorAll('.difficulty-card:not(.locked)').forEach(card => {
        card.addEventListener('click', () => {
            window.selectedDifficulty = card.dataset.difficulty;
            window.showPage('page-time');
        });
    });
};

// ===== ВЫБОР ВРЕМЕНИ → ЗАПУСК ИГРЫ =====
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sessionTime = parseInt(btn.dataset.time);
        const difficulty = window.selectedDifficulty || 'standard';
        startGame(difficulty, sessionTime);
    });
});

function startGame(difficulty, sessionTime) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('game-wrapper').classList.remove('hidden');
    
    if (!window.gameInstance) {
        window.gameInstance = window.StartGame('game-container');
    }
    
    // Передаем данные в Phaser через глобальную переменную
    window.gameData = { difficulty, sessionTime };
}

// ===== ПРОФИЛЬ =====
window.loadProfilePage = async () => {
    const profile = await getProfile();
    if (!profile) return;
    
    document.getElementById('profile-name').textContent = profile.username;
    document.getElementById('profile-level').textContent = profile.level;
    document.getElementById('profile-xp').textContent = profile.xp;
    document.getElementById('profile-xp-needed').textContent = profile.level * 100;
    document.getElementById('profile-score').textContent = profile.total_score;
    document.getElementById('profile-sessions').textContent = profile.scenarios_completed || 0;
    document.getElementById('profile-loyalty').textContent = profile.loyalty_skill + '%';
    document.getElementById('profile-safety').textContent = profile.safety_skill + '%';
    document.getElementById('profile-avatar').textContent = profile.username.substring(0, 2).toUpperCase();
    
    const xpPercent = Math.min(100, (profile.xp / (profile.level * 100)) * 100);
    document.getElementById('profile-xp-bar').style.width = xpPercent + '%';
    
    document.getElementById('daily-tip').textContent = profile.daily_tip || 'Совет загружается...';
    
    // Ачивки
    const achGrid = document.getElementById('achievements-grid');
    const achievements = profile.achievements || [];
    
    if (achievements.length === 0) {
        achGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Пока нет достижений. Пройдите первую сессию!</div>';
    } else {
        achGrid.innerHTML = achievements.map(ach => `
            <div class="achievement-card unlocked">
                <div class="achievement-icon">${ach.icon || ''}</div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.description}</div>
            </div>
        `).join('');
    }
};