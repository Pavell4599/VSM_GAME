// Frontend/src/game/scenes/MainMenu.js
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // 1. Фон (убедись, что 'background' загружен в Preloader.js)
        this.add.image(640, 360, 'background').setDisplaySize(1280, 720);

        // 2. Заголовок
        this.add.text(640, 80, 'VSM GAME', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5);

        // 3. Кнопка "ИГРАТЬ"
        const playBtn = this.createButton(640, 220, 'ИГРАТЬ', '#00ff00', () => {
            this.scene.start('DifficultySelect');
        });

        // 4. Кнопка "ПРОФИЛЬ / РЕГИСТРАЦИЯ"
        const isAuth = localStorage.getItem('access_token');
        const profileText = isAuth ? 'ПРОФИЛЬ' : 'РЕГИСТРАЦИЯ';
        const profileBtn = this.createButton(640, 320, profileText, '#00ffff', () => {
            // Триггерим открытие HTML-оверлея
            document.getElementById('auth-overlay').style.display = 'flex';
            if (isAuth) loadProfileData(); // Функция из api.js
        });

        // 5. Тир-лист лучших игроков (визуальная часть)
        this.add.text(640, 450, 'ТОП ИГРОКОВ', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffd700',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // Заглушка, позже заменим на данные из API
        const leaderboardData = [
            { name: 'Pavel_Master', score: 9999 },
            { name: 'TrainDriver', score: 8500 },
            { name: 'Newbie_01', score: 7200 }
        ];

        let yPos = 510;
        leaderboardData.forEach((player, index) => {
            this.add.text(640, yPos, `${index + 1}. ${player.name} — ${player.score} XP`, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
            }).setOrigin(0.5);
            yPos += 40;
        });
    }

    // Вспомогательный метод для создания кнопок
    createButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Arial Black', fontSize: 32, color: color,
            backgroundColor: '#222222', padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#444444' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#222222' }));
        btn.on('pointerdown', callback);
        return btn;
    }
}