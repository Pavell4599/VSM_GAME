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

        // Пейзаж
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        // Вагон
        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        // Физика
        const vagonTopY = (screenHeight - vagonHeight) / 2;
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        // Игрок
        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        // Камера
        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // Таймер сессии
        this.timerText = this.add.text(screenWidth - 120, 20, this.formatTime(this.sessionTime), {
            fontFamily: 'Arial Black', fontSize: 24, color: '#c9a961',
            backgroundColor: '#0a1628', padding: { x: 12, y: 8 }
        }).setScrollFactor(0).setDepth(50);

        // Кнопка завершения сессии
        const finishBtn = this.add.text(screenWidth - 250, 60, 'ЗАВЕРШИТЬ', {
            fontFamily: 'Arial', fontSize: 14, color: '#ffffff', 
            backgroundColor: '#27ae60', padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(50);
        finishBtn.on('pointerdown', () => {
            this.scene.start('SessionResult', {
                loyalty: this.loyalty,
                safety: this.safety,
                sessionTime: this.sessionTime,
                maxSessionTime: 300
            });
        });

        this.time.addEvent({
            delay: 1000,
            repeat: -1,
            callback: () => {
                if (this.sessionTime > 0) {
                    this.sessionTime--;
                    this.timerText.setText(this.formatTime(this.sessionTime));
                    if (this.sessionTime <= 30) this.timerText.setColor('#e74c3c');
                    
                    if (this.sessionTime === 0) {
                        this.scene.stop('NPCChat');
                        this.scene.stop('Debriefing');
                        // ✅ ПЕРЕХОД В СЕССИЮ РЕЗУЛЬТАТОВ
                        this.scene.start('SessionResult', {
                            loyalty: this.loyalty,
                            safety: this.safety,
                            sessionTime: this.sessionTime,
                            maxSessionTime: 300 // или передай из init
                        });
                    }
                }
            }
        });

        // Шкалы
        this.add.text(20, 15, 'ЛОЯЛЬНОСТЬ', { fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff' }).setScrollFactor(0).setDepth(50);
        this.loyaltyBarBg = this.add.rectangle(20, 40, 200, 16, 0x2c3e50).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.loyaltyBar = this.add.rectangle(20, 40, 200 * (this.loyalty / 100), 16, 0x27ae60).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.loyaltyText = this.add.text(230, 40, this.loyalty + '%', { fontFamily: 'Arial Black', fontSize: 14, color: '#27ae60' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        this.add.text(20, 60, 'БЕЗОПАСНОСТЬ', { fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff' }).setScrollFactor(0).setDepth(50);
        this.safetyBarBg = this.add.rectangle(20, 85, 200, 16, 0x2c3e50).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.safetyBar = this.add.rectangle(20, 85, 200 * (this.safety / 100), 16, 0x3498db).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.safetyText = this.add.text(230, 85, this.safety + '%', { fontFamily: 'Arial Black', fontSize: 14, color: '#3498db' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        const exitBtn = this.add.text(screenWidth - 120, 60, 'МЕНЮ', {
            fontFamily: 'Arial', fontSize: 14, color: '#ffffff', backgroundColor: '#e74c3c', padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(50);
        exitBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        this.createNPCs(vagonScaledWidth, vagonTopY, vagonHeight);

        // Запускаем умный генератор событий
        this.scheduleNextRandomEvent();

        this.input.on('pointerdown', (pointer) => {
            console.log(`{ "seatId": "A1", "x": ${Math.round(pointer.worldX)}, "y": ${Math.round(pointer.worldY)} },`);
        });
    }

    createNPCs(vagonWidth, vagonTop, vagonHeight) {
        const seats = [
            { x: 400, y: vagonTop + vagonHeight * 0.3, name: 'Пассажир у окна' },
            { x: 700, y: vagonTop + vagonHeight * 0.5, name: 'Бизнес-пассажир' },
            { x: 1000, y: vagonTop + vagonHeight * 0.4, name: 'Пассажир с ребенком' },
            { x: 1300, y: vagonTop + vagonHeight * 0.6, name: 'Пенсионер' }
        ];

        seats.forEach((seat, idx) => {
            const npc = this.physics.add.sprite(seat.x, seat.y, 'npc');
            npc.setScale(0.15);
            npc.setImmovable(true);
            
            // Изначально скрыт, появляется только при событии или приближении
            const indicator = this.add.text(seat.x, seat.y - 50, '❗', { 
                fontFamily: 'Arial', fontSize: 28 
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

    // ✅ УМНЫЙ ПЛАНИРОВЩИК: Не спавнит события, если игрок уже в диалоге
    scheduleNextRandomEvent() {
        // Если открыт чат или разбор, проверяем снова через 2 секунды, но НЕ спавним событие
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) {
            this.randomEventTimer = this.time.delayedCall(2000, () => this.scheduleNextRandomEvent());
            return;
        }

        const delay = PhaserMath.Between(5000, 12000); // 5-12 секунд
        
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
                    scale: 1.3,
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
        // Блокировка движения во время диалогов
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) return;
        if (!this.player || !this.cursors || !this.wasd) return;

        this.sceneryBackground.tilePositionX += 1;

        const SPEED = 300;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -SPEED;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = SPEED;

        if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -SPEED;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = SPEED;

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        if (velocityX !== 0 || velocityY !== 0) {
            this.player.rotation = Math.atan2(velocityY, velocityX);
        }

        this.checkNPCInteraction();
    }

    // ✅ УНИВЕРСАЛЬНОЕ ВЗАИМОДЕЙСТВИЕ
    checkNPCInteraction() {
        this.npcs.forEach(npcData => {
            const dx = this.player.x - npcData.sprite.x;
            const dy = this.player.y - npcData.sprite.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 100) {
                // Определяем текст и цвет в зависимости от срочности
                const isUrgent = npcData.needsAttention;
                const promptTextStr = isUrgent ? '[E] Помочь (Срочно!)' : '[E] Говорить';
                const promptColor = isUrgent ? '#e74c3c' : '#c9a961';

                if (!npcData.promptText) {
                    npcData.promptText = this.add.text(
                        npcData.sprite.x, npcData.sprite.y - 90,
                        promptTextStr, {
                        fontFamily: 'Arial Black', fontSize: 14, color: promptColor,
                        backgroundColor: '#0a1628', padding: { x: 10, y: 5 }
                    }).setOrigin(0.5).setDepth(60);
                } else {
                    // Динамическое обновление текста, если статус изменился, пока игрок стоит рядом
                    npcData.promptText.setText(promptTextStr);
                    npcData.promptText.setStyle({ color: promptColor });
                }

                if (this.input.keyboard.checkDown(this.input.keyboard.addKey('E'), 500)) {
                    npcData.isInteracting = true;
                    npcData.needsAttention = false; // Сбрасываем флаг срочности
                    
                    // Останавливаем анимации
                    this.tweens.killTweensOf(npcData.sprite);
                    this.tweens.killTweensOf(npcData.indicator);
                    npcData.sprite.y = npcData.seat.y;
                    npcData.indicator.setVisible(false);
                    
                    if (npcData.promptText) {
                        npcData.promptText.destroy();
                        npcData.promptText = null;
                    }

                    this.scene.launch('NPCChat', {
                        npcName: npcData.seat.name,
                        npcId: npcData.id, // Передаем ID, чтобы потом сбросить флаг isInteracting
                        scenarioContext: `Вагон класса ${this.difficulty}. Пассажир: ${npcData.seat.name}.`,
                        loyalty: this.loyalty,
                        safety: this.safety,
                        difficulty: this.difficulty
                    });
                }
            } else {
                if (npcData.promptText) {
                    npcData.promptText.destroy();
                    npcData.promptText = null;
                }
            }
        });
    }

    // Метод для сброса состояния пассажира после разговора
    resetNPCInteraction(npcId) {
        const npc = this.npcs.find(n => n.id === npcId);
        if (npc) {
            npc.isInteracting = false;
        }
    }

    updateBarsFromChat(loyalty, safety) {
        this.loyalty = loyalty;
        this.safety = safety;
        this.loyaltyBar.width = 200 * (this.loyalty / 100);
        this.safetyBar.width = 200 * (this.safety / 100);
        this.loyaltyText.setText(this.loyalty + '%');
        this.safetyText.setText(this.safety + '%');

        this.loyaltyBar.fillColor = this.loyalty < 30 ? 0xe74c3c : (this.loyalty < 60 ? 0xf39c12 : 0x27ae60);
        this.safetyBar.fillColor = this.safety < 30 ? 0xe74c3c : (this.safety < 60 ? 0xf39c12 : 0x3498db);

        // ✅ СОХРАНЯЕМ ПРОГРЕСС (уровень растет каждые 100 очков)
        const totalScore = Math.floor((this.loyalty + this.safety) / 2);
        const newLevel = Math.floor(totalScore / 20) + 1; // Уровень 1-10
        localStorage.setItem('playerLevel', newLevel.toString());
        localStorage.setItem('playerScore', totalScore.toString());
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}