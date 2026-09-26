import { Scene } from 'phaser';

export class Debriefing extends Scene {
    constructor() {
        super('Debriefing');
    }

    init(data) {
        this.loyalty = data.loyalty;
        this.safety = data.safety;
        this.startLoyalty = data.startLoyalty;
        this.startSafety = data.startSafety;
        this.npcName = data.npcName;
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        // Затемнение
        this.add.rectangle(0, 0, W, H, 0x000000, 0.85).setOrigin(0).setDepth(200);

        // Окно разбора
        const winW = 800;
        const winH = 550; // Увеличили высоту
        const winX = (W - winW) / 2;
        const winY = (H - winH) / 2;

        const bg = this.add.rectangle(winX, winY, winW, winH, 0x1a2a4a, 0.98)
            .setOrigin(0).setDepth(201).setStrokeStyle(3, 0xc9a961);

        this.add.text(winX + winW / 2, winY + 40, '📊 РАЗБОР ДИАЛОГА', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#c9a961'
        }).setOrigin(0.5, 0.5).setDepth(202);

        const dLoyalty = this.loyalty - this.startLoyalty;
        const dSafety = this.safety - this.startSafety;

        let feedbackText = '';
        let skillsToImprove = '';

        if (dLoyalty >= 0 && dSafety >= 0) {
            feedbackText = `Отличная работа с пассажиром "${this.npcName}"! Вы смогли сохранить или улучшить обе ключевые метрики, действуя строго по регламенту.`;
            skillsToImprove = '💡 Рекомендация: Продолжайте в том же духе. Для дальнейшего роста попробуйте пройти сценарий на более высоком уровне сложности (Бизнес или Первый класс), чтобы усилить навыки работы с повышенным стрессом.';
        } else if (dLoyalty < 0 && dSafety >= 0) {
            feedbackText = `Вы обеспечили безопасность, но пассажир "${this.npcName}" остался недоволен качеством сервиса.`;
            skillsToImprove = '📈 Зона роста: Эмпатия и активное слушание. Попробуйте использовать более мягкие формулировки ("Я понимаю вашу озабоченность...") и предлагать альтернативные решения, не нарушая при этом регламент безопасности.';
        } else if (dLoyalty >= 0 && dSafety < 0) {
            feedbackText = `Пассажир доволен вашим отношением, но вы пошли на недопустимый компромисс в вопросах безопасности.`;
            skillsToImprove = '📈 Зона роста: Знание регламентов безопасности ВСМ. Помните: безопасность всегда приоритетнее сиюминутного комфорта. Учитесь вежливо, но твердо отказывать в небезопасных просьбах, объясняя причину.';
        } else {
            feedbackText = `Ситуация вышла из-под контроля. Обе метрики снизились при общении с "${this.npcName}".`;
            skillsToImprove = '📈 Зона роста: Навыки деэскалации конфликтов и стрессоустойчивость. Изучите раздел "Действия в нештатных ситуациях" в регламенте. Старайтесь не принимать претензии на личный счет и переводить диалог в конструктивное русло.';
        }

        this.add.text(winX + 40, winY + 100, `Итоговая лояльность: ${this.loyalty}% (${dLoyalty >= 0 ? '+' : ''}${dLoyalty})`, {
            fontFamily: 'Arial Black', fontSize: 20, color: dLoyalty >= 0 ? '#27ae60' : '#e74c3c'
        }).setOrigin(0, 0).setDepth(202);

        this.add.text(winX + 40, winY + 140, `Итоговая безопасность: ${this.safety}% (${dSafety >= 0 ? '+' : ''}${dSafety})`, {
            fontFamily: 'Arial Black', fontSize: 20, color: dSafety >= 0 ? '#3498db' : '#e74c3c'
        }).setOrigin(0, 0).setDepth(202);

        this.add.text(winX + 40, winY + 200, 'Анализ ситуации:', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff'
        }).setOrigin(0, 0).setDepth(202);

        this.add.text(winX + 40, winY + 230, feedbackText, {
            fontFamily: 'Arial', fontSize: 16, color: '#cccccc', wordWrap: { width: winW - 80 }
        }).setOrigin(0, 0).setDepth(202);

        this.add.text(winX + 40, winY + 320, 'Рекомендации по развитию:', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#f39c12'
        }).setOrigin(0, 0).setDepth(202);

        this.add.text(winX + 40, winY + 350, skillsToImprove, {
            fontFamily: 'Arial', fontSize: 16, color: '#cccccc', wordWrap: { width: winW - 80 }
        }).setOrigin(0, 0).setDepth(202);

        // ✅ КНОПКА "ПРОДОЛЖИТЬ ПУТЬ" — теперь точно видна!
        const btnY = winY + winH - 80;
        const closeBtn = this.add.text(W / 2, btnY, 'ПРОДОЛЖИТЬ ПУТЬ', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#0a1628',
            backgroundColor: '#c9a961', padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(202);

        closeBtn.on('pointerover', () => closeBtn.setStyle({ backgroundColor: '#ffffff' }));
        closeBtn.on('pointerout', () => closeBtn.setStyle({ backgroundColor: '#c9a961' }));
        closeBtn.on('pointerdown', () => {
            const gameLevel = this.scene.get('GameLevel');
            if (gameLevel && this.npcName) {
                const npc = gameLevel.npcs.find(n => n.seat.name === this.npcName);
                if (npc) {
                    npc.isInteracting = false;
                }
            }
            this.scene.stop('Debriefing');
        });
    }
}