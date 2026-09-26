import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() { super('Preloader'); }

    preload() {
        // Загружаем ТОЛЬКО реальные файлы, которые дал твой друг
        this.load.image('player', 'assets/sprites&bg/players/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagons/first.png');
        this.load.image('scenery', 'assets/sprites&bg/bgs/ground.png');
        this.load.image('npc', 'assets/sprites&bg/players/player.png'); // Заглушка, если друг не дал отдельный спрайт
    }

    create() {
        // Сразу переходим в меню, фон нарисуем там прямоугольником
        this.scene.start('MainMenu');
    }
}