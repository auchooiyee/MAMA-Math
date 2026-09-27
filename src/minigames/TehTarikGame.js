import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';
import { createTeaCup, createTeaPot } from '../ui/utensilArt.js';

export class TehTarikGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    // Pull mechanics
    this.pullHeight = 50; // Distance between mugs (px)
    this.isPulling = false;
    this.froth = 0; // 0 to 100%
    this.spillTimer = 0;

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 560 : 380;
    this.container = this.scene.add.container(cx, cy);

    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'PULL THE TEH TARIK', 'Tap when the tea stream is in the target');
    const isMs = localizationManager.getLanguage() === 'ms';
    // 1. Board Background
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -170, 640, 340, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -170, 640, 340, 20);
    this.container.add(board);

    // Instruction banner
    this.instructionText = this.scene.add.text(0, -195, localizationManager.t('cooking.tehTarikInstruction') || 'TARIK TEH TINGGI UNTUK HASILKAN BUIH PEKAT!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Kopitiam Countertop
    const counter = this.scene.add.graphics();
    counter.fillStyle(THEME.surfaceTealDark, 1);
    counter.fillRoundedRect(-240, 100, 480, 24, 6);
    this.container.add(counter);
    this.container.add(createTeaPot(this.scene, -235, 70, 0.58));

    // Sweet Spot Height Indicator Bar on left of stream
    const targetGuide = this.scene.add.graphics();
    targetGuide.fillStyle(0x22c55e, 0.25);
    targetGuide.fillRoundedRect(-120, -90, 60, 130, 8);
    targetGuide.lineStyle(2, 0x22c55e, 0.8);
    targetGuide.strokeRoundedRect(-120, -90, 60, 130, 8);
    this.container.add(targetGuide);

    const sweetText = this.scene.add.text(-90, -25, isMs ? 'ZON\nTARIK\nKAW!' : 'SWEET\nSPOT!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '11px',
      color: '#14532d',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(sweetText);

    // Dynamic Tea Pouring Stream
    this.teaStream = this.scene.add.graphics();
    this.container.add(this.teaStream);

    // Bottom Mug (Stationary on table at y = 70)
    this.bottomMug = this.scene.add.container(0, 70);
    this.drawBottomMug();
    this.container.add(this.bottomMug);

    // Top Mug (Moves dynamically with pullHeight)
    this.topMug = this.scene.add.container(0, 70 - this.pullHeight);
    this.drawTopMug();
    this.container.add(this.topMug);

    // Froth Gauge (Right side)
    const frothBg = this.scene.add.graphics();
    frothBg.fillStyle(THEME.surfaceTealDark, 0.9);
    frothBg.fillRoundedRect(180, -85, 45, 170, 10);
    frothBg.lineStyle(2, 0xd97706, 1);
    frothBg.strokeRoundedRect(180, -85, 45, 170, 10);
    this.container.add(frothBg);

    this.frothBar = this.scene.add.graphics();
    this.container.add(this.frothBar);

    const frothLabel = this.scene.add.text(202, 100, isMs ? 'BUIH ☕' : 'FOAM ☕', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(frothLabel);

    // "TARIK TEH" Interactive Button
    this.btnTarik = this.scene.add.container(0, 130);
    const bBg = this.scene.add.graphics();
    bBg.fillStyle(THEME.secondary, 1);
    bBg.fillRoundedRect(-110, -22, 220, 44, 12);
    bBg.lineStyle(2, 0xfef08a, 0.8);
    bBg.strokeRoundedRect(-110, -22, 220, 44, 12);

    const bTxt = this.scene.add.text(0, 0, isMs ? 'TAHAN UNTUK TARIK 🫖' : 'HOLD TO PULL 🫖', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.btnTarik.add([bBg, bTxt]);
    setMiniGameInteractive(this.btnTarik, 220, 44);

    this.btnTarik.on('pointerdown', () => {
      this.isPulling = true;
    });
    this.scene.input.on('pointerup', () => {
      this.isPulling = false;
    });
    this.container.add(this.btnTarik);

    // Cups and stream are a second, generous touch target for tablet/phone
    // play; the labelled button remains the primary affordance.
    const teaZone = this.scene.add.zone(0, 10, 180, 160).setInteractive({ cursor: 'pointer' });
    teaZone.on('pointerdown', () => { if (!this.isCompleted) this.isPulling = true; });
    teaZone.on('pointerup', () => { this.isPulling = false; });
    this.container.add(teaZone);

    // Floating feedback text
    this.feedbackText = this.scene.add.text(0, -145, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    this.updateFrothBar();
    this.drawTeaStream();
  }

  drawBottomMug() {
    this.bottomMug.add(createTeaCup(this.scene, 0, 0, 0.85));

    // Froth bubbles layer inside bottom mug
    this.frothGfx = this.scene.add.graphics();
    this.bottomMug.add(this.frothGfx);
  }

  drawTopMug() {
    const mug = createTeaCup(this.scene, 0, 0, 0.76);
    mug.setAngle(-8);
    this.topMug.add(mug);
  }

  drawTeaStream() {
    this.teaStream.clear();
    const topY = this.topMug.y + 24;
    const botY = this.bottomMug.y - 20;

    // Stream width tapers as height increases
    const streamWidth = Math.max(4, 14 - (this.pullHeight / 25));

    // Warm caramel pulled tea color
    this.teaStream.lineStyle(streamWidth, 0xc2410c, 0.95);
    this.teaStream.lineBetween(-5, topY, 0, botY);

    // Creamy center reflection
    this.teaStream.lineStyle(streamWidth * 0.4, 0xfef08a, 0.85);
    this.teaStream.lineBetween(-5, topY, 0, botY);
  }

  drawFrothBubbles() {
    this.frothGfx.clear();
    const fillAmount = (this.froth / 100);
    const bubbleY = -20 - (fillAmount * 15);

    // Foam cap
    this.frothGfx.fillStyle(0xfef3c7, 0.95);
    this.frothGfx.fillRoundedRect(-30, bubbleY, 60, 16 + fillAmount * 14, 8);

    // Bubbly circles
    const colors = [0xffedd5, 0xfde047, 0xffffff];
    for (let bx = -22; bx <= 22; bx += 8) {
      const col = colors[Math.abs(bx) % 3];
      this.frothGfx.fillStyle(col, 0.9);
      this.frothGfx.fillCircle(bx, bubbleY + 2, 4 + (fillAmount * 3));
    }
  }

  updateFrothBar() {
    this.frothBar.clear();
    const barH = 166 * (this.froth / 100);
    const barY = 83 - barH;

    this.frothBar.fillStyle(0xf59e0b, 1);
    this.frothBar.fillRoundedRect(182, barY, 41, barH, 4);
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      y: -160,
      duration: 700,
      onComplete: () => {
        this.feedbackText.y = -145;
      }
    });
  }

  update(time, delta) {
    if (this.isCompleted) return;
    const dt = delta / 1000;

    if (this.isPulling) {
      // Pull higher smoothly up to 260px
      this.pullHeight = Math.min(260, this.pullHeight + 110 * dt);
    } else {
      // Sinks back down if released
      this.pullHeight = Math.max(50, this.pullHeight - 90 * dt);
    }

    this.topMug.y = 70 - this.pullHeight;
    this.drawTeaStream();

    // Check sweet spot (120px to 220px)
    if (this.pullHeight >= 120 && this.pullHeight <= 220) {
      // Froth builds up!
      this.froth = Math.min(100, this.froth + 24 * dt);
      this.updateFrothBar();
      this.drawFrothBubbles();

      if (Math.random() < 0.08) {
      this.showFeedback(localizationManager.getLanguage() === 'ms' ? 'BUIH GELEBUNG! ☕' : 'FOAM BUILDING! ☕', 0xfacc15);
        audioManager.playChop();
      }
    } else if (this.pullHeight > 220) {
      // Danger of spilling!
      this.spillTimer += dt;
      if (this.spillTimer > 0.4) {
        this.spillTimer = 0;
      this.showFeedback(localizationManager.getLanguage() === 'ms' ? 'PERHATIAN: HAMPIR TUMPAH! ⚠️' : 'CAREFUL: ALMOST SPILLED! ⚠️', 0xf87171);
      }
    }

    if (this.froth >= 100 && !this.isCompleted) {
      this.isCompleted = true;
      this.instructionText.setText(localizationManager.getLanguage() === 'ms'
        ? 'TEH TARIK KAW BUIH MELELEH SEMPURNA! ⭐⭐⭐'
        : 'PERFECT FOAM! ⭐⭐⭐');
      this.instructionText.setColor('#4ade80');
      this.btnTarik.setVisible(false);

      this.showFeedback(localizationManager.getLanguage() === 'ms' ? 'TEH TARIK TERBAIK! 🌟' : 'PERFECT TEH TARIK! 🌟', 0x4ade80);
      try {
        audioManager.playLevelUp();
      } catch (e) {
        console.warn('Audio error:', e);
      }

      this.scene.time.delayedCall(1200, () => {
        try {
          this.destroy();
        } catch (e) {
          console.warn('TehTarikGame destroy error:', e);
        }
        this.onComplete(1.0);
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default TehTarikGame;
