import { Scene, Math as PhaserMath } from 'phaser';
import { aiChat } from '../../api.js';

export class NPCChat extends Scene {
    constructor() {
        super('NPCChat');
        this.npcName = 'Пассажир';
        this.scenarioContext = '';
        this.loyalty = 70;
        this.safety = 70;
        this.inputActive = false;
        this.currentInput = '';
        this.messagesY = 0;
        this.maxChatHeight = 350;
    }

    init(data) {
        this.npcName = data.npcName || 'Пассажир';
        this.npcId = data.npcId !== undefined ? data.npcId : 0; // <-- ДОБАВИТЬ
        this.scenarioContext = data.scenarioContext || '';
        this.startLoyalty = data.loyalty !== undefined ? data.loyalty : 70;
        this.startSafety = data.safety !== undefined ? data.safety : 70;
        this.loyalty = this.startLoyalty;
        this.safety = this.startSafety;
        this.difficulty = data.difficulty || 'standard';
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setDepth(100);

        const chatW = 700;
        const chatH = 480;
        const chatX = (W - chatW) / 2;
        const chatY = (H - chatH) / 2;

        const chatBg = this.add.rectangle(chatX, chatY, chatW, chatH, 0x1a2a4a, 0.98)
            .setOrigin(0).setDepth(101).setStrokeStyle(2, 0xc9a961);

        this.add.rectangle(chatX, chatY, chatW, 50, 0x0f1d35).setOrigin(0).setDepth(102);
        this.add.text(chatX + 20, chatY + 25, '💬 ' + this.npcName, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#c9a961'
        }).setOrigin(0, 0.5).setDepth(103);

        // Шкалы в чате
        this.add.text(chatX + chatW - 260, chatY + 15, 'Лояльность:', { fontFamily: 'Arial', fontSize: 12, color: '#8899bb' }).setDepth(103);
        this.loyaltyBar = this.add.rectangle(chatX + chatW - 180, chatY + 15, 100, 10, 0x27ae60).setOrigin(0, 0.5).setDepth(103);
        this.loyaltyText = this.add.text(chatX + chatW - 70, chatY + 15, this.loyalty + '%', { fontFamily: 'Arial Black', fontSize: 12, color: '#27ae60' }).setOrigin(0, 0.5).setDepth(103);

        this.add.text(chatX + chatW - 260, chatY + 35, 'Безопасность:', { fontFamily: 'Arial', fontSize: 12, color: '#8899bb' }).setDepth(103);
        this.safetyBar = this.add.rectangle(chatX + chatW - 180, chatY + 35, 100, 10, 0x3498db).setOrigin(0, 0.5).setDepth(103);
        this.safetyText = this.add.text(chatX + chatW - 70, chatY + 35, this.safety + '%', { fontFamily: 'Arial Black', fontSize: 12, color: '#3498db' }).setOrigin(0, 0.5).setDepth(103);

        this.messagesContainer = this.add.container(chatX + 20, chatY + 65).setDepth(102);

        const inputY = chatY + chatH - 50;
        this.add.rectangle(chatX + 20, inputY, chatW - 90, 40, 0x2c3e50).setOrigin(0, 0.5).setDepth(102).setStrokeStyle(1, 0x34495e);
        
        this.inputDisplay = this.add.text(chatX + 35, inputY, 'Нажмите Enter для ввода...', {
            fontFamily: 'Arial', fontSize: 16, color: '#8899bb'
        }).setOrigin(0, 0.5).setDepth(103);

        const inputZone = this.add.zone(chatX + 20, inputY, chatW - 90, 40)
            .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(104);
        inputZone.on('pointerdown', () => this.activateInput());

        const sendBtn = this.add.rectangle(chatX + chatW - 45, inputY, 45, 40, 0xc9a961)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);
        this.add.text(chatX + chatW - 45, inputY, '▶', { fontFamily: 'Arial', fontSize: 18, color: '#0a1628' }).setOrigin(0.5).setDepth(103);
        sendBtn.on('pointerdown', () => this.sendCurrentMessage());

        const closeBtn = this.add.rectangle(chatX + chatW - 25, chatY + 25, 30, 30, 0xe74c3c)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(103);
        this.add.text(chatX + chatW - 25, chatY + 25, '×', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' }).setOrigin(0.5).setDepth(104);
        closeBtn.on('pointerdown', () => this.finishChat());

        this.addNPCMessage('Здравствуйте! Рад вас видеть в нашем поезде.');

        this.input.keyboard.on('keydown', (event) => {
            if (this.inputActive) {
                if (event.key === 'Enter') this.sendCurrentMessage();
                else if (event.key === 'Escape') this.deactivateInput();
                else if (event.key === 'Backspace') {
                    this.currentInput = this.currentInput.slice(0, -1);
                    this.updateInputDisplay();
                } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
                    this.currentInput += event.key;
                    this.updateInputDisplay();
                }
            } else {
                if (event.key === 'Enter') this.activateInput();
            }
        });
    }

    activateInput() { this.inputActive = true; this.currentInput = ''; this.updateInputDisplay(); }
    deactivateInput() { this.inputActive = false; this.currentInput = ''; this.updateInputDisplay(); }

    updateInputDisplay() {
        if (this.inputActive) {
            this.inputDisplay.setText(this.currentInput + '|');
            this.inputDisplay.setColor('#ffffff');
        } else {
            this.inputDisplay.setText('Нажмите Enter для ввода...');
            this.inputDisplay.setColor('#8899bb');
        }
    }

    sendCurrentMessage() {
        const text = this.currentInput.trim();
        if (!text) { this.deactivateInput(); return; }
        this.deactivateInput();
        this.processPlayerMessage(text);
    }

    addNPCMessage(text) {
        const msgW = 400, msgH = 60;
        const bubble = this.add.rectangle(0, this.messagesY, msgW, msgH, 0x2c3e50).setOrigin(0, 0).setStrokeStyle(1, 0x34495e);
        const msgText = this.add.text(15, this.messagesY + 10, text, { fontFamily: 'Arial', fontSize: 15, color: '#ffffff', wordWrap: { width: msgW - 30 } }).setOrigin(0, 0);
        const nameText = this.add.text(15, this.messagesY + msgH + 5, this.npcName, { fontFamily: 'Arial', fontSize: 11, color: '#8899bb' }).setOrigin(0, 0);
        this.messagesContainer.add([bubble, msgText, nameText]);
        this.messagesY += msgH + 25;
        this.scrollDown();
    }

    addPlayerMessage(text) {
        const msgW = 400, msgH = 60, offsetX = 280;
        const bubble = this.add.rectangle(offsetX, this.messagesY, msgW, msgH, 0x2980b9).setOrigin(0, 0);
        const msgText = this.add.text(offsetX + 15, this.messagesY + 10, text, { fontFamily: 'Arial', fontSize: 15, color: '#ffffff', wordWrap: { width: msgW - 30 } }).setOrigin(0, 0);
        const nameText = this.add.text(offsetX + msgW - 40, this.messagesY + msgH + 5, 'Вы', { fontFamily: 'Arial', fontSize: 11, color: '#8899bb' }).setOrigin(0, 0);
        this.messagesContainer.add([bubble, msgText, nameText]);
        this.messagesY += msgH + 25;
        this.scrollDown();
    }

    addTypingIndicator() {
        const typing = this.add.text(15, this.messagesY, 'Печатает...', { fontFamily: 'Arial', fontSize: 13, color: '#8899bb', fontStyle: 'italic' }).setOrigin(0, 0);
        this.messagesContainer.add(typing);
        this.messagesY += 25;
        this.scrollDown();
        return typing;
    }

    scrollDown() {
        if (this.messagesY > this.maxChatHeight) {
            this.messagesContainer.y = -(this.messagesY - this.maxChatHeight);
        }
    }

    async processPlayerMessage(text) {
        this.addPlayerMessage(text);
        const typingIndicator = this.addTypingIndicator();

        try {
            const response = await aiChat(text, this.scenarioContext);
            typingIndicator.destroy();

            if (response && response.response) {
                this.addNPCMessage(response.response);
                if (response.loyalty_change !== undefined) this.loyalty = PhaserMath.Clamp(this.loyalty + response.loyalty_change, 0, 100);
                if (response.safety_change !== undefined) this.safety = PhaserMath.Clamp(this.safety + response.safety_change, 0, 100);
                this.updateBars();
            }
        } catch (error) {
            typingIndicator.destroy();
            this.addNPCMessage('[Система] Связь потеряна. Попробуйте позже.');
        }
    }

    updateBars() {
        this.loyaltyBar.width = 100 * (this.loyalty / 100);
        this.safetyBar.width = 100 * (this.safety / 100);
        this.loyaltyText.setText(this.loyalty + '%');
        this.safetyText.setText(this.safety + '%');
        this.loyaltyBar.fillColor = this.loyalty < 30 ? 0xe74c3c : (this.loyalty < 60 ? 0xf39c12 : 0x27ae60);
        this.safetyBar.fillColor = this.safety < 30 ? 0xe74c3c : (this.safety < 60 ? 0xf39c12 : 0x3498db);
    }

    finishChat() {
        // 1. Обновляем шкалы в фоновой сцене GameLevel
        const gameLevel = this.scene.get('GameLevel');
        if (gameLevel) {
            gameLevel.updateBarsFromChat(this.loyalty, this.safety);
        }
        // 2. Закрываем чат (GameLevel становится видимым и продолжает работать)
        this.scene.stop();
        // 3. Сразу открываем сцену разбора полетов поверх игры
        this.scene.launch('Debriefing', {
            loyalty: this.loyalty,
            safety: this.safety,
            startLoyalty: this.startLoyalty,
            startSafety: this.startSafety,
            npcName: this.npcName
        });
    }
}