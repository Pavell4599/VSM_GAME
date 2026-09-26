import StartGame from './game/main.js';

let gameInstance = null;

// Запуск игры по кнопке "ИГРАТЬ"
document.getElementById('btn-play').addEventListener('click', () => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hidden');
    
    if (!gameInstance) {
        gameInstance = StartGame('game-container');
    }
});

// Загрузка тир-листа при старте
import { getLeaderboard } from './api.js';

async function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const data = await getLeaderboard();
    
    if (data.length === 0) {
        leaderboard.innerHTML = '<div class="loading">Пока нет участников. Стань первым!</div>';
        return;
    }
    
    leaderboard.innerHTML = data.map((player, idx) => `
        <div class="leaderboard-item" style="animation-delay: ${idx * 0.1}s">
            <div class="leaderboard-rank">${idx + 1}</div>
            <div class="leaderboard-name">${player.username}</div>
            <div class="leaderboard-score">${player.total_score} XP</div>
        </div>
    `).join('');
}

loadLeaderboard();