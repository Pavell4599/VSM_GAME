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
        // this.load.image('npc', 'assets/sprites&bg/players/player.png');  Заглушка, пока друг не загрузит спрайт NPC
        this.load.image('npc_business',   '/assets/sprites&bg/npcs/business.png');
        this.load.image('npc_veteran',    '/assets/sprites&bg/npcs/veteran.png');
        this.load.image('npc_student',    '/assets/sprites&bg/npcs/student.png');
        this.load.image('npc_family',     '/assets/sprites&bg/npcs/family.png');
        this.load.image('npc_senior',     '/assets/sprites&bg/npcs/senior.png');
        this.load.image('npc_foreigner',  '/assets/sprites&bg/npcs/foreigner.png'); // Проверь опечатку: foreigner или foreigner?
        this.load.image('npc_worker',     '/assets/sprites&bg/npcs/worker.png');
        this.load.image('npc_railway',    '/assets/sprites&bg/npcs/railway.png');
    }

    create() {
        // Сразу запускаем игру, передавая данные из HTML (сложность и время)
        this.scene.start('GameLevel', window.gameData || {});
    }
}