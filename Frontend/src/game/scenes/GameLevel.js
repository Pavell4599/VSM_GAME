import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
        this.npcs = [];
        this.loyalty = 70;
        this.safety = 70;
        this.sessionTime = 300;
        this.difficulty = 'standard';
        this.randomEventTimer = null;
    }

    init(data) {
        this.loyalty = data.loyalty !== undefined ? data.loyalty : 70;
        this.safety = data.safety !== undefined ? data.safety : 70;
        this.sessionTime = data.sessionTime !== undefined ? data.sessionTime : 300;
        this.difficulty = data.difficulty || 'standard';
    }

    preload() {
        this.load.image('player', 'assets/sprites&bg/players/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagons/first.png');
        this.load.image('scenery', 'assets/sprites&bg/bgs/ground.png');
        this.load.image('npc', 'assets/sprites&bg/players/player.png');
    }

    create() {
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        const vagonHeight = screenHeight * 0.80;
        const vagonY = screenHeight / 2;

        // === ФОН ===
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        // === ВАГОН ===
        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        // === ФИЗИКА ===
        const vagonTopY = (screenHeight - vagonHeight) / 2;
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        // === ИГРОК ===
        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        // === КАМЕРА ===
        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // === УПРАВЛЕНИЕ ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // ============================================
        // 🎨 UI В СВЕТЛОМ СТИЛЕ ВСМ-400
        // ============================================

        // --- ТАЙМЕР (правый верхний угол, белый фон) ---
        this.timerText = this.add.text(screenWidth - 140, 30, this.formatTime(this.sessionTime), {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '28px',
            fontWeight: '700',
            color: '#e63946',
            backgroundColor: '#ffffff',
            padding: { x: 15, y: 10 },
            letterSpacing: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(50);

        // Лейбл таймера
        this.add.text(screenWidth - 140, 65, 'ВРЕМЯ СЕССИИ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            fontWeight: '600',
            color: '#666666',
            letterSpacing: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(50);

        // Таймер события
        this.time.addEvent({
            delay: 1000,
            repeat: -1,
            callback: () => {
                if (this.sessionTime > 0) {
                    this.sessionTime--;
                    if (this.timerText) {
                        this.timerText.setText(this.formatTime(this.sessionTime));
                        if (this.sessionTime <= 30) {
                            this.timerText.setColor('#e63946');
                            this.tweens.add({
                                targets: this.timerText,
                                alpha: 0.5,
                                duration: 500,
                                yoyo: true,
                                repeat: 1
                            });
                        }
                    }
                    if (this.sessionTime === 0) {
                        this.scene.stop('NPCChat');
                        this.scene.stop('Debriefing');
                        if (window.showSessionResult) {
                            window.showSessionResult({ loyalty: this.loyalty, safety: this.safety });
                        }
                    }
                }
            }
        });

        // --- ШКАЛА ЛОЯЛЬНОСТИ (левый верхний угол, белый фон) ---
        const barX = 30;
        const barY = 30;
        const barWidth = 220;
        const barHeight = 14;

        this.add.text(barX, barY - 15, 'ЛОЯЛЬНОСТЬ ПАССАЖИРА', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            color: '#333333',
            letterSpacing: 1.5
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // Фон шкалы (белый)
        this.add.rectangle(barX, barY + 5, barWidth, barHeight, 0xffffff)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(50).setStrokeStyle(1, 0xe0e0e0);

        // Заполнение шкалы
        this.loyaltyBar = this.add.rectangle(barX, barY + 5, barWidth * (this.loyalty / 100), barHeight, this.getLoyaltyColor(this.loyalty))
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);

        // Значение
        this.loyaltyText = this.add.text(barX + barWidth + 10, barY + 5, this.loyalty + '%', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // --- ШКАЛА БЕЗОПАСНОСТИ ---
        const safetyY = barY + 40;

        this.add.text(barX, safetyY - 15, 'РЕЙТИНГ БЕЗОПАСНОСТИ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            color: '#333333',
            letterSpacing: 1.5
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        this.add.rectangle(barX, safetyY + 5, barWidth, barHeight, 0xffffff)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(50).setStrokeStyle(1, 0xe0e0e0);

        this.safetyBar = this.add.rectangle(barX, safetyY + 5, barWidth * (this.safety / 100), barHeight, this.getSafetyColor(this.safety))
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);

        this.safetyText = this.add.text(barX + barWidth + 10, safetyY + 5, this.safety + '%', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // --- КНОПКА "В МЕНЮ" (белый фон, красная обводка) ---
        const exitBtnX = screenWidth - 140;
        const exitBtnY = 100;

        const exitBtnBg = this.add.rectangle(exitBtnX, exitBtnY, 140, 36, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setStrokeStyle(2, 0xe63946)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(50);

        this.add.text(exitBtnX, exitBtnY, 'В МЕНЮ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: 1.5
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(51);

        exitBtnBg.on('pointerover', () => {
            exitBtnBg.setFillStyle(0xe63946);
            exitBtnBg.setStrokeStyle(2, 0xe63946);
        });
        exitBtnBg.on('pointerout', () => {
            exitBtnBg.setFillStyle(0xffffff);
            exitBtnBg.setStrokeStyle(2, 0xe63946);
        });
        exitBtnBg.on('pointerdown', () => {
            if (window.exitGame) window.exitGame();
        });

        // --- КНОПКА "ЗАВЕРШИТЬ СЕССИЮ" (белый фон, зелёная обводка) ---
        const finishBtnX = screenWidth - 140;
        const finishBtnY = 145;

        const finishBtnBg = this.add.rectangle(finishBtnX, finishBtnY, 140, 36, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setStrokeStyle(2, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(50);

        this.add.text(finishBtnX, finishBtnY, 'ЗАВЕРШИТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: 1.5
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(51);

        finishBtnBg.on('pointerover', () => {
            finishBtnBg.setFillStyle(0x27ae60);
            finishBtnBg.setStrokeStyle(2, 0x27ae60);
        });
        finishBtnBg.on('pointerout', () => {
            finishBtnBg.setFillStyle(0xffffff);
            finishBtnBg.setStrokeStyle(2, 0x27ae60);
        });
        finishBtnBg.on('pointerdown', () => {
            if (window.showSessionResult) {
                window.showSessionResult({ loyalty: this.loyalty, safety: this.safety });
            }
        });

        // --- ИНДИКАТОР КЛАССА ВАГОНА (белый фон) ---
        this.add.text(30, screenHeight - 40, `КЛАСС: ${this.difficulty.toUpperCase()}`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            fontWeight: '700',
            color: '#e63946',
            backgroundColor: '#ffffff',
            padding: { x: 12, y: 6 },
            letterSpacing: 2
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // === NPC ===
        this.createNPCs(vagonScaledWidth, vagonTopY, vagonHeight);
        this.scheduleNextRandomEvent();

        this.input.on('pointerdown', (pointer) => {
            console.log(`{ "seatId": "A1", "x": ${Math.round(pointer.worldX)}, "y": ${Math.round(pointer.worldY)} },`);
        });
    }

    createNPCs(vagonWidth, vagonTop, vagonHeight) {
        const seats = [
            { x: 400, y: vagonTop + vagonHeight * 0.3, name: 'Пассажир у окна' },
            { x: 700, y: vagonTop + vagonHeight * 0.5, name: 'Бизнес-пассажир' },
            { x: 1000, y: vagonTop + vagonHeight * 0.4, name: 'Пассажир с ребёнком' },
            { x: 1300, y: vagonTop + vagonHeight * 0.6, name: 'Пенсионер' }
        ];

        seats.forEach((seat, idx) => {
            const npc = this.physics.add.sprite(seat.x, seat.y, 'npc');
            npc.setScale(0.15);
            npc.setImmovable(true);

            const indicator = this.add.text(seat.x, seat.y - 50, '❗', {
                fontFamily: 'Arial',
                fontSize: 32
            }).setOrigin(0.5).setVisible(false);

            this.npcs.push({
                sprite: npc,
                indicator: indicator,
                seat: seat,
                promptText: null,
                needsAttention: false,
                isInteracting: false,
                id: idx
            });
        });
    }

    scheduleNextRandomEvent() {
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) {
            this.randomEventTimer = this.time.delayedCall(2000, () => this.scheduleNextRandomEvent());
            return;
        }
        const delay = PhaserMath.Between(5000, 12000);
        this.randomEventTimer = this.time.delayedCall(delay, () => {
            const availableNPCs = this.npcs.filter(n => !n.needsAttention && !n.isInteracting);
            if (availableNPCs.length > 0) {
                const randomNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
                randomNPC.needsAttention = true;

                this.tweens.add({
                    targets: randomNPC.sprite,
                    y: randomNPC.seat.y - 15,
                    duration: 150,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                randomNPC.indicator.setVisible(true);
                this.tweens.add({
                    targets: randomNPC.indicator,
                    scale: 1.4,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
            this.scheduleNextRandomEvent();
        });
    }

    update() {
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) return;
        if (!this.player || !this.cursors || !this.wasd) return;

        this.sceneryBackground.tilePositionX += 1;

        const SPEED = 300;
        let velocityX = 0, velocityY = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -SPEED;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = SPEED;
        if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -SPEED;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = SPEED;

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);
        if (velocityX !== 0 || velocityY !== 0) {
            this.player.rotation = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
        }

        this.checkNPCInteraction();
    }

    checkNPCInteraction() {
        this.npcs.forEach(npcData => {
            const distance = Math.hypot(this.player.x - npcData.sprite.x, this.player.y - npcData.sprite.y);

            if (distance < 100) {
                const isUrgent = npcData.needsAttention;
                const promptTextStr = isUrgent ? '[E] ПОМОЧЬ' : '[E] ГОВОРИТЬ';
                const promptColor = isUrgent ? '#e63946' : '#1a1a1a';

                if (!npcData.promptText) {
                    npcData.promptText = this.add.text(npcData.sprite.x, npcData.sprite.y - 90, promptTextStr, {
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: promptColor,
                        backgroundColor: '#ffffff',
                        padding: { x: 12, y: 6 },
                        letterSpacing: 1.5
                    }).setOrigin(0.5).setDepth(60);
                } else {
                    npcData.promptText.setText(promptTextStr);
                    npcData.promptText.setStyle({ color: promptColor });
                }

                if (this.input.keyboard.checkDown(this.input.keyboard.addKey('E'), 500)) {
                    npcData.isInteracting = true;
                    npcData.needsAttention = false;
                    this.tweens.killTweensOf(npcData.sprite);
                    this.tweens.killTweensOf(npcData.indicator);
                    npcData.sprite.y = npcData.seat.y;
                    npcData.indicator.setVisible(false);
                    if (npcData.promptText) { npcData.promptText.destroy(); npcData.promptText = null; }

                    this.scene.launch('NPCChat', {
                        npcName: npcData.seat.name,
                        npcId: npcData.id,
                        scenarioContext: `Вагон класса ${this.difficulty}. Пассажир: ${npcData.seat.name}.`,
                        loyalty: this.loyalty,
                        safety: this.safety,
                        difficulty: this.difficulty
                    });
                }
            } else {
                if (npcData.promptText) { npcData.promptText.destroy(); npcData.promptText = null; }
            }
        });
    }

    updateBarsFromChat(loyalty, safety) {
        this.loyalty = PhaserMath.Clamp(loyalty, 0, 100);
        this.safety = PhaserMath.Clamp(safety, 0, 100);

        const barWidth = 220;
        this.loyaltyBar.width = barWidth * (this.loyalty / 100);
        this.safetyBar.width = barWidth * (this.safety / 100);
        this.loyaltyText.setText(this.loyalty + '%').setColor('#1a1a1a');
        this.safetyText.setText(this.safety + '%').setColor('#1a1a1a');
        this.loyaltyBar.setFillStyle(this.getLoyaltyColor(this.loyalty));
        this.safetyBar.setFillStyle(this.getSafetyColor(this.safety));
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

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}