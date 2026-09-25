import { Scene, Math as PhaserMath } from 'phaser';

export class GameLevel extends Scene {
    constructor() {
        // Регистрируем текстовый ID сцены в движке Phaser
        super('GameLevel');
    }

    preload() {
        // Метод preload выполняется ОДИН РАЗ при старте сцены.
        // Здесь мы только регистрируем пути к файлам. Картинки ещё не появились на экране.
        this.load.image('player', 'assets/sprites&bg/player_topdown.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagon_topdown.png');
    }

    create() {
        // Ставим фон вагона по центру
        this.add.image(400, 300, 'vagon_map');


    }


    update() {
        // Метод update — это игровой цикл. Он выполняется непрерывно, примерно 60 раз в секунду (60 FPS).
        // Вся динамика игры пишется здесь.

        const SPEED = 300; // Базовая скорость нашего проводника (пикселей в секунду)
        
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
    }
}
