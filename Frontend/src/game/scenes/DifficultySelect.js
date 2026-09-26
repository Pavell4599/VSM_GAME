import { Scene } from 'phaser';

export class DifficultySelect extends Scene {
    constructor() {
        super('DifficultySelect');
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.add.rectangle(0, 0, W, H, 0x0a1628).setOrigin(0);

        this.add.text(W / 2, 60, 'ВЫБЕРИТЕ КЛАСС ВАГОНА', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#c9a961',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        const difficulties = [
            { id: 'standard', label: 'СТАНДАРТ', color: '#3498db', desc: 'Базовые ситуации' },
            { id: 'comfort', label: 'КОМФОРТ', color: '#2ecc71', desc: 'Повышенные требования' },
            { id: 'business', label: 'БИЗНЕС', color: '#f39c12', desc: 'Сложные конфликты' },
            { id: 'first', label: 'ПЕРВЫЙ КЛАСС', color: '#e74c3c', desc: 'Максимальный стресс' }
        ];

        let yPos = 140;
        for (const diff of difficulties) {
            const btn = this.add.text(W / 2, yPos, 
                `${diff.label}\n${diff.desc}`, {
                fontFamily: 'Arial', fontSize: 22, color: '#ffffff',
                backgroundColor: diff.color, padding: { x: 50, y: 20 }, align: 'center',
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ffffff', color: diff.color }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: diff.color, color: '#ffffff' }));
            btn.on('pointerdown', () => {
                this.showTimeSelect(diff);
            });
            yPos += 110;
        }

        this.add.text(W / 2, H - 40, '← НАЗАД', {
            fontFamily: 'Arial', fontSize: 20, color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MainMenu'));
    }

    showTimeSelect(difficulty) {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        
        this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(50);
        
        this.add.text(W / 2, 150, 'КЛАСС: ' + difficulty.label + '\nВЫБЕРИТЕ ДЛИТЕЛЬНОСТЬ СЕССИИ', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#c9a961', align: 'center'
        }).setOrigin(0.5).setDepth(51);
        
        // НОВЫЕ ВАРИАНТЫ ВРЕМЕНИ
        const times = [
            { label: '5 МИНУТ', seconds: 300 },
            { label: '10 МИНУТ', seconds: 600 },
            { label: '15 МИНУТ', seconds: 900 },
            { label: '20 МИНУТ', seconds: 1200 },
            { label: '30 МИНУТ', seconds: 1800 }
        ];
        
        let yPos = 280;
        times.forEach(time => {
            const btn = this.add.text(W / 2, yPos, time.label, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
                backgroundColor: '#2c3e50', padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(51);
            
            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#c9a961', color: '#0a1628' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2c3e50', color: '#ffffff' }));
            btn.on('pointerdown', () => {
                this.scene.start('GameLevel', {
                    difficulty: difficulty.id,
                    sessionTime: time.seconds // Передаем выбранное время
                });
            });
            yPos += 80;
        });
    }
}