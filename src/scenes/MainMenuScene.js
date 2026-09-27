import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import audioManager from '../managers/AudioManager.js';
import gameManager from '../managers/GameManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
    this.unsubscribeLoc = null;
  }

  isPortrait() {
    return this.cameras.main.height > this.cameras.main.width;
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createProfileHUD();
    this.createMenuButtons();
    this.createDailyChallengeButton();
    this.createTeacherButton();

    // Listen for language updates to re-render texts seamlessly
    this.unsubscribeLoc = localizationManager.onChange(() => {
      this.refreshTexts();
    });
  }

  createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Keep the title screen in the same illustrated warung world as gameplay.
    this.add.image(width / 2, height / 2, 'bg_warung_morning')
      .setDisplaySize(width, height)
      .setAlpha(0.98)
      .setDepth(-20);

    // 1. Light readability wash over the painted scene
    const bg = this.add.graphics();
    bg.fillGradientStyle(THEME.surfaceTealDark, THEME.surfaceTealDark, THEME.panelBg, THEME.panelBg, 0.16);
    bg.fillRect(0, 0, width, height);

    // Fluffy Cartoon White Clouds
    const drawCloud = (cx, cy, scale = 1.0) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xfff7e8, 0.16);
      cloud.fillCircle(0, 0, 36 * scale);
      cloud.fillCircle(-28 * scale, 8 * scale, 24 * scale);
      cloud.fillCircle(28 * scale, 6 * scale, 26 * scale);
      cloud.fillCircle(-46 * scale, 14 * scale, 18 * scale);
      cloud.fillCircle(46 * scale, 14 * scale, 20 * scale);
      cloud.fillRect(-50 * scale, 6 * scale, 100 * scale, 26 * scale);
      cloud.setPosition(cx, cy);

      this.tweens.add({
        targets: cloud,
        x: cx + 32,
        duration: 4500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    };

    drawCloud(120, 110, 0.9);
    drawCloud(width > 900 ? 540 : 380, 85, 0.75);
    drawCloud(width - 160, 120, 1.0);

    // Warm Sun Rays
    const sunRays = this.add.graphics();
    sunRays.fillStyle(0xfef08a, 0.14);
    sunRays.fillTriangle(width / 2, 0, 0, height, width * 0.4, height);
    sunRays.fillTriangle(width / 2, 0, width * 0.6, height, width, height);

    // 2. Scalloped Strawberry Coral & Warm Cream Awning with Clean Cartoon Cocoa Outlines
    const awning = this.add.graphics();
    const stripeW = 54;
    const awningH = 65;
    const count = Math.ceil(width / stripeW);
    for (let i = 0; i < count; i++) {
      const isCoral = (i % 2 === 0);
      awning.fillStyle(isCoral ? THEME.accentRed : THEME.panelLight, 0.55);
      awning.fillRect(i * stripeW, 0, stripeW, awningH);
      awning.fillCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);

      // Stitch line detail
      awning.fillStyle(isCoral ? 0xe11d48 : 0xfde68a, 0.5);
      awning.fillRect(i * stripeW + 2, awningH - 6, stripeW - 4, 2.5);
    }

    // Clean Cartoon Cocoa Outline on Awning Ruffles
      awning.lineStyle(2, THEME.outlineDark, 0.45);
    for (let i = 0; i < count; i++) {
      awning.strokeCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);
    }
    awning.lineBetween(0, 0, width, 0);
    awning.setAlpha(0);

    // Awning Soft Drop Shadow
    awning.fillStyle(0x000000, 0.10);
    awning.fillRect(0, awningH + 18, width, 12);

    // 3. Colorful Festive Pennant Bunting Flags
    const buntingG = this.add.graphics();
    const buntingColors = [0xfb7185, 0x6ee7b7, 0xfde047, 0x38bdf8, 0xc084fc];
    buntingG.lineStyle(1.8, 0x78350f, 0.8);
    const flagW = 36;
    for (let bx = 10; bx < width; bx += flagW + 8) {
      const color = buntingColors[Math.floor(bx / 44) % buntingColors.length];
      const stringY = awningH + 20;

      buntingG.fillStyle(color, 0.72);
      buntingG.fillTriangle(bx, stringY, bx + flagW, stringY, bx + flagW / 2, stringY + 28);
      buntingG.lineStyle(1.5, 0x331f12, 0.85);
      buntingG.strokeTriangle(bx, stringY, bx + flagW, stringY, bx + flagW / 2, stringY + 28);
      buntingG.fillStyle(0xfde047, 1);
      buntingG.fillCircle(bx + flagW / 2, stringY - 1, 2.5);
    }

    // 4. Hanging Paper Lanterns with Tassels
    const lanternX = width > 900 ? [140, 360, width - 360, width - 140] : [70, width - 70];
    for (const lx of lanternX) {
    buntingG.setAlpha(0);
    const lantern = this.add.graphics();
      lantern.lineStyle(1.5, 0x331f12, 1);
      lantern.lineBetween(lx, awningH + 10, lx, awningH + 38);

      lantern.fillStyle(0x000000, 0.12);
      lantern.fillEllipse(lx, awningH + 62, 26, 32);
      lantern.fillStyle(0xf43f5e, 1);
      lantern.fillEllipse(lx, awningH + 60, 24, 30);
      lantern.fillStyle(0xfde047, 1);
      lantern.fillRect(lx - 14, awningH + 50, 28, 4);
      lantern.fillRect(lx - 14, awningH + 66, 28, 4);
      lantern.lineStyle(2, 0x331f12, 1);
      lantern.strokeEllipse(lx, awningH + 60, 24, 30);
      lantern.fillStyle(0xf59e0b, 1);
      lantern.fillRect(lx - 3.5, awningH + 75, 7, 12);
      lantern.setAlpha(0);
    }

    // 5. Honey Pine Wood Base Counter at Bottom
    const counter = this.add.graphics();
    const counterY = height - 55;
    counter.fillStyle(0xfde68a, 1);
    counter.fillRect(0, counterY, width, 55);
    counter.fillStyle(0xfcd34d, 0.6);
    counter.fillRect(0, counterY, width, 8);
    counter.lineStyle(2.5, 0x331f12, 1);
    counter.lineBetween(0, counterY, width, counterY);
  }

  createTitle() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;
    const titleY = isPortrait ? 155 : 185;

    this.titleContainer = this.add.container(cx, titleY);

    // 2.5D Kawaii Syllabus Badge Pill (Mint with Cocoa Outline)
    const badge = this.add.graphics();
    badge.fillStyle(0x000000, 0.18);
    badge.fillRoundedRect(-148, -107, 296, 34, 17);
    badge.fillStyle(THEME.secondaryDark, 1);
    badge.fillRoundedRect(-148, -108, 296, 32, 16);
    badge.fillStyle(THEME.secondary, 1);
    badge.fillRoundedRect(-148, -111, 296, 32, 16);
    badge.fillStyle(0xffffff, 0.35);
    badge.fillRoundedRect(-144, -109, 288, 12, 8);
    badge.lineStyle(2, 0x331f12, 1);
    badge.strokeRoundedRect(-148, -111, 296, 32, 16);
    this.titleContainer.add(badge);

    this.badgeText = this.add.text(0, -95, '★ KSSM FORM 4 MATHEMATICS ★', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#331f12', blur: 2, fill: true }
    }).setOrigin(0.5);
    this.titleContainer.add(this.badgeText);

    // Main Logo with 3D shadow & golden gradient stroke
    this.mainTitle = this.add.text(0, -35, localizationManager.t('app.title'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '40px' : '50px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#331f12',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 5, color: 'rgba(51, 31, 18, 0.4)', blur: 8, fill: true }
    }).setOrigin(0.5);
    this.titleContainer.add(this.mainTitle);

    // Decorative Sparkles on Logo
    const starLeft = this.add.image(-220, -50, 'icon_star').setScale(0.55).setAlpha(0.95);
    const starRight = this.add.image(220, -25, 'icon_star').setScale(0.45).setAlpha(0.95);
    this.titleContainer.add(starLeft);
    this.titleContainer.add(starRight);

    this.tweens.add({
      targets: [starLeft, starRight],
      scaleX: 0.65,
      scaleY: 0.65,
      angle: 15,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Tagline with subtitle glow
    this.tagline = this.add.text(0, 36, localizationManager.t('app.tagline'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '17px' : '20px',
      color: '#331f12',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#ffffff',
      strokeThickness: 3.5,
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(255,255,255,0.8)', blur: 4, fill: true }
    }).setOrigin(0.5);
    this.titleContainer.add(this.tagline);

    // Chef Math Mama Mascot Emblem
    const mamaTex = this.textures.exists('chef_math_mama') ? 'chef_math_mama' : (this.textures.exists('customer_avatar') ? 'customer_avatar' : null);
    if (mamaTex) {
      const mamaX = isPortrait ? 0 : -430;
      const mamaY = isPortrait ? -165 : 5;
      const mamaScale = isPortrait ? 0.28 : 0.27;
      this.mamaLogo = this.add.image(mamaX, mamaY, mamaTex).setScale(mamaScale);
      this.mamaLogo.setInteractive({ cursor: 'pointer' });
      this.mamaLogo.on('pointerdown', () => {
        try { audioManager.playCorrect(); } catch (e) {}
        this.tweens.add({
          targets: this.mamaLogo,
          scaleX: mamaScale * 1.15,
          scaleY: mamaScale * 0.88,
          duration: 120,
          yoyo: true
        });
      });
      this.titleContainer.add(this.mamaLogo);
    }

    // Gentle floating title animation
    this.tweens.add({
      targets: this.titleContainer,
      y: titleY + 7,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createProfileHUD() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;
    const player = playerManager.player;
    const hudY = isPortrait ? 255 : 308;
    const hudW = isPortrait ? Math.min(640, width - 40) : 580;
    const halfW = hudW / 2;

    this.hudContainer = this.add.container(cx, hudY);

    // Warm Cream Recipe Card / HUD with Clean Cocoa Outline
    const hudBg = this.add.graphics();
    // Ambient soft drop shadow
    hudBg.fillStyle(THEME.surfaceTealDark, 0.22);
    hudBg.fillRoundedRect(-halfW, -23, hudW, 54, 18);
    // 3D lip
    hudBg.fillStyle(THEME.surfaceWood, 0.72);
    hudBg.fillRoundedRect(-halfW, -24, hudW, 52, 16);
    // Warm cream body
    hudBg.fillStyle(THEME.panelBg, 0.98);
    hudBg.fillRoundedRect(-halfW, -26, hudW, 52, 16);
    // Top specular sheen
    hudBg.fillStyle(0xffffff, 0.6);
    hudBg.fillRoundedRect(-halfW + 4, -24, hudW - 8, 16, 12);
    // Clean cartoon cocoa border
    hudBg.lineStyle(2.5, THEME.outlineDark, 1);
    hudBg.strokeRoundedRect(-halfW, -26, hudW, 52, 16);
    // Inner delicate honey accent line
    hudBg.lineStyle(1.5, THEME.panelBorder, 0.9);
    hudBg.strokeRoundedRect(-halfW + 4, -22, hudW - 8, 44, 12);

    // Washi-tape stickers at corners
    hudBg.fillStyle(0xfb7185, 0.85);
    hudBg.fillRect(-halfW + 10, -28, 28, 8);
    hudBg.fillStyle(0x6ee7b7, 0.85);
    hudBg.fillRect(halfW - 38, -28, 28, 8);

    this.hudContainer.add(hudBg);

    // Level Badge Pill
    this.levelText = this.add.text(-halfW + 42, 0, `👑 ${localizationManager.t('restaurant.level')} ${player.level}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '16px' : '17px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.hudContainer.add(this.levelText);

    // Coin Icon & Value
    const coinImg = this.add.image(isPortrait ? -15 : -35, 0, 'icon_coin').setScale(0.58);
    this.hudContainer.add(coinImg);
    this.coinText = this.add.text(isPortrait ? 10 : -10, 0, `RM ${player.coins.toFixed(2)}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '17px' : '18px',
      color: '#b45309',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.hudContainer.add(this.coinText);

    // Star Icon & Value
    const starImg = this.add.image(halfW - 95, 0, 'icon_star').setScale(0.58);
    this.hudContainer.add(starImg);
    this.starText = this.add.text(halfW - 70, 0, `${player.stars} ★`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '17px' : '18px',
      color: '#d97706',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.hudContainer.add(this.starText);
  }

  createMenuButtons() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;

    if (isPortrait) {
      this.buttonsContainer = this.add.container(0, 0);
      const btnW = Math.min(600, width - 40);

      // Play Button
      this.btnPlay = createButton(this, cx, 345, localizationManager.t('menu.play'), {
        width: btnW,
        height: 56,
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        fontSize: '20px',
        onClick: () => {
          this.scene.start('RestaurantScene');
        }
      });
      this.buttonsContainer.add(this.btnPlay.container);

      // World Map Button
      this.btnWorldMap = createButton(this, cx, 415, '🗺️ ' + localizationManager.t('menu.worldMap'), {
        width: btnW,
        height: 52,
        bgColor: THEME.surfaceTealLight,
        bgDarkColor: THEME.surfaceTeal,
        fontSize: '18px',
        onClick: () => {
          this.scene.start('WorldMapScene');
        }
      });
      this.buttonsContainer.add(this.btnWorldMap.container);

      // Multiplayer / Co-op Button
      this.btnMultiplayer = createButton(this, cx, 483, '👥 ' + localizationManager.t('menu.multiplayer'), {
        width: btnW,
        height: 52,
        bgColor: THEME.accentRed,
        bgDarkColor: THEME.accentRedLip,
        fontSize: '18px',
        onClick: () => {
          this.scene.start('MultiplayerLobbyScene');
        }
      });
      this.buttonsContainer.add(this.btnMultiplayer.container);

      // Personal achievements (no global ranking)
      this.btnAchievements = createButton(this, cx, 551, '🎖️ ' + localizationManager.t('menu.achievements'), {
        width: btnW,
        height: 52,
        bgColor: THEME.surfaceWoodLight,
        bgDarkColor: THEME.surfaceWood,
        fontSize: '18px',
        onClick: () => {
          this.scene.start('AchievementsScene');
        }
      });
      this.buttonsContainer.add(this.btnAchievements.container);

      // Row: Language & Audio Toggles
      const halfRowW = (btnW - 14) / 2;
      const currentLang = localizationManager.getLanguage();
      const langLabel = currentLang === 'en' ? 'LANG: EN' : 'BAHASA: BM';
      this.btnLang = createButton(this, cx - halfRowW / 2 - 7, 619, langLabel, {
        width: halfRowW,
        height: 50,
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        fontSize: '15px',
        onClick: () => {
          localizationManager.toggleLanguage();
          gameManager.saveCurrentState();
        }
      });
      this.buttonsContainer.add(this.btnLang.container);

      const audioLabel = `SOUND: ${audioManager.soundEnabled ? 'ON' : 'OFF'}`;
      this.btnAudio = createButton(this, cx + halfRowW / 2 + 7, 619, audioLabel, {
        width: halfRowW,
        height: 50,
        bgColor: THEME.surfaceTealLight,
        bgDarkColor: THEME.surfaceTeal,
        fontSize: '15px',
        onClick: () => {
          const newState = !audioManager.soundEnabled;
          audioManager.setSoundEnabled(newState);
          gameManager.saveCurrentState();
          this.btnAudio.setText(`SOUND: ${newState ? 'ON' : 'OFF'}`);
        }
      });
      this.buttonsContainer.add(this.btnAudio.container);
    } else {
      this.buttonsContainer = this.add.container(640, 480);

      // Single warm recipe-card surface behind every primary action.
      const menuCard = this.add.graphics();
      menuCard.fillStyle(THEME.surfaceTealDark, 0.24);
      menuCard.fillRoundedRect(-345, -150, 690, 315, 24);
      menuCard.fillStyle(THEME.panelBg, 0.9);
      menuCard.fillRoundedRect(-340, -156, 680, 305, 20);
      menuCard.lineStyle(2.5, THEME.outlineDark, 0.9);
      menuCard.strokeRoundedRect(-340, -156, 680, 305, 20);
      menuCard.lineStyle(1.5, THEME.panelBorder, 0.9);
      menuCard.strokeRoundedRect(-332, -148, 664, 285, 16);
      this.buttonsContainer.add(menuCard);

      const colLeft = -145;
      const colRight = 145;

      // Col 1, Row 1: Play Button
      this.btnPlay = createButton(this, colLeft, -25, localizationManager.t('menu.play'), {
        width: 260,
        height: 48,
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        fontSize: '18px',
        onClick: () => {
          this.scene.start('RestaurantScene');
        }
      });
      this.buttonsContainer.add(this.btnPlay.container);

      // Col 1, Row 2: World Map Button
      this.btnWorldMap = createButton(this, colLeft, 35, '🗺️ ' + localizationManager.t('menu.worldMap'), {
        width: 260,
        height: 48,
        bgColor: THEME.surfaceTealLight,
        bgDarkColor: THEME.surfaceTeal,
        fontSize: '16px',
        onClick: () => {
          this.scene.start('WorldMapScene');
        }
      });
      this.buttonsContainer.add(this.btnWorldMap.container);

      // Col 1, Row 3: Multiplayer / Co-op Button
      this.btnMultiplayer = createButton(this, colLeft, 95, '👥 ' + localizationManager.t('menu.multiplayer'), {
        width: 260,
        height: 48,
        bgColor: THEME.accentRed,
        bgDarkColor: THEME.accentRedLip,
        fontSize: '16px',
        onClick: () => {
          this.scene.start('MultiplayerLobbyScene');
        }
      });
      this.buttonsContainer.add(this.btnMultiplayer.container);

      // Col 2, Row 1: Personal Achievements Button
      this.btnAchievements = createButton(this, colRight, -25, '🎖️ ' + localizationManager.t('menu.achievements'), {
        width: 260,
        height: 48,
        bgColor: THEME.surfaceWoodLight,
        bgDarkColor: THEME.surfaceWood,
        fontSize: '16px',
        onClick: () => {
          this.scene.start('AchievementsScene');
        }
      });
      this.buttonsContainer.add(this.btnAchievements.container);

      // Col 2, Row 2: Language Toggle Button
      const currentLang = localizationManager.getLanguage();
      const langLabel = currentLang === 'en' ? 'LANGUAGE: ENGLISH' : 'BAHASA: MELAYU';
      this.btnLang = createButton(this, colRight, 35, langLabel, {
        width: 260,
        height: 48,
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        fontSize: '15px',
        onClick: () => {
          localizationManager.toggleLanguage();
          gameManager.saveCurrentState();
        }
      });
      this.buttonsContainer.add(this.btnLang.container);

      // Col 2, Row 3: Audio Toggle Button
      const audioLabel = `SOUND: ${audioManager.soundEnabled ? 'ON' : 'OFF'}`;
      this.btnAudio = createButton(this, colRight, 95, audioLabel, {
        width: 260,
        height: 48,
        bgColor: THEME.surfaceTealLight,
        bgDarkColor: THEME.surfaceTeal,
        fontSize: '15px',
        onClick: () => {
          const newState = !audioManager.soundEnabled;
          audioManager.setSoundEnabled(newState);
          gameManager.saveCurrentState();
          this.btnAudio.setText(`SOUND: ${newState ? 'ON' : 'OFF'}`);
        }
      });
      this.buttonsContainer.add(this.btnAudio.container);
    }
  }

  refreshTexts() {
    this.mainTitle.setText(localizationManager.t('app.title'));
    this.tagline.setText(localizationManager.t('app.tagline'));
    this.levelText.setText(`${localizationManager.t('restaurant.level')} ${playerManager.player.level}`);
    this.btnPlay.setText(localizationManager.t('menu.play'));
    this.btnWorldMap.setText('🗺️ ' + localizationManager.t('menu.worldMap'));
    this.btnMultiplayer.setText('👥 ' + localizationManager.t('menu.multiplayer'));
    this.btnAchievements.setText('🎖️ ' + localizationManager.t('menu.achievements'));

    const lang = localizationManager.getLanguage();
    const isPortrait = this.isPortrait();
    this.btnLang.setText(isPortrait ? (lang === 'en' ? 'LANG: EN' : 'BAHASA: BM') : (lang === 'en' ? 'LANGUAGE: ENGLISH' : 'BAHASA: MELAYU'));
    if (this.btnTeacher) {
      this.btnTeacher.setText('🎓 ' + localizationManager.t('teacher.btnPortal'));
    }
    if (this.btnDaily) {
      this.btnDaily.setText(lang === 'ms' ? '⚡ CABARAN HARIAN (2X GANJARAN)' : '⚡ DAILY CHALLENGE (2X REWARDS)');
    }
  }

  createTeacherButton() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;

    if (isPortrait) {
      const btnW = Math.min(600, width - 40);
      this.btnTeacher = createButton(this, cx, 755, '🎓 ' + localizationManager.t('teacher.btnPortal'), {
        width: btnW,
        height: 50,
        fontSize: '16px',
        bgColor: THEME.accentRed,
        bgDarkColor: THEME.accentRedLip,
        onClick: () => {
          this.scene.start('TeacherDashboardScene');
        }
      });
    } else {
      this.btnTeacher = createButton(this, 1160, 42, '🎓 ' + localizationManager.t('teacher.btnPortal'), {
        width: 170,
        height: 42,
        fontSize: '13px',
        bgColor: THEME.accentRed,
        bgDarkColor: THEME.accentRedLip,
        onClick: () => {
          this.scene.start('TeacherDashboardScene');
        }
      });
    }
  }

  createDailyChallengeButton() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;
    const isMs = localizationManager.getLanguage() === 'ms';
    const text = isMs ? '⚡ CABARAN HARIAN (2X GANJARAN)' : '⚡ DAILY CHALLENGE (2X REWARDS)';

    if (isPortrait) {
      const btnW = Math.min(600, width - 40);
      this.btnDaily = createButton(this, cx, 687, text, {
        width: btnW,
        height: 52,
        fontSize: '16px',
        bgColor: 0x059669,
        bgDarkColor: 0x047857,
        onClick: () => {
          this.scene.start('DailyChallengeScene');
        }
      });
    } else {
      this.btnDaily = createButton(this, 640, 645, text, {
        width: 440,
        height: 44,
        fontSize: '15px',
        bgColor: 0x059669,
        bgDarkColor: 0x047857,
        onClick: () => {
          this.scene.start('DailyChallengeScene');
        }
      });
    }
  }

  shutdown() {
    if (this.unsubscribeLoc) {
      this.unsubscribeLoc();
      this.unsubscribeLoc = null;
    }
  }
}

export default MainMenuScene;
