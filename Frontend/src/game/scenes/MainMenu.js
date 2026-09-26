import { Scene } from 'phaser';
import { getLeaderboard } from '../../api.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.leaderboardData = [];
    }

    async create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        // Фон
        this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0);

        // Заголовок
        this.add.text(W / 2, 60, 'ВСМ-400: ТРЕНИРОВКА ПРОВОДНИКОВ', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        // Кнопка ИГРАТЬ
        this.createButton(W / 2, 180, 'ИГРАТЬ', '#16c79a', () => {
            this.scene.start('DifficultySelect');
        });

        // Кнопка ПРОФИЛЬ / РЕГИСТРАЦИЯ
        const isAuth = !!localStorage.getItem('token');
        const profileBtn = this.createButton(W / 2, 280, isAuth ? 'ПРОФИЛЬ' : 'РЕГИСТРАЦИЯ', '#f39c12', () => {
            window.dispatchEvent(new CustomEvent('open-auth-overlay'));
        });

        // Тир-лист
        this.add.text(W / 2, 380, 'ТАБЛИЦА ЛИДЕРОВ', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // Загрузка данных из API
        this.leaderboardData = await getLeaderboard();
        this.renderLeaderboard(W, H);

        // Кнопка обновления тир-листа
        const refreshBtn = this.add.text(W / 2, H - 40, '🔄 Обновить', {
            fontFamily: 'Arial', fontSize: 18, color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        refreshBtn.on('pointerdown', async () => {
            this.leaderboardData = await getLeaderboard();
            this.renderLeaderboard(W, H);
        });
    }

    renderLeaderboard(W, H) {
        // Удаляем старый тир-лист
        this.children.list.filter(c => c.name === 'lb-item').forEach(c => c.destroy());

        const startY = 430;
        if (this.leaderboardData.length === 0) {
            this.add.text(W / 2, startY, 'Пока нет участников', {
                fontFamily: 'Arial', fontSize: 20, color: '#888888'
            }).setOrigin(0.5).setName('lb-item');
            return;
        }

        this.leaderboardData.forEach((player, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
            const text = `${medal} ${player.username} — Уровень ${player.level} | ${player.total_score} XP`;
            this.add.text(W / 2, startY + idx * 35, text, {
                fontFamily: 'Arial', fontSize: 20, color: '#ffffff'
            }).setOrigin(0.5).setName('lb-item');
        });
    }

    createButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            backgroundColor: color, padding: { x: 40, y: 15 },
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ffffff', color: color }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: color, color: '#ffffff' }));
        btn.on('pointerdown', callback);
        return btn;
    }
}