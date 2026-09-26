import StartGame from './game/main';

// Phaser запустится автоматически при загрузке страницы index.html
window.addEventListener('DOMContentLoaded', () => {
    // Монтируем игру в блок 'game-container', который прописан в index.html
    StartGame('game-container');
});
