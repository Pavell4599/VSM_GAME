import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        // Регистрируем текстовый ID сцены в движке Phaser
        super('GameLevel');
    }

    preload() {
        // Регистрируем новые пути к ассетам
        this.load.image('player', 'assets/sprites&bg/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagon.png');
    }

    create() {
        // 1. Отрисовываем фон вагона
        this.add.image(400, 300, 'vagon_map');

        // 2. Создаем проводника
        this.player = this.physics.add.sprite(100, 300, 'player');
        this.player.setScale(0.3);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        // 3. Инициализируем клавиши
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // === 🎯 КОД ДЛЯ ТОЧНОЙ РАЗМЕТКИ СИДЕНИЙ ===
        // Слушаем клик мышки в любом месте игрового поля
        this.input.on('pointerdown', (pointer) => {
            // Округляем координаты до целых пикселей
            const clickX = Math.round(pointer.x);
            const clickY = Math.round(pointer.y);

            // Выводим в консоль браузера (F12) готовый кусочек JSON!
            console.log(`{ "seatId": "A1", "x": ${clickX}, "y": ${clickY} },`);
        });
        // =========================================
    }


    update() {
        // Проверяем, что игрок и клавиши созданы, прежде чем обрабатывать ввод
        if (!this.player || !this.cursors || !this.wasd) return;

        const SPEED = 300; // Базовая скорость нашего проводника
        
        let velocityX = 0;
        let velocityY = 0;

        // --- БЛОК 1: СБОР НАЖАТИЙ КЛАВИШ ---
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -SPEED; 
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = SPEED;  
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -SPEED; 
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = SPEED;  
        }

        // --- БЛОК 2: ПРИМЕНЕНИЕ СКОРОСТИ ---
        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        // --- БЛОК 3: ПОВОРOТ ЛИЦОМ К ДВИЖЕНИЮ ---
        if (velocityX !== 0 || velocityY !== 0) {
            let angle = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
            this.player.rotation = angle;
        }
    }
}
