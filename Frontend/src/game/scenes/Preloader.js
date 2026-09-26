import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Загружаем ТОЛЬКО те файлы, которые физически есть в папке assets
        this.load.image('player', 'assets/sprites&bg/players/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagons/first.png');
        this.load.image('scenery', 'assets/sprites&bg/bgs/ground.png');
        this.load.image('npc', 'assets/sprites&bg/players/player.png'); // Заглушка, пока друг не загрузит спрайт NPC
    }

    create() {
        // Сразу запускаем игру, передавая данные из HTML (сложность и время)
        this.scene.start('GameLevel', window.gameData || {});
    }
}