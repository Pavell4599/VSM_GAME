import { Scene, Math as PhaserMath } from 'phaser';

export class WalkExample extends Scene {
    constructor() {
        // Регистрируем текстовый ID сцены в движке Phaser
        super('GamePlay');
    }

    preload() {
        // Метод preload выполняется ОДИН РАЗ при старте сцены.
        // Здесь мы только регистрируем пути к файлам. Картинки ещё не появились на экране.
        this.load.image('player', 'assets/player_topdown.png');
        this.load.image('vagon_map', 'assets/vagon_topdown.png');
    }

    create() {
        // Ставим фон вагона по центру
        this.add.image(400, 300, 'vagon_map');

        // Создаем проводника
        this.player = this.physics.add.sprite(100, 300, 'player');
        
        // 1. УМЕНЬШАЕМ ПЕРСОНАЖА (0.2 означает сделать его размером в 20% от оригинала, то есть в 5 раз меньше)
        // Если он станет слишком маленьким, подставьте 0.3 или 0.4
        this.player.setScale(0.2);

        // 2. ПОДГОНЯЕМ ФИЗИЧЕСКИЙ ХИТБОКС ПОД НОВЫЙ РАЗМЕР
        // Без этой строчки хитбокс останется огромным, даже если картинка визуально уменьшилась!
        this.player.refreshBody();

        // Не даем выходить за рамки игрового поля
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);

        // Полностью отключаем вращение хитбокса для Arcade Physics
        this.player.body.setAllowRotation(false);

        // Настраиваем управление: Стрелочки и WASD
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    }


    update() {
        // Метод update — это игровой цикл. Он выполняется непрерывно, примерно 60 раз в секунду (60 FPS).
        // Вся динамика игры пишется здесь.

        const SPEED = 200; // Базовая скорость нашего проводника (пикселей в секунду)
        
        // Каждую миллисекунду создаем две переменные. Изначально они равны 0 (персонаж стоит).
        let velocityX = 0;
        let velocityY = 0;

        // --- БЛОК 1: СБОР НАЖАТИЙ КЛАВИШ ---

        // Проверяем горизонтальную ось (Влево / Вправо)
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -SPEED; // Идем влево (координата X уменьшается)
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = SPEED;  // Идем вправо (координата X увеличивается)
        }

        // Проверяем вертикальную ось (Вверх / Вниз)
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -SPEED; // Идем вверх (В Phaser координата Y уменьшается по направлению к верху экрана)
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = SPEED;  // Идем вниз (координата Y увеличивается к низу экрана)
        }

        // --- БЛОК 2: ПРИМЕНЕНИЕ ФИЗИКИ ---

        // Передаем полученные значения физическому телу персонажа.
        // Если никакие кнопки не нажаты, передадутся (0, 0) и персонаж мгновенно остановится.
        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        // --- БЛОК 3: ПОВОРOT ЛИЦОМ К ДВИЖЕНИЮ ---

        // Нам нужно поворачивать персонажа ТОЛЬКО тогда, когда он реально куда-то идет.
        // Если velocityX и velocityY равны нулю, поворачивать его не нужно (он просто стоит).
        if (velocityX !== 0 || velocityY !== 0) {
            
            // Математическая функция Angle.Between вычисляет направление вектора движения.
            // Она берет точку старта (0,0) и точку направления (нашу скорость X и Y).
            // На выходе мы получаем точный угол направления в радианах.
            let angle = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
            
            // Присваиваем этот угол свойству rotation нашего спрайта.
            // Свойство rotation меняет угол отображения картинки на экране, но не трогает физику.
            this.player.rotation = angle;
        }
    }
}
