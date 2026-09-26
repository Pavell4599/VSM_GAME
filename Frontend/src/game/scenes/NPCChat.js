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
        this.maxChatHeight = 320;
        this.isListening = false;
        this.recognition = null;
        this.isDragging = false;
        this.dragStartY = 0;
        this.containerStartY = 0;
    }

    init(data) {
        this.npcName = data.npcName || 'Пассажир';
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

        // Затемнение фона
        this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(100);

        // === ОКНО ЧАТА ===
        const chatW = 720;
        const chatH = 540;
        const chatX = (W - chatW) / 2;
        const chatY = (H - chatH) / 2;

        // Фон окна (белый)
        this.add.rectangle(chatX, chatY, chatW, chatH, 0xffffff, 0.98)
            .setOrigin(0).setDepth(101).setStrokeStyle(2, 0xe63946);

        // Красная полоса сверху
        this.add.rectangle(chatX, chatY, chatW, 3, 0xe63946).setOrigin(0, 0).setDepth(102);

        // === ШАПКА ===
        this.add.rectangle(chatX, chatY, chatW, 60, 0xf5f5f5).setOrigin(0, 0).setDepth(102);

        // Имя NPC
        this.add.text(chatX + 25, chatY + 30, this.npcName, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(103);

        // Статус
        this.add.text(chatX + 25, chatY + 48, '● в сети', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            color: '#27ae60'
        }).setOrigin(0, 0).setDepth(103);

        // === ШКАЛЫ В ШАПКЕ ===
        const scaleX = chatX + chatW - 240;
        
        this.add.text(scaleX, chatY + 20, 'ЛОЯЛЬНОСТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            fontWeight: '600',
            color: '#666666',
            letterSpacing: 1
        }).setDepth(103);

        this.loyaltyBarBg = this.add.rectangle(scaleX, chatY + 35, 100, 6, 0xe0e0e0).setOrigin(0, 0.5).setDepth(103);
        this.loyaltyBarFill = this.add.rectangle(scaleX, chatY + 35, 100 * (this.loyalty / 100), 6, this.getLoyaltyColor(this.loyalty)).setOrigin(0, 0.5).setDepth(104);
        this.loyaltyText = this.add.text(scaleX + 110, chatY + 35, this.loyalty + '%', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setDepth(103);

        this.add.text(scaleX, chatY + 48, 'БЕЗОПАСНОСТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            fontWeight: '600',
            color: '#666666',
            letterSpacing: 1
        }).setDepth(103);

        this.safetyBarBg = this.add.rectangle(scaleX, chatY + 63, 100, 6, 0xe0e0e0).setOrigin(0, 0.5).setDepth(103);
        this.safetyBarFill = this.add.rectangle(scaleX, chatY + 63, 100 * (this.safety / 100), 6, this.getSafetyColor(this.safety)).setOrigin(0, 0.5).setDepth(104);
        this.safetyText = this.add.text(scaleX + 110, chatY + 63, this.safety + '%', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setDepth(103);

        // === КНОПКА ЗАКРЫТИЯ ===
        const closeBtn = this.add.rectangle(chatX + chatW - 30, chatY + 30, 28, 28, 0xe0e0e0)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(103);
        this.add.text(chatX + chatW - 30, chatY + 30, '×', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            color: '#1a1a1a'
        }).setOrigin(0.5).setDepth(104);
        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xe63946));
        closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xe0e0e0));
        closeBtn.on('pointerdown', () => this.finishChat());

        // === ОБЛАСТЬ СООБЩЕНИЙ ===
        const msgAreaX = chatX + 20;
        const msgAreaY = chatY + 70;
        const msgAreaW = chatW - 40;
        const msgAreaH = chatH - 150;

        // Фон области сообщений
        this.add.rectangle(msgAreaX, msgAreaY, msgAreaW, msgAreaH, 0xf8f8f8)
            .setOrigin(0, 0).setDepth(101);

        // === МАСКА ДЛЯ ОБРЕЗКИ СООБЩЕНИЙ ===
        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(msgAreaX, msgAreaY, msgAreaW, msgAreaH);
        const mask = maskGraphics.createGeometryMask();

        // Контейнер сообщений
        this.messagesContainer = this.add.container(msgAreaX, msgAreaY).setDepth(102);
        this.messagesContainer.setMask(mask);

        // === ПОЛЕ ВВОДА ===
        const inputY = chatY + chatH - 55;
        const inputWidth = chatW - 120;

        this.add.rectangle(chatX + 20, inputY, inputWidth, 42, 0xffffff)
            .setOrigin(0, 0.5).setDepth(102).setStrokeStyle(1, 0xe0e0e0);

        this.inputDisplay = this.add.text(chatX + 35, inputY, 'Нажмите Enter или  для голосового ввода...', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            color: '#999999'
        }).setOrigin(0, 0.5).setDepth(103);

        const inputZone = this.add.zone(chatX + 20, inputY, inputWidth, 42)
            .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(104);
        inputZone.on('pointerdown', () => this.activateInput());

        // === КНОПКА МИКРОФОНА (ВСЕГДА ВИДНА, ВЫСОКИЙ DEPTH) ===
        this.micBtn = this.add.rectangle(chatX + chatW - 85, inputY, 42, 42, 0xffffff)
            .setOrigin(0.5).setStrokeStyle(1, 0xe0e0e0).setInteractive({ useHandCursor: true }).setDepth(110);
        this.micIcon = this.add.text(chatX + chatW - 85, inputY, '🎤', {
            fontFamily: 'Arial',
            fontSize: '20px'
        }).setOrigin(0.5).setDepth(111);
        this.micBtn.on('pointerover', () => this.micBtn.setStrokeStyle(1, 0xe63946));
        this.micBtn.on('pointerout', () => this.micBtn.setStrokeStyle(1, 0xe0e0e0));
        this.micBtn.on('pointerdown', () => this.toggleVoiceInput());

        // === КНОПКА ОТПРАВКИ (ВСЕГДА ВИДНА, ВЫСОКИЙ DEPTH) ===
        const sendBtn = this.add.rectangle(chatX + chatW - 35, inputY, 42, 42, 0xe63946)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(110);
        this.add.text(chatX + chatW - 35, inputY, '▶', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(111);
        sendBtn.on('pointerover', () => sendBtn.setFillStyle(0xb91c2c));
        sendBtn.on('pointerout', () => sendBtn.setFillStyle(0xe63946));
        sendBtn.on('pointerdown', () => this.sendCurrentMessage());

        // === ПРОКРУТКА КОЛЁСИКОМ МЫШИ ===
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (pointer.x >= msgAreaX && pointer.x <= msgAreaX + msgAreaW &&
                pointer.y >= msgAreaY && pointer.y <= msgAreaY + msgAreaH) {
                this.messagesContainer.y -= deltaY * 0.5;
                this.clampScroll();
            }
        });

        // === ПРОКРУТКА ПЕРЕТАСКИВАНИЕМ (DRAG) ===
        const dragZone = this.add.zone(msgAreaX, msgAreaY, msgAreaW, msgAreaH)
            .setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(105);
        
        dragZone.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.messagesContainer.y;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const delta = pointer.y - this.dragStartY;
                this.messagesContainer.y = this.containerStartY + delta;
                this.clampScroll();
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Голосовой ввод
        this.initVoiceRecognition();

        // Приветствие
        this.addNPCMessage('Здравствуйте. Рад вас видеть в нашем поезде.');

        // Клавиатура
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

    // Ограничение прокрутки (не даём уехать слишком далеко)
    clampScroll() {
        const maxScroll = 0;
        const minScroll = -(this.messagesY - this.maxChatHeight);
        if (this.messagesContainer.y > maxScroll) {
            this.messagesContainer.y = maxScroll;
        } else if (this.messagesContainer.y < minScroll) {
            this.messagesContainer.y = minScroll;
        }
    }

    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'ru-RU';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.currentInput = transcript;
                this.updateInputDisplay();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.micBtn.setFillStyle(0xffffff);
                this.micIcon.setText('🎤');
            };

            this.recognition.onerror = (event) => {
                console.warn('Голосовой ввод ошибка:', event.error);
                this.isListening = false;
                this.micBtn.setFillStyle(0xffffff);
                this.micIcon.setText('🎤');
            };
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.addNPCMessage('[Система] Голосовой ввод не поддерживается. Используйте Chrome или Edge.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.micBtn.setFillStyle(0xffffff);
            this.micIcon.setText('🎤');
        } else {
            try {
                this.recognition.start();
                this.isListening = true;
                this.micBtn.setFillStyle(0xe63946);
                this.micIcon.setText('🔴');
                this.currentInput = '';
                this.updateInputDisplay();
            } catch (e) {
                console.warn('Ошибка запуска распознавания:', e);
            }
        }
    }

    activateInput() {
        this.inputActive = true;
        this.currentInput = '';
        this.updateInputDisplay();
    }

    deactivateInput() {
        this.inputActive = false;
        this.currentInput = '';
        this.updateInputDisplay();
    }

    updateInputDisplay() {
        if (this.inputActive) {
            this.inputDisplay.setText((this.currentInput || '') + '|');
            this.inputDisplay.setColor('#1a1a1a');
        } else if (this.isListening) {
            this.inputDisplay.setText((this.currentInput || '') + ' слушает...');
            this.inputDisplay.setColor('#e63946');
        } else {
            this.inputDisplay.setText('Нажмите Enter или 🎤 для голосового ввода...');
            this.inputDisplay.setColor('#999999');
        }
    }

    sendCurrentMessage() {
        const text = this.currentInput.trim();
        if (!text) { this.deactivateInput(); return; }
        this.deactivateInput();
        this.processPlayerMessage(text);
    }

    addNPCMessage(text) {
        const msgW = 420;
        const msgH = 65;
        
        const bubble = this.add.rectangle(0, this.messagesY, msgW, msgH, 0xf0f0f0)
            .setOrigin(0, 0).setStrokeStyle(1, 0xe0e0e0);
        
        const msgText = this.add.text(15, this.messagesY + 12, text, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            color: '#1a1a1a',
            wordWrap: { width: msgW - 30 },
            lineSpacing: 3
        }).setOrigin(0, 0);
        
        const nameText = this.add.text(15, this.messagesY + msgH + 4, this.npcName, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            color: '#999999',
            fontWeight: '600'
        }).setOrigin(0, 0);
        
        this.messagesContainer.add([bubble, msgText, nameText]);
        this.messagesY += msgH + 20;
        this.scrollToBottom();
    }

    addPlayerMessage(text) {
        const msgW = 420;
        const msgH = 65;
        const offsetX = 280;
        
        const bubble = this.add.rectangle(offsetX, this.messagesY, msgW, msgH, 0xe63946)
            .setOrigin(0, 0);
        
        const msgText = this.add.text(offsetX + 15, this.messagesY + 12, text, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: msgW - 30 },
            lineSpacing: 3
        }).setOrigin(0, 0);
        
        const nameText = this.add.text(offsetX + msgW - 30, this.messagesY + msgH + 4, 'Вы', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            color: '#999999',
            fontWeight: '600'
        }).setOrigin(0, 0);
        
        this.messagesContainer.add([bubble, msgText, nameText]);
        this.messagesY += msgH + 20;
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const typing = this.add.text(15, this.messagesY, 'Печатает...', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            color: '#999999',
            fontStyle: 'italic'
        }).setOrigin(0, 0);
        this.messagesContainer.add(typing);
        this.messagesY += 20;
        this.scrollToBottom();
        return typing;
    }

    // Автоматическая прокрутка вниз при новом сообщении
    scrollToBottom() {
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
                if (response.loyalty_change !== undefined) {
                    this.loyalty = PhaserMath.Clamp(this.loyalty + response.loyalty_change, 0, 100);
                }
                if (response.safety_change !== undefined) {
                    this.safety = PhaserMath.Clamp(this.safety + response.safety_change, 0, 100);
                }
                this.updateBars();
            }
        } catch (error) {
            typingIndicator.destroy();
            this.addNPCMessage('[Система] Связь потеряна. Попробуйте позже.');
        }
    }

    updateBars() {
        this.loyaltyBarFill.width = 100 * (this.loyalty / 100);
        this.safetyBarFill.width = 100 * (this.safety / 100);
        this.loyaltyText.setText(this.loyalty + '%');
        this.safetyText.setText(this.safety + '%');
        this.loyaltyBarFill.setFillStyle(this.getLoyaltyColor(this.loyalty));
        this.safetyBarFill.setFillStyle(this.getSafetyColor(this.safety));
    }

    getLoyaltyColor(value) {
        if (value < 30) return 0xe63946;
        if (value < 60) return 0xf39c12;
        return 0x27ae60;
    }

    getSafetyColor(value) {
        if (value < 30) return 0xe63946;
        if (value < 60) return 0xf39c12;
        return 0x3498db;
    }

    finishChat() {
        if (this.isListening && this.recognition) {
            this.recognition.stop();
        }

        const gameLevel = this.scene.get('GameLevel');
        if (gameLevel) {
            gameLevel.updateBarsFromChat(this.loyalty, this.safety);
        }
        this.scene.stop();
        this.scene.launch('Debriefing', {
            loyalty: this.loyalty,
            safety: this.safety,
            startLoyalty: this.startLoyalty,
            startSafety: this.startSafety,
            npcName: this.npcName
        });
    }
}