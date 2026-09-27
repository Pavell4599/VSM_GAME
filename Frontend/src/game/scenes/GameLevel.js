import { Scene, Math as PhaserMath } from 'phaser';
import { getRandomArchetype, getRandomName } from '../archetypes.js';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
        this.npcs = [];
        this.loyalty = 70;
        this.safety = 70;
        this.sessionTime = 300;
        this.difficulty = 'standard';
        this.randomEventTimer = null;
        this.levelConfig = null;
    }

    init(data) {
        this.loyalty = data.loyalty !== undefined ? data.loyalty : 70;
        this.safety = data.safety !== undefined ? data.safety : 70;
        this.sessionTime = data.sessionTime !== undefined ? data.sessionTime : 300;
        this.difficulty = data.difficulty || 'standard';
    }
    preload() {
        // Мы НЕ загружаем здесь спрайты NPC снова, так как они уже загружены в Preloader.
        // Загружаем только специфичные для уровня вещи, если они есть.
        
        // 1. Базовые ассеты (если они не были загружены в Preloader или нужны другие версии)
        if (!this.textures.exists('player')) {
             this.load.image('player', 'assets/sprites&bg/players/player.png');
        }
        
        // 2. Вагоны
        this.load.image('vagon_standard', 'assets/sprites&bg/vagons/standart.png');
        this.load.image('vagon_comfort', 'assets/sprites&bg/vagons/comfort.png');
        this.load.image('vagon_business', 'assets/sprites&bg/vagons/business.png');
        this.load.image('vagon_first', 'assets/sprites&bg/vagons/first.png');

        // 3. JSON конфигурации
        const fileNameMap = {
            'standard': 'standart.json',
            'comfort': 'comfort.json',
            'business': 'business.json',
            'first': 'first.json'
        };
        const jsonFile = fileNameMap[this.difficulty] || 'standart.json';
        this.load.json('levelConfig', `assets/jsns/${jsonFile}`);
    }

    create() {
        // ✅ 1. ПОЛУЧАЕМ КОНФИГУРАЦИЮ С ЗАЩИТОЙ
        this.levelConfig = this.cache.json.get('levelConfig');
        if (!this.levelConfig) {
            console.error('❌ JSON не загрузился, используем дефолтную конфигурацию');
            this.levelConfig = this.getDefaultConfig();
        } else {
            console.log(`✅ JSON загружен: ${this.levelConfig.levelId} (${this.levelConfig.seats?.length || 0} сидений)`);
        }

        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        
        const vagonScale = this.levelConfig.visuals?.vagonScale || 0.80;
        const vagonOffsetY = this.levelConfig.visuals?.vagonOffsetY || 0;
        const vagonHeight = screenHeight * vagonScale;
        const vagonY = screenHeight / 2 + vagonOffsetY;

        // ✅ 2. ВЫБИРАЕМ ТЕКСТУРЫ (синхронно, без load.start())
        const bgKey = this.textures.exists('bg_ground') ? 'bg_ground' : 'scenery';
        
        // Определяем ключ вагона на основе сложности
        let vagonKey = 'vagon_comfort'; // дефолт
        if (this.difficulty === 'standard' && this.textures.exists('vagon_standard')) vagonKey = 'vagon_standard';
        else if (this.difficulty === 'comfort' && this.textures.exists('vagon_comfort')) vagonKey = 'vagon_comfort';
        else if (this.difficulty === 'business' && this.textures.exists('vagon_business')) vagonKey = 'vagon_business';
        else if (this.difficulty === 'first' && this.textures.exists('vagon_first')) vagonKey = 'vagon_first';

        // === 3. ПОСТРОЕНИЕ СЦЕНЫ ===
        
        // Фон
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, bgKey);
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get(bgKey).getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        // Вагон
        let vagon = this.add.image(0, vagonY, vagonKey);
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        // Физика
        const vagonTopY = (screenHeight - vagonHeight) / 2;
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        // Игрок
        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        // Камера
        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // UI
        this.createUI(screenWidth, screenHeight);

        // NPC
        this.createNPCsFromJSON(vagonScaledWidth, vagonTopY, vagonHeight);
        this.scheduleNextRandomEvent();

        this.createMobileControls();

        // Сканер координат для отладки
        this.input.on('pointerdown', (pointer) => {
            console.log(`{ "x": ${Math.round(pointer.worldX)}, "y": ${Math.round(pointer.worldY)} },`);
        });
    }

    buildScene(screenWidth, screenHeight, vagonHeight, vagonY) {
        // === ФОН ===
        this.sceneryBackground = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'scenery');
        this.sceneryBackground.setOrigin(0, 0);
        const sceneryScaleY = screenHeight / this.textures.get('scenery').getSourceImage().height;
        this.sceneryBackground.setTileScale(sceneryScaleY, sceneryScaleY);
        this.sceneryBackground.setScrollFactor(0);

        // === ВАГОН ===
        let vagon = this.add.image(0, vagonY, 'vagon_map');
        vagon.setOrigin(0, 0.5);
        const scaleY = vagonHeight / vagon.height;
        vagon.setScale(scaleY);
        const vagonScaledWidth = vagon.width * scaleY;

        // === ФИЗИКА ===
        const vagonTopY = (screenHeight - vagonHeight) / 2;
        this.physics.world.setBounds(0, vagonTopY, vagonScaledWidth, vagonHeight);

        // === ИГРОК ===
        this.player = this.physics.add.sprite(150, screenHeight / 2, 'player');
        this.player.setScale(0.18);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.setAllowRotation(false);

        // === КАМЕРА ===
        this.cameras.main.setBounds(0, 0, vagonScaledWidth, screenHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // === УПРАВЛЕНИЕ ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // === UI ===
        this.createUI(screenWidth, screenHeight);

        // === NPC ИЗ JSON ===
        this.createNPCsFromJSON(vagonScaledWidth, vagonTopY, vagonHeight);
        this.scheduleNextRandomEvent();

        // Сканер координат
        this.input.on('pointerdown', (pointer) => {
            console.log(`{ "x": ${Math.round(pointer.worldX)}, "y": ${Math.round(pointer.worldY)} },`);
        });
    }

    // ✅ ДЕФОЛТНАЯ КОНФИГУРАЦИЯ (если JSON не загрузился)
    getDefaultConfig() {
        return {
            levelId: 'standard',
            levelName: 'СТАНДАРТ',
            visuals: {
                vagonImage: 'assets/sprites&bg/vagons/standart.png',
                backgroundImage: 'assets/sprites&bg/bgs/ground.png',
                vagonScale: 0.80
            },
            seats: [
                { x: 400, y: 200, name: 'Пассажир 1' },
                { x: 700, y: 200, name: 'Пассажир 2' },
                { x: 1000, y: 200, name: 'Пассажир 3' },
                { x: 400, y: 500, name: 'Пассажир 4' }
            ],
            gameplay: {
                defaultSessionTime: 300,
                maxPassengers: 6,
                startingLoyalty: 70,
                startingSafety: 70
            }
        };
    }

    createUI(screenWidth, screenHeight) {
        // Таймер
        this.timerText = this.add.text(screenWidth - 140, 30, this.formatTime(this.sessionTime), {
            fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: '700',
            color: '#e63946', backgroundColor: '#ffffff', padding: { x: 15, y: 10 }, letterSpacing: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(50);

        this.add.text(screenWidth - 140, 65, 'ВРЕМЯ СЕССИИ', {
            fontFamily: 'Montserrat, sans-serif', fontSize: '10px', fontWeight: '600',
            color: '#666666', letterSpacing: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(50);

        this.time.addEvent({
            delay: 1000, repeat: -1,
            callback: () => {
                if (this.sessionTime > 0) {
                    this.sessionTime--;
                    if (this.timerText) {
                        this.timerText.setText(this.formatTime(this.sessionTime));
                        if (this.sessionTime <= 30) {
                            this.timerText.setColor('#e63946');
                            this.tweens.add({ targets: this.timerText, alpha: 0.5, duration: 500, yoyo: true, repeat: 1 });
                        }
                    }
                    if (this.sessionTime === 0) {
                        this.scene.stop('NPCChat');
                        this.scene.stop('Debriefing');
                        if (window.showSessionResult) window.showSessionResult({ loyalty: this.loyalty, safety: this.safety });
                    }
                }
            }
        });

        // Шкалы
        const barX = 30, barY = 30, barWidth = 220, barHeight = 14;
        this.add.text(barX, barY - 15, 'ЛОЯЛЬНОСТЬ', { fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: '700', color: '#333333' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.add.rectangle(barX, barY + 5, barWidth, barHeight, 0xffffff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50).setStrokeStyle(1, 0xe0e0e0);
        this.loyaltyBar = this.add.rectangle(barX, barY + 5, barWidth * (this.loyalty / 100), barHeight, this.getLoyaltyColor(this.loyalty)).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.loyaltyText = this.add.text(barX + barWidth + 10, barY + 5, this.loyalty + '%', { fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        const safetyY = barY + 40;
        this.add.text(barX, safetyY - 15, 'БЕЗОПАСНОСТЬ', { fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: '700', color: '#333333' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
        this.add.rectangle(barX, safetyY + 5, barWidth, barHeight, 0xffffff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50).setStrokeStyle(1, 0xe0e0e0);
        this.safetyBar = this.add.rectangle(barX, safetyY + 5, barWidth * (this.safety / 100), barHeight, this.getSafetyColor(this.safety)).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
        this.safetyText = this.add.text(barX + barWidth + 10, safetyY + 5, this.safety + '%', { fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);

        // Кнопки
        const exitBtn = this.add.rectangle(screenWidth - 140, 100, 140, 36, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0xe63946).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(50);
        this.add.text(screenWidth - 140, 100, 'В МЕНЮ', { fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
        exitBtn.on('pointerdown', () => { if (window.exitGame) window.exitGame(); });
        exitBtn.on('pointerover', () => exitBtn.setFillStyle(0xe63946));
        exitBtn.on('pointerout', () => exitBtn.setFillStyle(0xffffff));

        const finishBtn = this.add.rectangle(screenWidth - 140, 145, 140, 36, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x27ae60).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(50);
        this.add.text(screenWidth - 140, 145, 'ЗАВЕРШИТЬ', { fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
        finishBtn.on('pointerdown', () => { if (window.showSessionResult) window.showSessionResult({ loyalty: this.loyalty, safety: this.safety }); });
        finishBtn.on('pointerover', () => finishBtn.setFillStyle(0x27ae60));
        finishBtn.on('pointerout', () => finishBtn.setFillStyle(0xffffff));

        this.add.text(30, screenHeight - 40, `КЛАСС: ${this.levelConfig.levelName || this.difficulty.toUpperCase()}`, {
            fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: '700', color: '#e63946',
            backgroundColor: '#ffffff', padding: { x: 12, y: 6 }, letterSpacing: 2
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50);
    }

    createNPCsFromJSON(vagonWidth, vagonTop, vagonHeight) {
        const allSeats = this.levelConfig.seats || [];
        const maxPassengers = this.levelConfig.gameplay?.maxPassengers || 6;
        
        console.log(`📋 Всего сидений в JSON: ${allSeats.length}`);
        console.log(`🎲 Максимум пассажиров: ${maxPassengers}`);
        
        // 1. ПЕРЕМЕШИВАЕМ СИДЕНЬЯ
        const shuffledSeats = [...allSeats].sort(() => Math.random() - 0.5);
        
        // 2. ВЫБИРАЕМ СИДЕНЬЯ С МИНИМАЛЬНЫМ РАССТОЯНИЕМ (чтобы не слипались)
        const minDistance = 300; 
        const activeSeats = [];
        
        for (const seat of shuffledSeats) {
            if (activeSeats.length >= maxPassengers) break;
            
            const tooClose = activeSeats.some(selected => {
                const dist = Math.hypot(seat.x - selected.x, seat.y - selected.y);
                return dist < minDistance;
            });
            
            if (!tooClose) {
                activeSeats.push(seat);
            }
        }
        
        // Добиваем количество, если не набрали из-за дистанции
        if (activeSeats.length < maxPassengers) {
            const remaining = shuffledSeats.filter(s => !activeSeats.includes(s));
            for (const seat of remaining) {
                if (activeSeats.length >= maxPassengers) break;
                activeSeats.push(seat);
            }
        }
        
        console.log(`✅ Итоговое количество пассажиров: ${activeSeats.length}`);

        // 3. СОЗДАЁМ NPC
        activeSeats.forEach((seat, idx) => {
            const archetype = getRandomArchetype();
            const passengerName = getRandomName(archetype.id);
            
            //✅ УМНАЯ ПОДГРУЗКА СПРАЙТА: проверяем, есть ли картинка для архетипа
            const spriteKey = `npc_${archetype.id}`;
            const finalSprite = this.textures.exists(spriteKey) ? spriteKey : 'npc';
            //const finalSprite = 'npc_business'; // Жёстко задаём ключ для теста
            //console.log('🎯 Пытаемся использовать ключ текстуры:', finalSprite);
            //console.log('✅ Существует ли эта текстура в Phaser?', this.textures.exists(finalSprite));
            
            console.log(` 👤 NPC ${idx}: ${passengerName} (${archetype.name}) на месте ${seat.id} (Спрайт: ${finalSprite})`);
            
            const npc = this.physics.add.sprite(seat.x, seat.y, finalSprite);
            npc.setScale(0.15);
            npc.setImmovable(true);
            npc.setData('name', passengerName);
            npc.setData('archetype', archetype);
            npc.setData('id', idx);
            npc.setData('seatId', seat.id);

            const indicator = this.add.text(seat.x, seat.y - 50, '', { 
                fontFamily: 'Arial', 
                fontSize: 32 
            }).setOrigin(0.5).setVisible(false);

            this.npcs.push({
                sprite: npc, 
                indicator: indicator, 
                seat: seat, 
                archetype: archetype, 
                passengerName: passengerName,
                promptText: null, 
                needsAttention: false, 
                isInteracting: false, 
                id: idx,
                lastHelpTime: 0 // Для кулдауна запросов помощи
            });
        });
    }

    scheduleNextRandomEvent() {
        // Если открыт чат или разбор - пауза
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) {
            this.randomEventTimer = this.time.delayedCall(3000, () => this.scheduleNextRandomEvent());
            return;
        }

        // ✅ УВЕЛИЧЕННЫЙ ИНТЕРВАЛ (15-30 секунд вместо 5-12)
        const baseDelay = PhaserMath.Between(15000, 30000);
        
        // Проверяем, есть ли уже кто-то, кто просит помощи
        const someoneNeedsHelp = this.npcs.some(n => n.needsAttention);
        
        // ✅ ЕСЛИ КТО-ТО УЖЕ ПРОСИТ ПОМОЩИ - УВЕЛИЧИВАЕМ ЗАДЕРЖКУ В 3 РАЗА
        const delay = someoneNeedsHelp ? baseDelay * 3 : baseDelay;
        
        this.randomEventTimer = this.time.delayedCall(delay, () => {
            const availableNPCs = this.npcs.filter(n => {
                // Не выбираем тех, кто недавно получил помощь (cooldown 20 секунд)
                const timeSinceLastHelp = this.time.now - n.lastHelpTime;
                return !n.needsAttention && !n.isInteracting && timeSinceLastHelp > 20000;
            });
            
            if (availableNPCs.length > 0) {
                // ✅ ЕСЛИ УЖЕ КТО-ТО ПРОСИТ ПОМОЩИ - ШАНС ТОЛЬКО 30%
                const someoneNeedsHelp = this.npcs.some(n => n.needsAttention);
                const chance = someoneNeedsHelp ? 0.3 : 1.0;
                
                if (Math.random() < chance) {
                    const randomNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
                    randomNPC.needsAttention = true;

                    // Анимация "вибрации"
                    this.tweens.add({
                        targets: randomNPC.sprite,
                        y: randomNPC.seat.y - 15,
                        duration: 150,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Показываем индикатор ❗
                    randomNPC.indicator.setText('❗');
                    randomNPC.indicator.setVisible(true);
                    this.tweens.add({
                        targets: randomNPC.indicator,
                        scale: 1.4,
                        duration: 400,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    
                    console.log(` ${randomNPC.passengerName} просит помощи!`);
                }
            }
            
            this.scheduleNextRandomEvent();
        });
    }

        update() {
        if (this.scene.isActive('NPCChat') || this.scene.isActive('Debriefing')) return;
        if (!this.player || !this.cursors || !this.wasd) return;

        this.sceneryBackground.tilePositionX += 1;
        const SPEED = 300;
        let velocityX = 0, velocityY = 0;

        // Проверка клавиатуры
        const isLeft = this.cursors.left.isDown || this.wasd.A.isDown;
        const isRight = this.cursors.right.isDown || this.wasd.D.isDown;
        const isUp = this.cursors.up.isDown || this.wasd.W.isDown;
        const isDown = this.cursors.down.isDown || this.wasd.S.isDown;

        // ✅ Проверка мобильных кнопок (если они созданы)
        if (this.mobileInput) {
            if (this.mobileInput.left) velocityX = -SPEED;
            else if (this.mobileInput.right) velocityX = SPEED;
            
            if (this.mobileInput.up) velocityY = -SPEED;
            else if (this.mobileInput.down) velocityY = SPEED;
        } 
        // Если мобильные кнопки не нажаты, проверяем клавиатуру
        else {
            if (isLeft) velocityX = -SPEED;
            else if (isRight) velocityX = SPEED;
            if (isUp) velocityY = -SPEED;
            else if (isDown) velocityY = SPEED;
        }
        
        // Если нажато и то, и другое, приоритет у клавиатуры (или можно объединить через ||)
        // Более простой вариант объединения:
        if (isLeft || this.mobileInput?.left) velocityX = -SPEED;
        else if (isRight || this.mobileInput?.right) velocityX = SPEED;
        
        if (isUp || this.mobileInput?.up) velocityY = -SPEED;
        else if (isDown || this.mobileInput?.down) velocityY = SPEED;

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);
        
        if (velocityX !== 0 || velocityY !== 0) {
            this.player.rotation = PhaserMath.Angle.Between(0, 0, velocityX, velocityY);
        }

        this.checkNPCInteraction();
    }

    checkNPCInteraction() {
        this.npcs.forEach(npcData => {
            const distance = Math.hypot(this.player.x - npcData.sprite.x, this.player.y - npcData.sprite.y);

            if (distance < 100) {
                const isUrgent = npcData.needsAttention;
                const promptTextStr = isUrgent ? '[E] ПОМОЧЬ' : '[E] ГОВОРИТЬ';
                const promptColor = isUrgent ? '#e63946' : '#1a1a1a';

                if (!npcData.promptText) {
                    npcData.promptText = this.add.text(npcData.sprite.x, npcData.sprite.y - 90, promptTextStr, {
                        fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: '700',
                        color: promptColor, backgroundColor: '#ffffff', padding: { x: 12, y: 6 }, letterSpacing: 1.5
                    }).setOrigin(0.5).setDepth(60);
                } else {
                    npcData.promptText.setText(promptTextStr);
                    npcData.promptText.setStyle({ color: promptColor });
                }

                if (this.input.keyboard.checkDown(this.input.keyboard.addKey('E'), 500)) {
                    npcData.isInteracting = true;
                    npcData.needsAttention = false;
                    npcData.lastHelpTime = this.time.now; // ✅ ЗАПОМИНАЕМ ВРЕМЯ ПОМОЩИ
                    
                    this.tweens.killTweensOf(npcData.sprite);
                    this.tweens.killTweensOf(npcData.indicator);
                    npcData.sprite.y = npcData.seat.y;
                    npcData.indicator.setVisible(false);
                    if (npcData.promptText) { npcData.promptText.destroy(); npcData.promptText = null; }

                    const aiContext = `Вагон класса ${this.levelConfig.levelName}. ` +
                                      `Пассажир: ${npcData.passengerName}. ` +
                                      `Архетип: ${npcData.archetype.name}. ` +
                                      `Характер: ${npcData.archetype.description}. ` +
                                      `Терпение: ${npcData.archetype.traits.patience}%. ` +
                                      `Требовательность: ${npcData.archetype.traits.demanding}%.`;

                    this.scene.launch('NPCChat', {
                        npcName: npcData.passengerName,
                        npcArchetype: npcData.archetype,
                        npcId: npcData.id,
                        scenarioContext: aiContext,
                        loyalty: this.loyalty,
                        safety: this.safety,
                        difficulty: this.difficulty
                    });
                }
            } else {
                if (npcData.promptText) { npcData.promptText.destroy(); npcData.promptText = null; }
            }
        });
    }








    updateBarsFromChat(loyalty, safety) {
        this.loyalty = PhaserMath.Clamp(loyalty, 0, 100);
        this.safety = PhaserMath.Clamp(safety, 0, 100);
        const barWidth = 220;
        this.loyaltyBar.width = barWidth * (this.loyalty / 100);
        this.safetyBar.width = barWidth * (this.safety / 100);
        this.loyaltyText.setText(this.loyalty + '%').setColor('#1a1a1a');
        this.safetyText.setText(this.safety + '%').setColor('#1a1a1a');
        this.loyaltyBar.setFillStyle(this.getLoyaltyColor(this.loyalty));
        this.safetyBar.setFillStyle(this.getSafetyColor(this.safety));
    }

    getLoyaltyColor(value) { return value < 30 ? 0xe63946 : (value < 60 ? 0xf39c12 : 0x27ae60); }
    getSafetyColor(value) { return value < 30 ? 0xe63946 : (value < 60 ? 0xf39c12 : 0x3498db); }
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    createMobileControls() {
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        
        // Настройки кнопок
        const btnSize = 60;
        const gap = 10;
        const padding = 20;
        
        // Позиция блока кнопок (правый нижний угол)
        const startX = screenWidth - btnSize * 2 - gap - padding;
        const startY = screenHeight - btnSize * 2 - gap - padding;

        // Функция создания одной кнопки
        const createBtn = (x, y, label, key) => {
            // Фон кнопки (полупрозрачный белый круг)
            const btn = this.add.circle(x, y, btnSize / 2, 0xffffff, 0.3)
                .setStrokeStyle(2, 0xffffff, 0.8)
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0) // Чтобы кнопки не двигались вместе с камерой
                .setDepth(100);     // Поверх всего

            // Текст стрелки
            this.add.text(x, y, label, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

            // Логика нажатия
            btn.on('pointerdown', () => {
                this.mobileInput[key] = true;
                btn.setFillStyle(0xe63946, 0.6); // Подсветка при нажатии
            });

            btn.on('pointerup', () => {
                this.mobileInput[key] = false;
                btn.setFillStyle(0xffffff, 0.3); // Возврат цвета
            });
            
            btn.on('pointerout', () => {
                this.mobileInput[key] = false;
                btn.setFillStyle(0xffffff, 0.3);
            });
        };

        // Инициализируем объект для хранения состояния кнопок
        this.mobileInput = { up: false, down: false, left: false, right: false };

        // Создаем кнопки в форме крестовины
        //       [UP]
        // [LEFT]    [RIGHT]
        //      [DOWN]
        
        createBtn(startX + btnSize/2 + gap/2, startY, '▲', 'up');             // Вверх
        createBtn(startX + btnSize/2 + gap/2, startY + btnSize + gap, '▼', 'down'); // Вниз
        createBtn(startX, startY + btnSize/2 + gap/2, '◀', 'left');           // Влево
        createBtn(startX + btnSize + gap, startY + btnSize/2 + gap/2, '▶', 'right'); // Вправо
    }
}