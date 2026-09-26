import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
        this.npcs = [];
        this.loyalty = 70;
        this.safety = 70;
        this.sessionTime = 300;
        this.difficulty = 'standard';
    }

    init(data) {
        this.loyalty = data.loyalty ?? 70;
        this.safety = data.safety ?? 70;
        this.sessionTime = data.sessionTime || 300;
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

        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        const vagonTopY = (screenHeight - vagonHeight) / 2;
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

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
                }
            }
        });

        this.add.text(20, 15, 'ЛОЯЛЬНОСТЬ', { fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff' }).setScrollFactor(0).setDepth(50);
        this.loyaltyBarBg = this.add.rectangle(20, 40, 200, 16, 0x2c3e50).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.loyaltyBar = this.add.rectangle(20, 40, 200 * (this.loyalty / 100), 16, 0x27ae60).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.loyaltyText = this.add.text(230, 40, this.loyalty + '%', { fontFamily: 'Arial Black', fontSize: 14, color: '#27ae60' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        this.add.text(20, 60, 'БЕЗОПАСНОСТЬ', { fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff' }).setScrollFactor(0).setDepth(50);
        this.safetyBarBg = this.add.rectangle(20, 85, 200, 16, 0x2c3e50).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.safetyBar = this.add.rectangle(20, 85, 200 * (this.safety / 100), 16, 0x3498db).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.safetyText = this.add.text(230, 85, this.safety + '%', { fontFamily: 'Arial Black', fontSize: 14, color: '#3498db' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        this.input.on('pointerdown', (pointer) => {
            console.log('{ "seatId": "A1", "x": ' + Math.round(pointer.worldX) + ', "y": ' + Math.round(pointer.worldY) + ' },');
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
            const angle = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
            this.player.rotation = angle;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}