import { Scene } from 'phaser';

export class Profile extends Scene {
    constructor() {
        super('Profile');
        this.achievements = [];
        this.playerData = {};
    }

    init() {
        // Загружаем синтетические данные (без ПДН, соответствие 152-ФЗ)
        this.playerData = {
            username: localStorage.getItem('username') || 'Проводник',
            level: parseInt(localStorage.getItem('playerLevel') || '1'),
            xp: parseInt(localStorage.getItem('playerXP') || '0'),
            totalScore: parseInt(localStorage.getItem('playerScore') || '0'),
            sessionsCompleted: parseInt(localStorage.getItem('sessionsCompleted') || '0'),
            loyaltySkill: parseInt(localStorage.getItem('loyaltySkill') || '70'),
            safetySkill: parseInt(localStorage.getItem('safetySkill') || '70')
        };

        const saved = localStorage.getItem('achievements');
        this.achievements = saved ? JSON.parse(saved) : this.getDefaultAchievements();
    }

    getDefaultAchievements() {
        return [
            { id: 'first_session', title: 'Первый рейс', description: 'Завершите первую игровую сессию', icon: '🚂', unlocked: false, condition: 'sessions >= 1' },
            { id: 'level_3', title: 'Опытный проводник', description: 'Достигните 3 уровня', icon: '⭐', unlocked: false, condition: 'level >= 3' },
            { id: 'level_5', title: 'Мастер сервиса', description: 'Достигните 5 уровня', icon: '🌟', unlocked: false, condition: 'level >= 5' },
            { id: 'level_10', title: 'Легенда ВСМ', description: 'Достигните 10 уровня', icon: '👑', unlocked: false, condition: 'level >= 10' },
            { id: 'loyalty_master', title: 'Дипломат', description: 'Навык лояльности выше 90%', icon: '🤝', unlocked: false, condition: 'loyalty >= 90' },
            { id: 'safety_master', title: 'Страж безопасности', description: 'Навык безопасности выше 90%', icon: '🛡️', unlocked: false, condition: 'safety >= 90' },
            { id: 'sessions_10', title: 'Ветеран', description: 'Завершите 10 сессий', icon: '🎖️', unlocked: false, condition: 'sessions >= 10' },
            { id: 'score_1000', title: 'Тысячник', description: 'Наберите 1000 очков', icon: '💎', unlocked: false, condition: 'score >= 1000' }
        ];
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.add.rectangle(0, 0, W, H, 0x0a1628).setOrigin(0);

        this.add.text(W / 2, 50, 'ПРОФИЛЬ ПРОВОДНИКА', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#c9a961', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        // Карточка профиля
        const cardW = 500, cardH = 320;
        const cardX = (W - cardW) / 2, cardY = 100;
        this.add.rectangle(cardX, cardY, cardW, cardH, 0x1a2a4a, 0.95).setOrigin(0).setStrokeStyle(3, 0xc9a961);

        // Аватар (инициалы)
        this.add.circle(cardX + 80, cardY + 80, 50, 0xc9a961);
        this.add.text(cardX + 80, cardY + 80, this.playerData.username.substring(0, 2).toUpperCase(), {
            fontFamily: 'Arial Black', fontSize: 32, color: '#0a1628'
        }).setOrigin(0.5);

        this.add.text(cardX + 150, cardY + 60, this.playerData.username, { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(cardX + 150, cardY + 100, `Уровень ${this.playerData.level}`, { fontFamily: 'Arial', fontSize: 18, color: '#c9a961' }).setOrigin(0, 0.5);

        // Прогресс-бар XP
        const xpNeeded = this.playerData.level * 100;
        const xpPercent = Math.min(100, (this.playerData.xp / xpNeeded) * 100);
        this.add.text(cardX + 20, cardY + 150, `Опыт: ${this.playerData.xp} / ${xpNeeded} XP`, { fontFamily: 'Arial', fontSize: 16, color: '#ffffff' }).setOrigin(0, 0.5);
        this.add.rectangle(cardX + 20, cardY + 180, cardW - 40, 20, 0x2c3e50).setOrigin(0, 0.5);
        this.add.rectangle(cardX + 20, cardY + 180, (cardW - 40) * (xpPercent / 100), 20, 0xf39c12).setOrigin(0, 0.5);

        // Статистика
        const stats = [
            { label: 'Всего очков:', value: this.playerData.totalScore, color: '#f39c12' },
            { label: 'Сессий пройдено:', value: this.playerData.sessionsCompleted, color: '#3498db' },
            { label: 'Навык лояльности:', value: this.playerData.loyaltySkill + '%', color: '#27ae60' },
            { label: 'Навык безопасности:', value: this.playerData.safetySkill + '%', color: '#e74c3c' }
        ];
        let statsY = cardY + 230;
        stats.forEach(stat => {
            this.add.text(cardX + 20, statsY, stat.label, { fontFamily: 'Arial', fontSize: 16, color: '#8899bb' }).setOrigin(0, 0.5);
            this.add.text(cardX + cardW - 20, statsY, stat.value, { fontFamily: 'Arial Black', fontSize: 18, color: stat.color }).setOrigin(1, 0.5);
            statsY += 25;
        });

        // Ачивки
        this.add.text(W / 2, 450, '🏆 ДОСТИЖЕНИЯ', { fontFamily: 'Arial Black', fontSize: 28, color: '#c9a961', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.checkAndUnlockAchievements();

        const achStartX = 100, achStartY = 490, achSize = 100, achGap = 20;
        this.achievements.forEach((ach, idx) => {
            const col = idx % 4, row = Math.floor(idx / 4);
            const x = achStartX + col * (achSize + achGap), y = achStartY + row * (achSize + achGap);
            const opacity = ach.unlocked ? 1 : 0.4;

            const bg = this.add.rectangle(x, y, achSize, achSize, ach.unlocked ? 0x27ae60 : 0x333333, opacity)
                .setOrigin(0).setStrokeStyle(2, ach.unlocked ? 0xf39c12 : 0x666666);
            
            this.add.text(x + achSize / 2, y + 35, ach.icon, { fontFamily: 'Arial', fontSize: 36 }).setOrigin(0.5).setAlpha(opacity);
            this.add.text(x + achSize / 2, y + 70, ach.title, { fontFamily: 'Arial Black', fontSize: 11, color: '#ffffff', wordWrap: { width: achSize - 10 }, align: 'center' }).setOrigin(0.5).setAlpha(opacity);

            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => this.showTooltip(ach, x, y));
            bg.on('pointerout', () => { if (this.tooltip) this.tooltip.destroy(); });
        });

        // Кнопка назад
        const backBtn = this.add.text(W / 2, H - 50, '← В МЕНЮ', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff', backgroundColor: '#c9a961', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: '#ffffff', color: '#c9a961' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: '#c9a961', color: '#ffffff' }));
        backBtn.on('pointerdown', () => this.scene.start('MainMenu'));
    }

    checkAndUnlockAchievements() {
        let changed = false;
        this.achievements.forEach(ach => {
            if (ach.unlocked) return;
            let shouldUnlock = false;
            if (ach.condition === 'sessions >= 1' && this.playerData.sessionsCompleted >= 1) shouldUnlock = true;
            if (ach.condition === 'level >= 3' && this.playerData.level >= 3) shouldUnlock = true;
            if (ach.condition === 'level >= 5' && this.playerData.level >= 5) shouldUnlock = true;
            if (ach.condition === 'level >= 10' && this.playerData.level >= 10) shouldUnlock = true;
            if (ach.condition === 'loyalty >= 90' && this.playerData.loyaltySkill >= 90) shouldUnlock = true;
            if (ach.condition === 'safety >= 90' && this.playerData.safetySkill >= 90) shouldUnlock = true;
            if (ach.condition === 'sessions >= 10' && this.playerData.sessionsCompleted >= 10) shouldUnlock = true;
            if (ach.condition === 'score >= 1000' && this.playerData.totalScore >= 1000) shouldUnlock = true;

            if (shouldUnlock) { ach.unlocked = true; changed = true; }
        });
        if (changed) localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    showTooltip(ach, x, y) {
        if (this.tooltip) this.tooltip.destroy();
        const tW = 250, tH = 80, tX = x + 110, tY = y - 20;
        const bg = this.add.rectangle(tX, tY, tW, tH, 0x1a2a4a, 0.95).setOrigin(0).setStrokeStyle(2, 0xc9a961).setDepth(300);
        const title = this.add.text(tX + 10, tY + 10, ach.title, { fontFamily: 'Arial Black', fontSize: 16, color: '#c9a961' }).setOrigin(0, 0).setDepth(301);
        const desc = this.add.text(tX + 10, tY + 35, ach.description, { fontFamily: 'Arial', fontSize: 13, color: '#ffffff', wordWrap: { width: tW - 20 } }).setOrigin(0, 0).setDepth(301);
        const status = this.add.text(tX + 10, tY + 60, ach.unlocked ? '✅ Получено' : '🔒 Заблокировано', { fontFamily: 'Arial', fontSize: 12, color: ach.unlocked ? '#27ae60' : '#e74c3c' }).setOrigin(0, 0).setDepth(301);
        this.tooltip = this.add.container(0, 0, [bg, title, desc, status]);
    }
}