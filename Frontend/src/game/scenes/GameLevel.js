import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
        this.npcs = [];
        this.choicesMade = [];
        this.loyalty = 70;
        this.safety = 70;
        this.sessionTime = 0;
        this.maxSessionTime = 300;
        this.difficulty = 'standard';
    }

    init(data) {
        this.choicesMade = data.choicesMade || [];
        this.loyalty = data.loyalty ?? 70;
        this.safety = data.safety ?? 70;
        this.maxSessionTime = data.sessionTime || 300;
        this.difficulty = data.difficulty || 'standard';
        this.sessionTime = this.maxSessionTime;
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

        // Слой 1: пейзаж
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        // Слой 2: вагон
        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        // Физический мир
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
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // ===== UI: ТАЙМЕР (игра НЕ останавливается) =====
        this.timerText = this.add.text(screenWidth - 120, 20, this.formatTime(this.sessionTime), {
            fontFamily: 'Arial Black', fontSize: 24, color: '#c9a961',
            backgroundColor: '#0a1628', padding: { x: 12, y: 8 }
        }).setScrollFactor(0).setDepth(50);

        this.time.addEvent({
            delay: 1000,
            repeat: -1,
            callback: () => {
                if (this.sessionTime > 0) {
                    this.sessionTime--;
                    this.timerText.setText(this.formatTime(this.sessionTime));
                    if (this.sessionTime <= 30) {
                        this.timerText.setColor('#e74c3c');
                    }
                }
                // Когда время выходит — просто показываем "0:00", игра продолжается
            }
        });

        // ===== UI: ШКАЛЫ ЛОЯЛЬНОСТИ И БЕЗОПАСНОСТИ =====
        this.add.text(20, 15, 'ЛОЯЛЬНОСТЬ', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff'
        }).setScrollFactor(0).setDepth(50);

        this.loyaltyBarBg = this.add.rectangle(20, 40, 200, 16, 0x2c3e50)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.loyaltyBar = this.add.rectangle(20, 40, 200 * (this.loyalty / 100), 16, 0x27ae60)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.loyaltyText = this.add.text(230, 40, `${this.loyalty}%`, {
            fontFamily: 'Arial Black', fontSize: 14, color: '#27ae60'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        this.add.text(20, 60, 'БЕЗОПАСНОСТЬ', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff'
        }).setScrollFactor(0).setDepth(50);

        this.safetyBarBg = this.add.rectangle(20, 85, 200, 16, 0x2c3e50)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.safetyBar = this.add.rectangle(20, 85, 200 * (this.safety / 100), 16, 0x3498db)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.safetyText = this.add.text(230, 85, `${this.safety}%`, {
            fontFamily: 'Arial Black', fontSize: 14, color: '#3498db'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // Кнопка "Выйти в меню"
        const exitBtn = this.add.text(screenWidth - 120, 60, 'МЕНЮ', {
            fontFamily: 'Arial', fontSize: 14, color: '#ffffff',
            backgroundColor: '#e74c3c', padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(50);
        exitBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        // Создаем NPC
        this.createNPCs(vagonScaledWidth, vagonTopY, vagonHeight);

        // Сканер координат
        this.input.on('pointerdown', (pointer) => {
            console.log(`{ "seatId": "A1", "x": ${Math.round(pointer.worldX)}, "y": ${Math.round(pointer.worldY)} },`);
        });
    }

    createNPCs(vagonWidth, vagonTop, vagonHeight) {
        const seats = [
            { x: 400, y: vagonTop + vagonHeight * 0.3, name: 'Пассажир у окна' },
            { x: 700, y: vagonTop + vagonHeight * 0.5, name: 'Бизнес-пассажир' },
            { x: 1000, y: vagonTop + vagonHeight * 0.4, name: 'Пассажир с ребенком' },
            { x: 1300, y: vagonTop + vagonHeight * 0.6, name: 'Пенсионер' },
            { x: 1600, y: vagonTop + vagonHeight * 0.35, name: 'Студент' },
            { x: 1900, y: vagonTop + vagonHeight * 0.55, name: 'Турист' }
        ];

        seats.forEach((seat, idx) => {
            const npc = this.physics.add.sprite(seat.x, seat.y, 'npc');
            npc.setScale(0.15);
            npc.setImmovable(true);
            npc.setData('name', seat.name);
            npc.setData('interacted', false);
            npc.setData('id', idx);

            // Индикатор "💬" над NPC
            const indicator = this.add.text(seat.x, seat.y - 50, '💬', {
                fontFamily: 'Arial', fontSize: 24
            }).setOrigin(0.5);

            this.tweens.add({
                targets: indicator,
                y: seat.y - 60,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            this.npcs.push({ sprite: npc, indicator, seat, promptText: null });
        });
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        this.sceneryBackground.tilePositionX += 1;

        const SPEED = 300;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) velocityX = -SPEED;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) velocityX = SPEED;

        if (this.cursors.up.isDown || this.wasd.up.isDown) velocityY = -SPEED;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) velocityY = SPEED;

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        if (velocityX !== 0 || velocityY !== 0) {
            let angle = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
            this.player.rotation = angle;
        }

        this.checkNPCInteraction();
    }

    checkNPCInteraction() {
        this.npcs.forEach(npcData => {
            // ✅ ИСПРАВЛЕНО: используем PhaserMath вместо Phaser.Math
            const distance = PhaserMath.Distance.Between(
                this.player.x, this.player.y,
                npcData.sprite.x, npcData.sprite.y
            );

            if (distance < 100) {
                if (!npcData.promptText) {
                    npcData.promptText = this.add.text(
                        npcData.sprite.x, npcData.sprite.y - 80,
                        '[E] Говорить', {
                        fontFamily: 'Arial Black', fontSize: 14, color: '#c9a961',
                        backgroundColor: '#0a1628', padding: { x: 10, y: 5 }
                    }).setOrigin(0.5).setDepth(60);
                }

                if (this.input.keyboard.checkDown(this.input.keyboard.addKey('E'), 500)) {
                    if (!npcData.sprite.getData('interacted')) {
                        npcData.sprite.setData('interacted', true);
                        npcData.indicator.setVisible(false);
                        if (npcData.promptText) npcData.promptText.destroy();

                        this.scene.start('NPCChat', {
                            npcName: npcData.seat.name,
                            scenarioContext: `Вагон класса ${this.difficulty}. Пассажир: ${npcData.seat.name}.`,
                            choicesMade: this.choicesMade,
                            loyalty: this.loyalty,
                            safety: this.safety,
                            returnScene: 'GameLevel'
                        });
                    }
                }
            } else {
                if (npcData.promptText) {
                    npcData.promptText.destroy();
                    npcData.promptText = null;
                }
            }
        });
    }

    // Вызывается из NPCChat при возврате
    updateBarsFromChat(loyalty, safety) {
        this.loyalty = PhaserMath.Clamp(loyalty, 0, 100);
        this.safety = PhaserMath.Clamp(safety, 0, 100);

        this.loyaltyBar.width = 200 * (this.loyalty / 100);
        this.safetyBar.width = 200 * (this.safety / 100);
        this.loyaltyText.setText(`${this.loyalty}%`);
        this.safetyText.setText(`${this.safety}%`);

        // Меняем цвет при критических значениях
        if (this.loyalty < 30) this.loyaltyBar.fillColor = 0xe74c3c;
        else if (this.loyalty < 60) this.loyaltyBar.fillColor = 0xf39c12;
        else this.loyaltyBar.fillColor = 0x27ae60;

        if (this.safety < 30) this.safetyBar.fillColor = 0xe74c3c;
        else if (this.safety < 60) this.safetyBar.fillColor = 0xf39c12;
        else this.safetyBar.fillColor = 0x3498db;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}