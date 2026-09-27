import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import audioManager from '../managers/AudioManager.js';
import worldsData from '../data/worlds.json' with { type: 'json' };
import { bossManager } from '../managers/BossManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  create() {
    this.createBackground();
    this.createTopHUD();
    this.createWorldNodes();
    this.createFinalBossNode();
  }

  createBackground() {
    // Keep the map inside the same illustrated warung world as every other scene.
    this.add.image(640, 360, 'bg_warung_morning')
      .setDisplaySize(1280, 720)
      .setAlpha(0.9)
      .setDepth(-20);
    const bg = this.add.graphics();
    bg.fillGradientStyle(THEME.surfaceTealDark, THEME.surfaceTealDark, THEME.surfaceWood, THEME.surfaceWood, 0.68);
    bg.fillRect(0, 0, 1280, 720);

    // Decorative map grid
    const grid = this.add.graphics();
    grid.lineStyle(1, THEME.panelHighlight, 0.14);
    for (let x = 0; x < 1280; x += 80) grid.lineBetween(x, 0, x, 720);
    for (let y = 0; y < 720; y += 80) grid.lineBetween(0, y, 1280, y);

    // Title banner
    this.titleText = this.add.text(640, 45, localizationManager.t('worlds.title'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#fff1c4',
      stroke: '#164e63',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createTopHUD() {
    // Back to Restaurant Button
    const btnBack = createButton(this, 110, 45, '← WARUNG', {
      width: 140,
      height: 42,
      fontSize: '15px',
      bgColor: 0x334155,
      onClick: () => {
        this.scene.start('RestaurantScene');
      }
    });

    // Boss Arena Selector Button
    const isMs = localizationManager.getLanguage() === 'ms';
    createButton(this, 280, 45, isMs ? '⚔️ ARENA BOS' : '⚔️ BOSS ARENA', {
      width: 150,
      height: 42,
      fontSize: '14px',
      bgColor: 0x991b1b,
      bgDarkColor: 0x7f1d1d,
      onClick: () => {
        this.openBossSelectorModal();
      }
    });

    // Star Tracker on top right
    const player = playerManager.player;
    const hud = this.add.container(1150, 45);
    const starImg = this.add.image(-40, 0, 'icon_star').setScale(0.6);
    const starTxt = this.add.text(-15, 0, `${player.stars} ★`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    hud.add(starImg);
    hud.add(starTxt);
  }

  createWorldNodes() {
    const playerStars = playerManager.player.stars;

    // Connect nodes with road dashed lines
    const roads = this.add.graphics();
    roads.lineStyle(4, THEME.panelHighlight, 0.58);
    for (let i = 0; i < worldsData.length - 1; i++) {
      const w1 = worldsData[i];
      const w2 = worldsData[i + 1];
      roads.lineBetween(w1.mapX, w1.mapY, w2.mapX, w2.mapY);
    }

    // Render each world node
    worldsData.forEach(w => {
      const isUnlocked = playerStars >= w.requiredStars;
      const node = this.add.container(w.mapX, w.mapY);

      const circle = this.add.graphics();
      circle.fillStyle(isUnlocked ? w.color : THEME.surfaceTealDark, 1);
      circle.fillCircle(0, 0, 42);
      circle.lineStyle(3, isUnlocked ? THEME.panelHighlight : THEME.surfaceTealLight, 1);
      circle.strokeCircle(0, 0, 42);
      node.add(circle);

      // Icon or Lock
      const icon = this.add.text(0, 0, isUnlocked ? w.icon : '🔒', {
        fontSize: '28px'
      }).setOrigin(0.5);
      node.add(icon);

      // World Title Tag
      const titleTag = this.add.text(0, 56, localizationManager.t(w.titleKey), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: isUnlocked ? '#fff8e7' : '#d8e8e2',
        stroke: '#164e63',
        strokeThickness: 3,
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      node.add(titleTag);

      // Subtitle
      const subTag = this.add.text(0, 76, localizationManager.t(w.subtitleKey), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#fff1c4',
        stroke: '#164e63',
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: 190 }
      }).setOrigin(0.5);
      node.add(subTag);

      if (isUnlocked) {
        node.setSize(88, 88);
        node.setInteractive({ cursor: 'pointer' });

        node.on('pointerover', () => {
          this.tweens.add({ targets: node, scale: 1.12, duration: 120 });
        });
        node.on('pointerout', () => {
          this.tweens.add({ targets: node, scale: 1.0, duration: 120 });
        });
        node.on('pointerdown', () => {
          audioManager.playClick();
          this.scene.start('MissionSelectScene', { worldId: w.id });
        });
      }

      // Gentle pulse for World 1
      if (w.id === 1) {
        this.tweens.add({
          targets: circle,
          scale: 1.06,
          duration: 900,
          yoyo: true,
          repeat: -1
        });
      }
    });
  }

  createFinalBossNode() {
    const isMs = localizationManager.getLanguage() === 'ms';
    const finalNode = this.add.container(640, 360);

    const circle = this.add.graphics();
    circle.fillStyle(THEME.accentRedLip, 0.96);
    circle.fillCircle(0, 0, 46);
    circle.lineStyle(3, THEME.primaryLight, 1);
    circle.strokeCircle(0, 0, 46);
    finalNode.add(circle);

    const icon = this.add.text(0, -6, '🔥', { fontSize: '32px' }).setOrigin(0.5);
    finalNode.add(icon);

    const title = this.add.text(0, 56, isMs ? 'KRISIS EMPAYAR' : 'CRISIS BOSS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#fff1c4',
      stroke: '#164e63',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    finalNode.add(title);

    finalNode.setInteractive(new Phaser.Geom.Circle(0, 0, 52), Phaser.Geom.Circle.Contains);

    this.tweens.add({
      targets: circle,
      scale: 1.08,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    finalNode.on('pointerover', () => {
      this.tweens.add({ targets: finalNode, scale: 1.1, duration: 120 });
    });
    finalNode.on('pointerout', () => {
      this.tweens.add({ targets: finalNode, scale: 1.0, duration: 120 });
    });

    finalNode.on('pointerdown', () => {
      audioManager.playClick();
      this.scene.start('BossBattleScene', { bossId: 'boss-final' });
    });
  }

  openBossSelectorModal() {
    const isMs = localizationManager.getLanguage() === 'ms';
    const modalContainer = this.add.container(640, 360);

    // Dark backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(-640, -360, 1280, 720);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    modalContainer.add(backdrop);

    // Modal Panel
    const panel = this.add.graphics();
    panel.fillStyle(THEME.panelBg, 0.98);
    panel.lineStyle(3, THEME.surfaceTeal, 1);
    panel.fillRoundedRect(-480, -280, 960, 560, 18);
    panel.strokeRoundedRect(-480, -280, 960, 560, 18);
    modalContainer.add(panel);

    // Title
    const title = this.add.text(0, -240, isMs ? '⚔️ ARENA PERTEMPURAN BOS KSSM TINGKATAN 4' : '⚔️ FORM 4 KSSM BOSS BATTLE ARENA', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: '#c87917',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modalContainer.add(title);

    // Close button
    const closeBtn = this.add.text(450, -250, '✕', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#ef4444'
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    closeBtn.on('pointerdown', () => {
      modalContainer.destroy();
    });
    modalContainer.add(closeBtn);

    // Render 10 Bosses in 2 Columns + Final Boss Banner
    const bosses = bossManager.getBossList();
    const colWidth = 440;
    const startY = -180;

    bosses.slice(0, 10).forEach((b, idx) => {
      const col = idx < 5 ? 0 : 1;
      const row = idx % 5;
      const x = col === 0 ? -225 : 225;
      const y = startY + row * 66;

      const bossRow = this.add.container(x, y);
      const rowBg = this.add.graphics();
      rowBg.fillStyle(THEME.panelLight, 0.98);
      rowBg.lineStyle(1.5, THEME.panelBorder, 1);
      rowBg.fillRoundedRect(-205, -28, 410, 56, 10);
      rowBg.strokeRoundedRect(-205, -28, 410, 56, 10);
      bossRow.add(rowBg);

      const bIcon = this.add.text(-180, 0, b.avatar, { fontSize: '24px' }).setOrigin(0.5);
      bossRow.add(bIcon);

      const bName = this.add.text(-150, -10, isMs ? b.name_ms : b.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: THEME.textDark,
        fontStyle: 'bold'
      });
      bossRow.add(bName);

      const bSub = this.add.text(-150, 8, `HP: ${b.hp}  |  Bab ${b.chapter}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        color: THEME.textMuted
      });
      bossRow.add(bSub);

      const fightBtn = this.add.container(150, 0);
      const fBg = this.add.graphics();
      fBg.fillStyle(0xe11d48, 1);
      fBg.fillRoundedRect(-42, -18, 84, 36, 8);
      const fTxt = this.add.text(0, 0, isMs ? 'LAWAN' : 'FIGHT', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      fightBtn.add([fBg, fTxt]);
      fightBtn.setSize(84, 36);
      fightBtn.setInteractive({ cursor: 'pointer' });
      fightBtn.on('pointerdown', () => {
        modalContainer.destroy();
        this.scene.start('BossBattleScene', { bossId: b.id });
      });
      bossRow.add(fightBtn);

      modalContainer.add(bossRow);
    });

    // Grand Finale Boss Banner at bottom
    const finalBoss = bosses.find(b => b.id === 'boss-final');
    if (finalBoss) {
      const fContainer = this.add.container(0, 200);
      const fBg = this.add.graphics();
      fBg.fillStyle(0x7f1d1d, 1);
      fBg.lineStyle(2, 0xf59e0b, 1);
      fBg.fillRoundedRect(-425, -34, 850, 68, 12);
      fBg.strokeRoundedRect(-425, -34, 850, 68, 12);
      fContainer.add(fBg);

      const fIcon = this.add.text(-380, 0, '👑🔥', { fontSize: '26px' }).setOrigin(0.5);
      const fTitle = this.add.text(-330, -10, isMs ? finalBoss.name_ms : finalBoss.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        color: '#fbbf24',
        fontStyle: 'bold'
      });
      const fSub = this.add.text(-330, 10, isMs ? 'Kemuncak 3-Peringkat Sintesis Pelbagai Bab' : 'Grand 3-Stage Multi-Chapter Synthesis Encounter', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#fed7aa'
      });
      fContainer.add([fIcon, fTitle, fSub]);

      const btnPlayFinal = this.add.container(320, 0);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0xf59e0b, 1);
      btnBg.fillRoundedRect(-75, -20, 150, 40, 8);
      const btnTxt = this.add.text(0, 0, isMs ? 'KEMUNCAK' : 'ENTER FINALE', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: '#0f172a',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      btnPlayFinal.add([btnBg, btnTxt]);
      btnPlayFinal.setSize(150, 40);
      btnPlayFinal.setInteractive({ cursor: 'pointer' });
      btnPlayFinal.on('pointerdown', () => {
        modalContainer.destroy();
        this.scene.start('BossBattleScene', { bossId: 'boss-final' });
      });
      fContainer.add(btnPlayFinal);

      modalContainer.add(fContainer);
    }
  }
}

export default WorldMapScene;
