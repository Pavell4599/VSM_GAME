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

        // Затемнение фона (более светлое)
        this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(200);

        // === ОКНО РАЗБОРА (белое) ===
        const winW = 780;
        const winH = 520;
        const winX = (W - winW) / 2;
        const winY = (H - winH) / 2;

        // Фон окна (белый)
        this.add.rectangle(winX, winY, winW, winH, 0xffffff, 0.98)
            .setOrigin(0).setDepth(201).setStrokeStyle(2, 0xe63946);

        // Тонкая красная полоса сверху
        this.add.rectangle(winX, winY, winW, 3, 0xe63946).setOrigin(0, 0).setDepth(202);

        // === ЗАГОЛОВОК ===
        this.add.text(W / 2, winY + 40, 'РАЗБОР ДИАЛОГА', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: 3
        }).setOrigin(0.5, 0.5).setDepth(202);

        // Разделитель
        this.add.rectangle(winX + 40, winY + 70, winW - 80, 1, 0xe0e0e0).setOrigin(0, 0.5).setDepth(202);

        // === МЕТРИКИ ===
        const dLoyalty = this.loyalty - this.startLoyalty;
        const dSafety = this.safety - this.startSafety;

        const metricsY = winY + 110;
        
        // Лояльность
        this.add.text(winX + 40, metricsY, 'ЛОЯЛЬНОСТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '600',
            color: '#999999',
            letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(202);

        this.add.text(winX + 40, metricsY + 25, `${this.loyalty}%`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setDepth(202);

        const loyaltyColor = dLoyalty >= 0 ? '#27ae60' : '#e63946';
        const loyaltySign = dLoyalty >= 0 ? '+' : '';
        this.add.text(winX + 130, metricsY + 25, `${loyaltySign}${dLoyalty}`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: loyaltyColor
        }).setOrigin(0, 0.5).setDepth(202);

        // Безопасность
        this.add.text(winX + 280, metricsY, 'БЕЗОПАСНОСТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '600',
            color: '#999999',
            letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(202);

        this.add.text(winX + 280, metricsY + 25, `${this.safety}%`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a'
        }).setOrigin(0, 0.5).setDepth(202);

        const safetyColor = dSafety >= 0 ? '#27ae60' : '#e63946';
        const safetySign = dSafety >= 0 ? '+' : '';
        this.add.text(winX + 370, metricsY + 25, `${safetySign}${dSafety}`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: safetyColor
        }).setOrigin(0, 0.5).setDepth(202);

        // === АНАЛИЗ ===
        let feedbackText = '';
        let skillsToImprove = '';

        if (dLoyalty >= 0 && dSafety >= 0) {
            feedbackText = `Отличная работа с пассажиром "${this.npcName}". Вы сохранили обе ключевые метрики, действуя по регламенту.`;
            skillsToImprove = 'Продолжайте в том же духе. Для роста попробуйте сценарий на более высоком уровне сложности (Бизнес или Первый класс).';
        } else if (dLoyalty < 0 && dSafety >= 0) {
            feedbackText = `Вы обеспечили безопасность, но пассажир "${this.npcName}" остался недоволен сервисом.`;
            skillsToImprove = 'Зона роста: эмпатия и активное слушание. Используйте мягкие формулировки ("Понимаю вашу озабоченность...") и предлагайте альтернативы.';
        } else if (dLoyalty >= 0 && dSafety < 0) {
            feedbackText = `Пассажир доволен отношением, но вы пошли на компромисс в вопросах безопасности.`;
            skillsToImprove = 'Зона роста: знание регламентов безопасности ВСМ. Безопасность всегда приоритетнее комфорта. Учитесь вежливо, но твёрдо отказывать.';
        } else {
            feedbackText = `Ситуация вышла из-под контроля. Обе метрики снизились при общении с "${this.npcName}".`;
            skillsToImprove = 'Зона роста: навыки деэскалации конфликтов и стрессоустойчивость. Изучите раздел "Действия в нештатных ситуациях" в регламенте.';
        }

        const analysisY = metricsY + 80;

        this.add.text(winX + 40, analysisY, 'АНАЛИЗ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            color: '#e63946',
            letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(202);

        this.add.text(winX + 40, analysisY + 25, feedbackText, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            color: '#333333',
            wordWrap: { width: winW - 80 },
            lineSpacing: 4
        }).setOrigin(0, 0).setDepth(202);

        // === РЕКОМЕНДАЦИИ ===
        const recY = analysisY + 90;

        this.add.text(winX + 40, recY, 'РЕКОМЕНДАЦИИ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            color: '#e63946',
            letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(202);

        this.add.text(winX + 40, recY + 25, skillsToImprove, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            color: '#333333',
            wordWrap: { width: winW - 80 },
            lineSpacing: 4
        }).setOrigin(0, 0).setDepth(202);

        // === КНОПКА "ПРОДОЛЖИТЬ ПУТЬ" (красная) ===
        const btnY = winY + winH - 70;
        const btnW = 280;
        const btnH = 44;

        const closeBtnBg = this.add.rectangle(W / 2, btnY, btnW, btnH, 0xe63946)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(202);

        this.add.text(W / 2, btnY, 'ПРОДОЛЖИТЬ ПУТЬ', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(203);

        closeBtnBg.on('pointerover', () => closeBtnBg.setFillStyle(0xb91c2c));
        closeBtnBg.on('pointerout', () => closeBtnBg.setFillStyle(0xe63946));
        closeBtnBg.on('pointerdown', () => {
            const gameLevel = this.scene.get('GameLevel');
            if (gameLevel && this.npcName) {
                const npc = gameLevel.npcs.find(n => n.seat.name === this.npcName);
                if (npc) npc.isInteracting = false;
            }
            this.scene.stop('Debriefing');
        });
    }
}