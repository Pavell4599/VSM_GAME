import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
            x: width / 2, y: height / 2 - 50,
            text: 'Загрузка...',
            style: { font: '20px monospace', color: '#ffffff' }
        });
        loadingText.setOrigin(0.5, 0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xc9a961, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        this.load.image('player', 'assets/sprites&bg/players/player.png');
        this.load.image('vagon_map', 'assets/sprites&bg/vagons/first.png');
        this.load.image('scenery', 'assets/sprites&bg/bgs/ground.png');
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        const bg = this.make.graphics({ x: 0, y: 0, add: false });
        bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a2a4a, 0x1a2a4a, 1);
        bg.fillRect(0, 0, W, H);
        bg.generateTexture('background', W, H);
        bg.destroy();

        const logo = this.make.graphics({ x: 0, y: 0, add: false });
        logo.fillStyle(0xc9a961, 1);
        logo.fillRoundedRect(0, 0, 300, 80, 15);
        logo.generateTexture('logo', 300, 80);
        logo.destroy();

        this.scene.start('MainMenu');
    }
}