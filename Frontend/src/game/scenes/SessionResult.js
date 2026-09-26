import { Scene } from 'phaser';

export class SessionResult extends Scene {
    constructor() { super('SessionResult'); }

    init(data) {
        this.loyalty = data.loyalty || 70;
        this.safety = data.safety || 70;
        this.sessionTime = data.sessionTime || 0;
        this.maxSessionTime = data.maxSessionTime || 300;
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.add.rectangle(0, 0, W, H, 0x000000, 0.9).setOrigin(0).setDepth(100);

        const winW = 700, winH = 500;
        const winX = (W - winW) / 2, winY = (H - winH) / 2;
        this.add.rectangle(winX, winY, winW, winH, 0x1a2a4a, 0.98).setOrigin(0).setDepth(101).setStrokeStyle(3, 0xc9a961);

        this.add.text(W / 2, winY + 50, '🎯 ИТОГИ СЕССИИ', { fontFamily: 'Arial Black', fontSize: 32, color: '#c9a961' }).setOrigin(0.5, 0.5).setDepth(102);

        // Расчет XP
        const timeBonus = Math.floor((this.sessionTime / this.maxSessionTime) * 50);
        const performanceScore = Math.floor((this.loyalty + this.safety) / 2);
        const xpEarned = timeBonus + Math.floor(performanceScore / 2);

        // Чтение старых данных
        const oldXP = parseInt(localStorage.getItem('playerXP') || '0');
        const oldLevel = parseInt(localStorage.getItem('playerLevel') || '1');
        const oldScore = parseInt(localStorage.getItem('playerScore') || '0');
        const oldSessions = parseInt(localStorage.getItem('sessionsCompleted') || '0');

        // Новые данные
        const newXP = oldXP + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newScore = oldScore + performanceScore;
        const newSessions = oldSessions + 1;

        // Сохранение (синтетические данные)
        localStorage.setItem('playerXP', newXP.toString());
        localStorage.setItem('playerLevel', newLevel.toString());
        localStorage.setItem('playerScore', newScore.toString());
        localStorage.setItem('sessionsCompleted', newSessions.toString());
        localStorage.setItem('loyaltySkill', this.loyalty.toString());
        localStorage.setItem('safetySkill', this.safety.toString());

        // Отображение
        this.add.text(winX + 40, winY + 120, `Затраченное время: ${this.formatTime(this.maxSessionTime - this.sessionTime)}`, { fontFamily: 'Arial', fontSize: 18, color: '#ffffff' }).setOrigin(0, 0).setDepth(102);
        this.add.text(winX + 40, winY + 160, `Лояльность: ${this.loyalty}%`, { fontFamily: 'Arial Black', fontSize: 20, color: '#27ae60' }).setOrigin(0, 0).setDepth(102);
        this.add.text(winX + 40, winY + 200, `Безопасность: ${this.safety}%`, { fontFamily: 'Arial Black', fontSize: 20, color: '#3498db' }).setOrigin(0, 0).setDepth(102);

        const levelUp = newLevel > oldLevel;
        this.add.text(winX + 40, winY + 260, `Получено опыта: +${xpEarned} XP`, { fontFamily: 'Arial Black', fontSize: 24, color: '#f39c12' }).setOrigin(0, 0).setDepth(102);
        this.add.text(winX + 40, winY + 310, `Уровень: ${oldLevel} → ${newLevel} ${levelUp ? '🎉 ПОВЫШЕН!' : ''}`, { fontFamily: 'Arial Black', fontSize: 22, color: levelUp ? '#27ae60' : '#ffffff' }).setOrigin(0, 0).setDepth(102);
        this.add.text(winX + 40, winY + 360, `Всего очков: ${newScore}`, { fontFamily: 'Arial', fontSize: 18, color: '#c9a961' }).setOrigin(0, 0).setDepth(102);

        // Кнопки
        const menuBtn = this.add.text(W / 2 - 150, winY + winH - 80, 'В МЕНЮ', { fontFamily: 'Arial Black', fontSize: 20, color: '#0a1628', backgroundColor: '#c9a961', padding: { x: 25, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);
        menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#ffffff' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#c9a961' }));
        menuBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        const profileBtn = this.add.text(W / 2 + 150, winY + winH - 80, 'ПРОФИЛЬ', { fontFamily: 'Arial Black', fontSize: 20, color: '#0a1628', backgroundColor: '#27ae60', padding: { x: 25, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);
        profileBtn.on('pointerover', () => profileBtn.setStyle({ backgroundColor: '#ffffff' }));
        profileBtn.on('pointerout', () => profileBtn.setStyle({ backgroundColor: '#27ae60' }));
        profileBtn.on('pointerdown', () => this.scene.start('Profile'));
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}