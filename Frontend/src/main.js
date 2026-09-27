import StartGame from './game/main.js';
import { register, login, getProfile, getLeaderboard } from './api.js';

let gameInstance = null;
let selectedDifficulty = 'standard';

// ===== НАВИГАЦИЯ =====
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('game-wrapper').classList.add('hidden');
    window.scrollTo(0, 0);
};

// ===== МОДАЛКА =====
window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.modal-form').forEach(f => f.classList.add('hidden'));
    document.getElementById(tab + '-form').classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('auth-modal').classList.remove('active');
};

window.handleProfileClick = async function() {
    const token = localStorage.getItem('token');
    if (token) {
        await loadProfilePage();
        showPage('page-profile');
    } else {
        document.getElementById('auth-modal').classList.add('active');
    }
};

window.handleLogin = async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const result = await login(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        closeModal();
        await loadProfilePage();
        showPage('page-profile');
    } else {
        document.getElementById('login-error').textContent = result.error;
    }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const result = await register(username, password);
    if (result.success) {
        localStorage.setItem('username', username);
        closeModal();
        await loadProfilePage();
        showPage('page-profile');
    } else {
        document.getElementById('reg-error').textContent = result.error;
    }
};

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    showPage('page-landing');
};

// ===== СЛОЖНОСТЬ =====
window.renderDifficulty = function() {
    const playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const grid = document.getElementById('difficulty-grid');
    
    const difficulties = [
        { 
            id: 'standard', 
            label: 'СТАНДАРТ', 
            desc: 'Базовые ситуации. Идеально для новичков.', 
            color: '#3498db', 
            requiredLevel: 1,
            unlocked: true  // ✅ ВСЕГДА ОТКРЫТ
        },
        { 
            id: 'comfort', 
            label: 'КОМФОРТ', 
            desc: 'Повышенные требования. Более сложные пассажиры.', 
            color: '#2ecc71', 
            requiredLevel: 15,  // 🔒 Высокий порог
            unlocked: false
        },
        { 
            id: 'business', 
            label: 'БИЗНЕС', 
            desc: 'Сложные конфликты и нештатные ситуации.', 
            color: '#f39c12', 
            requiredLevel: 30,  // 🔒 Очень высокий порог
            unlocked: false
        },
        { 
            id: 'first', 
            label: 'ПЕРВЫЙ КЛАСС', 
            desc: 'Максимальный стресс. Только для опытных.', 
            color: '#e63946', 
            requiredLevel: 50,  // 🔒 Максимальный порог
            unlocked: false
        }
    ];
    // ...
    grid.innerHTML = difficulties.map(diff => {
        const isLocked = playerLevel < diff.requiredLevel;
        return `
            <div class="difficulty-card ${isLocked ? 'locked' : ''}" 
                 onclick="${isLocked ? '' : `selectDifficulty('${diff.id}')`}"
                 style="${!isLocked ? `border-color: ${diff.color}` : ''}">
                <h3 style="color: ${isLocked ? '#666' : diff.color}">${diff.label}</h3>
                <p>${diff.desc}</p>
                ${isLocked ? `<div class="lock-icon">🔒 Требуется ур. ${diff.requiredLevel}</div>` : ''}
            </div>
        `;
    }).join('');
};

window.selectDifficulty = function(diffId) {
    selectedDifficulty = diffId;
    showPage('page-time');
};

// ===== ЗАПУСК ИГРЫ =====
window.startGame = function(sessionTime) {
    // Скрываем все HTML-страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Показываем игровой контейнер
    document.getElementById('game-wrapper').classList.remove('hidden');
    
    window.gameData = { difficulty: selectedDifficulty, sessionTime };
    
    // Если игра уже была запущена, уничтожаем её полностью (очищаем память и состояние)
    if (window.gameInstance) {
        window.gameInstance.destroy(true);
        window.gameInstance = null;
    }
    
    // Создаем абсолютно новую, чистую сессию
    window.gameInstance = StartGame('game-container');
};

// ===== ВЫХОД ИЗ ИГРЫ =====
window.exitGame = function() {
    // Полностью уничтожаем экземпляр Phaser, очищая canvas и все внутренние таймеры
    if (window.gameInstance) {
        window.gameInstance.destroy(true);
        window.gameInstance = null;
    }
    // Возвращаемся на лендинг
    showPage('page-landing');
};

window.exitGame = function() {
    showPage('page-landing');
};

// ===== РЕЗУЛЬТАТЫ =====
window.showSessionResult = function(data) {
    const oldXP = parseInt(localStorage.getItem('playerXP') || '0');
    const oldLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const oldScore = parseInt(localStorage.getItem('playerScore') || '0');
    const oldSessions = parseInt(localStorage.getItem('sessionsCompleted') || '0');
    
    const xpEarned = Math.floor((data.loyalty + data.safety) / 2) + 30;
    const newXP = oldXP + xpEarned;
    const newLevel = Math.floor(newXP / 100) + 1;
    const newScore = oldScore + Math.floor((data.loyalty + data.safety) / 2);
    const newSessions = oldSessions + 1;
    
    localStorage.setItem('playerXP', newXP.toString());
    localStorage.setItem('playerLevel', newLevel.toString());
    localStorage.setItem('playerScore', newScore.toString());
    localStorage.setItem('sessionsCompleted', newSessions.toString());
    localStorage.setItem('loyaltySkill', data.loyalty.toString());
    localStorage.setItem('safetySkill', data.safety.toString());
    
    document.getElementById('result-loyalty').textContent = data.loyalty + '%';
    document.getElementById('result-safety').textContent = data.safety + '%';
    document.getElementById('result-xp').textContent = '+' + xpEarned;
    document.getElementById('result-level').textContent = newLevel;
    
    showPage('page-result');
};

// ===== ПРОФИЛЬ =====
window.loadProfilePage = async function() {
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
    
    const achGrid = document.getElementById('achievements-grid');
    const achievements = profile.achievements || [];
    
    if (achievements.length === 0) {
        achGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;padding:40px;">Пока нет достижений. Пройдите первую сессию!</div>';
    } else {
        achGrid.innerHTML = achievements.map(ach => `
            <div class="achievement-card unlocked">
                <div class="achievement-icon">${ach.icon || '🏆'}</div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.description}</div>
            </div>
        `).join('');
    }
};

// ===== ЛИДЕРБОРД =====
async function loadLeaderboard() {
    const lb = document.getElementById('leaderboard');
    const data = await getLeaderboard();
    
    if (!data || data.length === 0) {
        lb.innerHTML = '<div class="loading">Пока нет участников. Стань первым!</div>';
        return;
    }
    
    lb.innerHTML = data.map((player, idx) => `
        <div class="leaderboard-item">
            <div class="lb-rank">${idx + 1}</div>
            <div class="lb-name">${player.username}</div>
            <div class="lb-score">${player.total_score} XP</div>
        </div>
    `).join('');
}

loadLeaderboard();

// ===== ЛОГИКА HTML-ЧАТА =====
let chatData = {
    npcName: '',
    npcArchetype: null,
    scenarioContext: '',
    loyalty: 70,
    safety: 70,
    isProcessing: false
};

window.openChat = function(data) {
    chatData = {
        npcName: data.npcName || 'Пассажир',
        npcArchetype: data.npcArchetype || null,
        scenarioContext: data.scenarioContext || '',
        loyalty: data.loyalty || 70,
        safety: data.safety || 70,
        isProcessing: false
    };

    // Заполняем UI
    document.getElementById('chat-passenger-name').textContent = chatData.npcName;
    document.getElementById('chat-passenger-archetype').textContent = chatData.npcArchetype?.name || 'Пассажир';
    document.getElementById('chat-avatar').textContent = chatData.npcName.substring(0, 2).toUpperCase();
    document.getElementById('chat-archetype-desc').textContent = chatData.npcArchetype?.description || '';
    
    updateChatScales();
    
    // Очищаем сообщения и добавляем приветствие
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
    addChatMessage('npc', 'Здравствуйте. Рад вас видеть в нашем поезде.', chatData.npcName);
    
    // Показываем оверлей
    document.getElementById('chat-overlay').classList.add('active');
    document.getElementById('chat-input').focus();
};

window.closeChat = function() {
    document.getElementById('chat-overlay').classList.remove('active');
    
    // Возвращаем данные в Phaser и запускаем Debriefing
    if (window.gameInstance && window.gameInstance.scene.getScene('GameLevel')) {
        const gameLevel = window.gameInstance.scene.getScene('GameLevel');
        gameLevel.updateBarsFromChat(chatData.loyalty, chatData.safety);
        
        // Запускаем Debriefing
        window.gameInstance.scene.getScene('GameLevel').scene.launch('Debriefing', {
            loyalty: chatData.loyalty,
            safety: chatData.safety,
            startLoyalty: chatData.loyalty,
            startSafety: chatData.safety,
            npcName: chatData.npcName
        });
    }
};

window.sendChatMessage = async function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    if (!text || chatData.isProcessing) return;
    
    chatData.isProcessing = true;
    input.value = '';
    
    // Добавляем сообщение игрока
    addChatMessage('player', text, 'Вы');
    
    // Показываем "Печатает..."
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-typing';
    typingIndicator.textContent = 'Печатает...';
    document.getElementById('chat-messages').appendChild(typingIndicator);
    scrollToBottom();
    
    try {
        // Отправляем запрос к API
        const response = await fetch('http://127.0.0.1:8000/api/ai/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
                message: text,
                scenario_context: chatData.scenarioContext
            })
        });
        
        typingIndicator.remove();
        
        if (response.ok) {
            const data = await response.json();
            addChatMessage('npc', data.response || '[Нет ответа]', chatData.npcName);
            
            // Обновляем шкалы
            if (data.loyalty_change !== undefined) {
                chatData.loyalty = Math.max(0, Math.min(100, chatData.loyalty + data.loyalty_change));
            }
            if (data.safety_change !== undefined) {
                chatData.safety = Math.max(0, Math.min(100, chatData.safety + data.safety_change));
            }
            updateChatScales();
        } else {
            addChatMessage('npc', '[Система] Ошибка связи. Попробуйте позже.', 'Система');
        }
    } catch (error) {
        typingIndicator.remove();
        addChatMessage('npc', '[Система] Связь потеряна. Попробуйте позже.', 'Система');
    }
    
    chatData.isProcessing = false;
    input.focus();
};

window.handleChatKeyPress = function(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
};

function addChatMessage(type, text, name) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'chat-message-text';
    textDiv.textContent = text;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'chat-message-name';
    nameDiv.textContent = name;
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(nameDiv);
    messagesContainer.appendChild(messageDiv);
    
    scrollToBottom();
}

function updateChatScales() {
    document.getElementById('chat-loyalty-bar').style.width = chatData.loyalty + '%';
    document.getElementById('chat-loyalty-value').textContent = chatData.loyalty + '%';
    document.getElementById('chat-safety-bar').style.width = chatData.safety + '%';
    document.getElementById('chat-safety-value').textContent = chatData.safety + '%';
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}