import { Scene } from 'phaser';

export class GamePlay extends Scene {
    constructor() {
        super('GamePlay');
    }

    preload() {
        // Загружаем спрайт персонажа (вид сверху). 
        // Если это пока одна картинка, используйте load.image. Если это кадры анимации — spritesheet.
        this.load.image('player', 'assets/player_topdown.png');
        
        // Загружаем схему/карту вагона ВСМ сверху
        this.load.image('vagon_map', 'assets/vagon_topdown.png');
    }

    create() {
        // Размеры экрана по умолчанию в шаблоне обычно 800x600. Ставим фон вагона по центру.
        this.add.image(400, 300, 'vagon_map');

        // Создаем проводника в начальной точке (например, в начале вагона)
        this.player = this.physics.add.sprite(100, 300, 'player');

        // Ограничиваем перемещение границами игрового мира (чтобы не выходить за стенки вагона)
        this.player.setCollideWorldBounds(true);

        // Включаем сглаживание для текстуры, если вид сверху будет крутиться
        this.player.setOrigin(0.5, 0.5); 

        // Настраиваем управление: Стрелочки и WASD
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        const SPEED = 200; // Скорость перемещения проводника по вагону
        
        // Создаем вектор движения, чтобы при движении по диагонали скорость не удваивалась
        let velocityX = 0;
        let velocityY = 0;

        // Движение по горизонтали (Влево / Вправо)
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -SPEED;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = SPEED;
        }

        // Движение по вертикали (Вверх / Вниз между креслами)
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -SPEED;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = SPEED;
        }

        // Применяем скорость к физическому телу персонажа
        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        // --- ЛОГИКА ПОВОРОТА ПЕРСОНАЖА КЛЮВОМ/ЛИЦОМ В СТОРОНУ ХОДЬБЫ ---
        // Если персонаж движется, вычисляем угол направления движения
        if (velocityX !== 0 || velocityY !== 0) {
            // Математическая функция Phaser определяет угол в радианах между точкой (0,0) и вектором скорости
            let angle = Phaser.Math.Angle.Between(0, 0, velocityX, velocityY);
            
            // Переводим радианы в градусы и вращаем спрайт персонажа
            this.player.setAngle(Phaser.Math.RadToDeg(angle));
        }
    }
}
