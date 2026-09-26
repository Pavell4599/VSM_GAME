import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
    }

    preload() {
        this.load.image('player', 'assets/sprites&bg/players/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagons/standart.png');
        this.load.image('scenery', 'assets/sprites&bg/bgs/ground.png');
    }

    create() {
        // Размеры нашего холста (1280x720)
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height; 

        // Вычисляем высоту поезда (ровно 80% от высоты экрана)
        const vagonHeight = screenHeight * 0.80; // 576px
        const vagonY = screenHeight / 2;         // Центр экрана (360px)

        // ========================================================
        // 🎰 СЛОЙ 1: ДВИЖУЩИЙСЯ ЗАДНИЙ ПЕЙЗАЖ (НА ВЕСЬ ЭКРАН)
        // Создаем TileSprite на полную ширину и высоту экрана (1280x720)
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        
        // Масштабируем текстуру пейзажа так, чтобы она четко заполнила всю высоту экрана
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        
        // Привязываем фон к экрану (ScrollFactor = 0), чтобы при движении камеры 
        // за проводником сам фон не уезжал в сторону, а стоял на месте
        this.sceneryBackground.setScrollFactor(0);
        // ========================================================

        // ========================================================
        // 🚂 СЛОЙ 2: СТАТИЧНЫЙ ЧЕРТЕЖ ВАГОНА (80% ВЫСОТЫ)
        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5); 

        // Масштабируем вагон ровно под 80% высоты экрана
        const scaleY = vagonHeight / vagon.height; 
        vagon.setScale(scaleY);

        // Находим финальную ширину игрового поля (длина вагона на экране)
        const vagonScaledWidth = vagon.width * scaleY; 
        // ========================================================

        // 3. УСТАНАВЛИВАЕМ ГРАНИЦЫ ФИЗИЧЕСКОГО МИРА ПОД РАЗМЕР ВАГОНА
        // Игрок может ходить по вертикали только внутри 80% вагона
        const vagonTopY = (screenHeight - vagonHeight) / 2; // Начало поезда по Y (10% сверху)
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        // 4. СЛОЙ 3: Создаем проводника
        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18); // Немного уменьшили под новые 80% вагона
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true); 
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false); 

        // 5. НАСТРОЙКА КАМЕРЫ (Скроллинг вдоль поезда)
        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 6. Инициализируем клавиши управления
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // Сканер координат для JSON
        this.input.on('pointerdown', (pointer) => {
            const clickX = Math.round(pointer.worldX);
            const clickY = Math.round(pointer.worldY);
            console.log(`{ "seatId": "A1", "x": ${clickX}, "y": ${clickY} },`);
        });
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        // ========================================================
        // 🚀 АЛГОРИТМ БЕГУЩЕГО ПЕЙЗАЖА
        // Текстура на заднем плане непрерывно движется влево
        this.sceneryBackground.tilePositionX += 1; 
        // ========================================================

        const SPEED = 300; 
        let velocityX = 0;
        let velocityY = 0;

        // Сбор нажатий клавиш
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

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        if (velocityX !== 0 || velocityY !== 0) {
            let angle = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
            this.player.rotation = angle;
        }
    }
}