import { Game, AUTO, Scale } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { GameLevel } from './scenes/GameLevel';
import { NPCChat } from './scenes/NPCChat';
import { Debriefing } from './scenes/Debriefing';

const config = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    audio: { disableWebAudio: true },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
    scene: [Boot, Preloader, GameLevel, NPCChat, Debriefing]
};

const StartGame = (parent) => new Game({ ...config, parent });
export default StartGame;