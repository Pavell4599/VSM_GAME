import { Scene } from 'phaser';
import { getScenarios } from '../../api.js';

export class ScenarioList extends Scene {
    constructor() {
        super('ScenarioList');
    }

    async create(data) {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        const difficulty = data.difficulty || 'standard';

        this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0);

        this.add.text(W / 2, 60, `СЦЕНАРИИ: ${difficulty.toUpperCase()}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff'
        }).setOrigin(0.5);

        const scenarios = await getScenarios(difficulty);

        if (scenarios.length === 0) {
            this.add.text(W / 2, H / 2, 'Сценарии не найдены', {
                fontFamily: 'Arial', fontSize: 24, color: '#888888'
            }).setOrigin(0.5);
            return;
        }

        let yPos = 140;
        for (const sc of scenarios) {
            const btn = this.add.text(W / 2, yPos, 
                `${sc.title}\n${sc.description}\n⏱ ${sc.time_limit}с |  ${sc.xp_reward} XP`, {
                fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
                backgroundColor: '#2c3e50', padding: { x: 30, y: 15 }, align: 'center'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#34495e' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2c3e50' }));
            btn.on('pointerdown', () => {
                this.scene.start('ScenarioPlay', { scenario: sc });
            });
            yPos += 130;
        }

        this.add.text(W / 2, H - 40, '← НАЗАД', {
            fontFamily: 'Arial', fontSize: 20, color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('DifficultySelect'));
    }
}