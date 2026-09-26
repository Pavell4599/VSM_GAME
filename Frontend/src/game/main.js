import { GameLevel } from './scenes/GameLevel';
import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game, Scale } from 'phaser';


//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#028af8',
    // --- ОБЯЗАТЕЛЬНО ДОБАВЬ ЭТОТ БЛОК ДЛЯ ТОП-ДАУН ДВИЖЕНИЯ ---
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Для вида сверху гравитация равна 0
            debug: false       // Поставь true, если захочешь видеть хитбоксы персонажа
        }
    },
    // ---------------------------------------------------------
    scale: {
        // Меняем FIT на ENVELOP, чтобы игра поглощала чёрные боковые зоны
        mode: Scale.ENVELOP, 
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        GameLevel,
        Boot,
        Preloader,
        MainMenu,
    ]
};




const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

// Пишем строго дефолтный экспорт:
export default StartGame;

