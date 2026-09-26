import { Scene } from 'phaser';

export class ScenarioResult extends Scene {
    constructor() {
        super('ScenarioResult');
    }

    create(data) {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0);

        this.add.text(W / 2, 60, 'РЕЗУЛЬТАТ СЦЕНАРИЯ', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, 130, data.scenario.title, {
            fontFamily: 'Arial', fontSize: 22, color: '#f1c40f'
        }).setOrigin(0.5);

        // Шкалы
        this.add.text(W / 2, 200, `Лояльность пассажира: ${data.loyalty}/100`, {
            fontFamily: 'Arial', fontSize: 22, color: '#27ae60'
        }).setOrigin(0.5);

        this.add.text(W / 2, 240, `Рейтинг безопасности: ${data.safety}/100`, {
            fontFamily: 'Arial', fontSize: 22, color: '#3498db'
        }).setOrigin(0.5);

        // Результат от сервера
        if (data.result) {
            this.add.text(W / 2, 300, `Получено XP: +${data.result.xp_earned}`, {
                fontFamily: 'Arial Black', fontSize: 24, color: '#f39c12'
            }).setOrigin(0.5);

            this.add.text(W / 2, 340, `Новый уровень: ${data.result.new_level}`, {
                fontFamily: 'Arial', fontSize: 20, color: '#ffffff'
            }).setOrigin(0.5);

            // Обратная связь по выборам
            if (data.result.feedback && data.result.feedback.length > 0) {
                let yPos = 400;
                this.add.text(W / 2, yPos - 20, 'РАЗБОР РЕШЕНИЙ:', {
                    fontFamily: 'Arial Black', fontSize: 18, color: '#f1c40f'
                }).setOrigin(0.5);

                for (const fb of data.result.feedback) {
                    const icon = fb.is_optimal ? '✓' : '✗';
                    const color = fb.is_optimal ? '#27ae60' : '#e74c3c';
                    this.add.text(W / 2, yPos, `${icon} ${fb.feedback}`, {
                        fontFamily: 'Arial', fontSize: 16, color: color,
                        wordWrap: { width: W - 100 }, align: 'center'
                    }).setOrigin(0.5);
                    yPos += 50;
                }
            }
        }

        // Кнопки
        this.add.text(W / 2 - 150, H - 80, 'В МЕНЮ', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#fff',
            backgroundColor: '#7f8c8d', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MainMenu'));

        this.add.text(W / 2 + 150, H - 80, 'ЗАНОВО', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#fff',
            backgroundColor: '#2980b9', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('ScenarioPlay', { scenario: data.scenario }));
    }
}