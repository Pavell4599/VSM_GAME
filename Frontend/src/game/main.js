import { Game, AUTO, Scale } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { DifficultySelect } from './scenes/DifficultySelect';
import { GameLevel } from './scenes/GameLevel';
import { NPCChat } from './scenes/NPCChat';

const config = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a1628',
    audio: { disableWebAudio: true }, // <-- ДОБАВИТЬ ЭТО
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DifficultySelect,
        GameLevel,
        NPCChat
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;


