// Frontend/src/game/scenes/DifficultySelect.js
import { Scene } from 'phaser';

export class DifficultySelect extends Scene {
    constructor() {
        super('DifficultySelect');
    }

    create() {
        this.add.image(640, 360, 'background').setDisplaySize(1280, 720);

        this.add.text(640, 120, 'ВЫБЕРИТЕ СЛОЖНОСТЬ', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        const difficulties = [
            { label: 'ЛЕГКО', color: '#00ff00', level: 1 },
            { label: 'НОРМАЛЬНО', color: '#ffff00', level: 2 },
            { label: 'СЛОЖНО', color: '#ff8800', level: 3 },
            { label: 'ХАРДКОР', color: '#ff0000', level: 4 }
        ];

        let yPos = 240;
        difficulties.forEach(diff => {
            const btn = this.add.text(640, yPos, diff.label, {
                fontFamily: 'Arial', fontSize: 36, color: diff.color,
                backgroundColor: '#222222', padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#444444' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#222222' }));
            btn.on('pointerdown', () => {
                // Передаем данные в сцену игры
                this.scene.start('GameLevel', { difficulty: diff.level });
            });
            yPos += 90;
        });

        // Кнопка "Назад"
        const backBtn = this.add.text(640, 620, '← НАЗАД В МЕНЮ', {
            fontFamily: 'Arial', fontSize: 28, color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}