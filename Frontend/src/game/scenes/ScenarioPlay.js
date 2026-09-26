import { Scene } from 'phaser';
import { completeScenario } from '../../api.js';

export class ScenarioPlay extends Scene {
    constructor() {
        super('ScenarioPlay');
        this.scenario = null;
        this.currentNode = null;
        this.loyalty = 50;
        this.safety = 50;
        this.choicesMade = [];
        this.timeLeft = 0;
        this.timerEvent = null;
    }

    create(data) {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.scenario = data.scenario;
        if (!this.scenario || !this.scenario.nodes || this.scenario.nodes.length === 0) {
            this.add.text(W / 2, H / 2, 'Ошибка загрузки сценария', {
                fontFamily: 'Arial', fontSize: 24, color: '#e74c3c'
            }).setOrigin(0.5);
            return;
        }

        this.add.rectangle(0, 0, W, H, 0x2c3e50).setOrigin(0);

        // Шкалы
        this.loyaltyBar = this.add.rectangle(200, 40, 300, 20, 0x27ae60).setOrigin(0, 0.5);
        this.safetyBar = this.add.rectangle(200, 70, 300, 20, 0x3498db).setOrigin(0, 0.5);
        this.add.text(100, 40, 'Лояльность:', { fontFamily: 'Arial', fontSize: 16, color: '#fff' });
        this.add.text(100, 70, 'Безопасность:', { fontFamily: 'Arial', fontSize: 16, color: '#fff' });
        this.loyaltyText = this.add.text(520, 40, '50', { fontFamily: 'Arial', fontSize: 16, color: '#fff' });
        this.safetyText = this.add.text(520, 70, '50', { fontFamily: 'Arial', fontSize: 16, color: '#fff' });

        // Таймер
        this.timerText = this.add.text(W - 100, 50, '60', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#e74c3c'
        }).setOrigin(0.5);

        // Текст диалога
        this.dialogText = this.add.text(W / 2, 200, '', {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff',
            wordWrap: { width: W - 100 }, align: 'center'
        }).setOrigin(0.5);

        this.speakerText = this.add.text(W / 2, 150, '', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#f1c40f'
        }).setOrigin(0.5);

        // Кнопки выбора (создаются динамически)
        this.choiceButtons = [];

        // Запуск с первого узла
        this.startNode(this.scenario.nodes[0]);
    }

    startNode(node) {
        this.currentNode = node;
        this.speakerText.setText(node.speaker || '');
        this.dialogText.setText(node.text || '');

        // Очистка старых кнопок
        this.choiceButtons.forEach(b => b.destroy());
        this.choiceButtons = [];

        if (this.timerEvent) this.timerEvent.remove();

        if (node.node_type === 'choice' && node.choices && node.choices.length > 0) {
            this.timeLeft = node.time_limit || this.scenario.time_limit || 60;
            this.timerText.setText(this.timeLeft);

            this.timerEvent = this.time.addEvent({
                delay: 1000,
                repeat: this.timeLeft - 1,
                callback: () => {
                    this.timeLeft--;
                    this.timerText.setText(this.timeLeft);
                    if (this.timeLeft <= 10) {
                        this.timerText.setColor('#e74c3c');
                    }
                    if (this.timeLeft <= 0) {
                        this.timeUp();
                    }
                }
            });

            const W = this.sys.game.config.width;
            let yPos = 320;
            for (const choice of node.choices) {
                const btn = this.add.text(W / 2, yPos, choice.text, {
                    fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
                    backgroundColor: '#34495e', padding: { x: 30, y: 12 },
                    wordWrap: { width: W - 200 }, align: 'center'
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#2980b9' }));
                btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#34495e' }));
                btn.on('pointerdown', () => this.makeChoice(choice));

                this.choiceButtons.push(btn);
                yPos += 80;
            }
        } else if (node.node_type === 'result') {
            this.timerText.setText('✓');
            const finishBtn = this.add.text(this.sys.game.config.width / 2, 400, 'ЗАВЕРШИТЬ', {
                fontFamily: 'Arial Black', fontSize: 24, color: '#fff',
                backgroundColor: '#27ae60', padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            finishBtn.on('pointerdown', () => this.finishScenario());
            this.choiceButtons.push(finishBtn);
        } else {
            // dialog - кнопка "Далее"
            const nextBtn = this.add.text(this.sys.game.config.width / 2, 400, 'ДАЛЕЕ →', {
                fontFamily: 'Arial Black', fontSize: 22, color: '#fff',
                backgroundColor: '#2980b9', padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            nextBtn.on('pointerdown', () => this.goToNextNode());
            this.choiceButtons.push(nextBtn);
        }
    }

    makeChoice(choice) {
        if (this.timerEvent) this.timerEvent.remove();
        
        this.choicesMade.push(choice.id);
        this.loyalty = Math.max(0, Math.min(100, this.loyalty + (choice.loyalty_change || 0)));
        this.safety = Math.max(0, Math.min(100, this.safety + (choice.safety_change || 0)));
        
        this.loyaltyBar.width = 3 * this.loyalty;
        this.safetyBar.width = 3 * this.safety;
        this.loyaltyText.setText(this.loyalty);
        this.safetyText.setText(this.safety);

        // Показать обратную связь
        if (choice.feedback) {
            this.showFeedback(choice.feedback, choice.is_optimal, () => {
                this.goToNodeById(choice.next_node);
            });
        } else {
            this.goToNodeById(choice.next_node);
        }
    }

    showFeedback(text, isOptimal, callback) {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        
        const bg = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(100);
        const color = isOptimal ? '#27ae60' : '#e74c3c';
        const icon = isOptimal ? '✓ Отлично!' : '⚠ Не лучший выбор';
        
        const feedbackText = this.add.text(W / 2, H / 2 - 50, `${icon}\n\n${text}`, {
            fontFamily: 'Arial', fontSize: 20, color: '#ffffff',
            wordWrap: { width: W - 200 }, align: 'center'
        }).setOrigin(0.5).setDepth(101);

        const continueBtn = this.add.text(W / 2, H / 2 + 100, 'ПРОДОЛЖИТЬ', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#fff',
            backgroundColor: color, padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);

        continueBtn.on('pointerdown', () => {
            bg.destroy();
            feedbackText.destroy();
            continueBtn.destroy();
            callback();
        });
    }

    goToNodeById(nodeId) {
        if (!nodeId) {
            this.finishScenario();
            return;
        }
        const node = this.scenario.nodes.find(n => n.node_id === nodeId);
        if (node) this.startNode(node);
        else this.finishScenario();
    }

    goToNextNode() {
        const idx = this.scenario.nodes.indexOf(this.currentNode);
        if (idx < this.scenario.nodes.length - 1) {
            this.startNode(this.scenario.nodes[idx + 1]);
        } else {
            this.finishScenario();
        }
    }

    timeUp() {
        this.loyalty = Math.max(0, this.loyalty - 20);
        this.safety = Math.max(0, this.safety - 10);
        this.loyaltyBar.width = 3 * this.loyalty;
        this.safetyBar.width = 3 * this.safety;
        this.loyaltyText.setText(this.loyalty);
        this.safetyText.setText(this.safety);
        
        this.showFeedback('Время вышло! Пассажир остался без внимания.', false, () => {
            this.finishScenario();
        });
    }

    async finishScenario() {
        const token = localStorage.getItem('token');
        let result = null;
        
        if (token) {
            result = await completeScenario(
                this.scenario.id, this.loyalty, this.safety, this.choicesMade
            );
        }

        this.scene.start('ScenarioResult', {
            scenario: this.scenario,
            loyalty: this.loyalty,
            safety: this.safety,
            choicesMade: this.choicesMade,
            result: result
        });
    }
}