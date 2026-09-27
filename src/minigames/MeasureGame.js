import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';
import { createMeasuringCup, createThermometer } from '../ui/utensilArt.js';

export class MeasureGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.targetVolume = options.target || 150; // ml
    this.maxVolume = 250;
    this.currentVolume = 0;
    this.isPouring = false;
    this.isCompleted = false;
    this.onComplete = options.onComplete || (() => {});

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 580 : 380;
    this.container = this.scene.add.container(cx, cy);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'MEASURE INGREDIENTS', 'Stop the marker at the target amount');
    // 1. Warm Honey-Pine Kitchen Tabletop with Clean Cocoa Outline
    const board = this.scene.add.graphics();
    // Drop shadow
    board.fillStyle(0x000000, 0.18);
    board.fillRoundedRect(-324, -156, 648, 318, 22);
    // Tabletop body
    board.fillStyle(0xfde68a, 1);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    // Inner bevel & wood grain
    board.fillStyle(0xfef3c7, 0.6);
    board.fillRoundedRect(-312, -152, 624, 304, 16);
    board.lineStyle(1.5, 0xd97706, 0.35);
    board.lineBetween(-290, -80, 290, -80);
    board.lineBetween(-290, 80, 290, 80);
    board.lineStyle(3, 0x331f12, 1);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);

    // Washi-tape corners
    board.fillStyle(0xfb7185, 0.9);
    board.fillRect(-305, -170, 36, 14);
    board.fillStyle(0x6ee7b7, 0.9);
    board.fillRect(269, -170, 36, 14);
    this.container.add(board);

    // 2. Cheerful Smiley Wooden Spoon Mascot on Left Side
    this.spoonMascot = this.scene.add.container(-220, 10);
    const spoonG = this.scene.add.graphics();
    spoonG.fillStyle(0x000000, 0.14);
    spoonG.fillEllipse(0, 95, 30, 10);
    spoonG.fillStyle(0xd97706, 1);
    spoonG.fillRoundedRect(-5, -20, 10, 110, 4);
    spoonG.fillStyle(0xfef3c7, 1);
    spoonG.fillRoundedRect(-3, -20, 6, 105, 3);
    spoonG.lineStyle(2, 0x331f12, 1);
    spoonG.strokeRoundedRect(-5, -20, 10, 110, 4);
    spoonG.fillStyle(0xfde68a, 1);
    spoonG.fillEllipse(0, -55, 34, 46);
    spoonG.fillStyle(0xfef08a, 0.7);
    spoonG.fillEllipse(0, -55, 26, 38);
    spoonG.lineStyle(2.5, 0x331f12, 1);
    spoonG.strokeEllipse(0, -55, 34, 46);
    // Face (: )
    spoonG.fillStyle = '#331f12';
    spoonG.fillCircle(-7, -60, 2.8);
    spoonG.fillCircle(7, -60, 2.8);
    spoonG.fillStyle = 'rgba(251, 113, 133, 0.6)';
    spoonG.fillCircle(-11, -54, 3.5);
    spoonG.fillCircle(11, -54, 3.5);
    spoonG.lineStyle(2, 0x331f12, 1);
    spoonG.beginPath();
    spoonG.arc(0, -53, 5.5, 0.1, Math.PI - 0.1);
    spoonG.stroke();
    // Bow
    spoonG.fillStyle = '#fb7185';
    spoonG.fillCircle(-5, -25, 4);
    spoonG.fillCircle(5, -25, 4);
    spoonG.fillStyle = '#e11d48';
    spoonG.fillCircle(0, -25, 3);

    this.spoonMascot.add(spoonG);
    this.container.add(this.spoonMascot);
    this.spoonMascot.setVisible(false);

    this.scene.tweens.add({
      targets: this.spoonMascot,
      y: 4,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Instruction Banner on Cute Recipe Note
    const memoG = this.scene.add.graphics();
    memoG.fillStyle(0x000000, 0.15);
    memoG.fillRoundedRect(-224, -212, 448, 44, 14);
    memoG.fillStyle(0xfffdf5, 1);
    memoG.fillRoundedRect(-220, -215, 440, 42, 12);
    memoG.lineStyle(2.5, 0x331f12, 1);
    memoG.strokeRoundedRect(-220, -215, 440, 42, 12);
    this.container.add(memoG);

    this.instructionText = this.scene.add.text(0, -194, '🥛 ' + localizationManager.t('cooking.measureInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // 4. Shared glass measuring cup illustration.
    this.beaker = createMeasuringCup(this.scene, 0, 0, 1);
    this.container.add(this.beaker);

    // Shared temperature/volume prop gives the station a readable physical
    // cue without introducing another unrelated cartoon style.
    this.container.add(createThermometer(this.scene, -220, 18, 0.72));

    // Liquid Graphic
    this.liquidGraphic = this.scene.add.graphics();
    this.container.add(this.liquidGraphic);

    // Graduation lines and numbers
    // The illustrated measuring cup already carries printed graduations.
    // Only draw the fallback scale when the raster prop is unavailable.
    if (!this.scene.textures.exists('utensil_measuring_cup')) {
      const graduations = this.scene.add.graphics();
      graduations.lineStyle(2, 0x331f12, 0.85);
      for (let v = 50; v <= 200; v += 50) {
        const y = 110 - (v / this.maxVolume) * 200;
        graduations.lineBetween(42, y, 75, y);
        const label = this.scene.add.text(38, y, `${v}`, {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '12px',
          color: '#331f12',
          fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.container.add(label);
      }
      this.container.add(graduations);
    }

    // Target Line (Golden dashed line with mini star tags)
    const targetY = 110 - (this.targetVolume / this.maxVolume) * 200;
    const targetIndicator = this.scene.add.graphics();
    targetIndicator.lineStyle(3, 0xf59e0b, 1);
    targetIndicator.lineBetween(-75, targetY, 75, targetY);
    this.container.add(targetIndicator);

    const targetLabel = this.scene.add.text(-86, targetY, `⭐ ${this.targetVolume} ml`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#d97706',
      backgroundColor: '#fef3c7',
      padding: { x: 6, y: 2 },
      fontStyle: 'bold'
    }).setOrigin(1, 0.5);
    this.container.add(targetLabel);

    // Current volume readout in Cute Retro Calculator Box
    this.calcBox = this.scene.add.container(215, 20);
    const calcG = this.scene.add.graphics();
    calcG.fillStyle(0x000000, 0.15);
    calcG.fillRoundedRect(-58, -48, 116, 116, 14);
    calcG.fillStyle(0xfef3c7, 1);
    calcG.fillRoundedRect(-56, -50, 112, 112, 12);
    calcG.lineStyle(2.5, 0x331f12, 1);
    calcG.strokeRoundedRect(-56, -50, 112, 112, 12);
    // Calculator screen
    calcG.fillStyle(0xdcfce7, 1);
    calcG.fillRoundedRect(-46, -42, 92, 34, 6);
    calcG.lineStyle(1.5, 0x331f12, 1);
    calcG.strokeRoundedRect(-46, -42, 92, 34, 6);
    this.calcBox.add(calcG);

    this.readoutText = this.scene.add.text(0, -25, `0 ml`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#065f46',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.calcBox.add(this.readoutText);

    // Cute calculator button grid
    const btnLabels = ['7','8','9','4','5','6'];
    for (let b = 0; b < 6; b++) {
      const bx = -32 + (b % 3) * 32;
      const by = 8 + Math.floor(b / 3) * 26;
      calcG.fillStyle(0xfde047, 1);
      calcG.fillRoundedRect(bx - 12, by - 10, 24, 20, 4);
      calcG.lineStyle(1, 0x331f12, 1);
      calcG.strokeRoundedRect(bx - 12, by - 10, 24, 20, 4);
      const bTxt = this.scene.add.text(bx, by, btnLabels[b], {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        color: '#331f12',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.calcBox.add(bTxt);
    }
    this.container.add(this.calcBox);

    // 5. Candy "TEKAN UNTUK TUANG / HOLD TO POUR" Button
    this.pourButton = this.scene.add.container(0, 175);
    const btnBg = this.scene.add.graphics();
    // 3D shadow lip
    btnBg.fillStyle(0x047857, 1);
    btnBg.fillRoundedRect(-120, -18, 240, 44, 14);
    // Button body
    btnBg.fillStyle(0x10b981, 1);
    btnBg.fillRoundedRect(-120, -22, 240, 44, 14);
    // Gloss
    btnBg.fillStyle(0xffffff, 0.35);
    btnBg.fillRoundedRect(-116, -20, 232, 14, 8);
    // Cocoa border
    btnBg.lineStyle(2.5, 0x331f12, 1);
    btnBg.strokeRoundedRect(-120, -22, 240, 44, 14);
    this.pourButton.add(btnBg);

    const btnText = this.scene.add.text(0, -1, '🥛 ' + (localizationManager.getLanguage() === 'ms' ? 'TEKAN UNTUK TUANG' : 'HOLD TO POUR'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.pourButton.add(btnText);

    setMiniGameInteractive(this.pourButton, 240, 44);

    this.pourButton.on('pointerdown', () => {
      if (this.isCompleted) return;
      this.isPouring = true;
    });

    this.stopPour = () => {
      if (this.isPouring && !this.isCompleted) {
        this.isPouring = false;
        this.finishMeasurement();
      }
    };

    this.pourButton.on('pointerup', this.stopPour);
    this.scene.input.on('pointerup', this.stopPour);

    this.container.add(this.pourButton);

    // The measuring cup itself is also a clear touch target on phones.
    const cupZone = this.scene.add.zone(0, 10, 190, 220).setInteractive({ cursor: 'pointer' });
    cupZone.on('pointerdown', () => {
      if (!this.isCompleted) this.isPouring = true;
    });
    cupZone.on('pointerup', this.stopPour);
    this.container.add(cupZone);

    // Feedback
    this.feedbackText = this.scene.add.text(0, -110, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);
  }

  update(time, delta) {
    if (this.isPouring && !this.isCompleted) {
      const pourRate = 120; // ml per second
      this.currentVolume = Math.min(this.maxVolume, this.currentVolume + pourRate * (delta / 1000));
      this.drawLiquid();
      this.readoutText.setText(localizationManager.t('cooking.currentVolume', { volume: Math.round(this.currentVolume) }));
      if (Math.random() < 0.3) {
        audioManager.playPour();
      }
      if (this.currentVolume >= this.maxVolume) {
        this.isPouring = false;
        this.finishMeasurement();
      }
    }
  }

  drawLiquid() {
    this.liquidGraphic.clear();
    const liquidHeight = (this.currentVolume / this.maxVolume) * 200;
    if (liquidHeight > 0) {
      // Coconut milk color: creamy white
      this.liquidGraphic.fillStyle(0xf8fafc, 0.95);
      this.liquidGraphic.fillRoundedRect(-76, 110 - liquidHeight, 152, liquidHeight, { tl: 0, tr: 0, bl: 8, br: 8 });
    }
  }

  finishMeasurement() {
    this.isCompleted = true;
    const errorMargin = Math.abs(this.currentVolume - this.targetVolume);
    let accuracy = 1.0;

    if (errorMargin <= 5) {
      accuracy = 1.0;
      this.feedbackText.setText(localizationManager.t('cooking.greatPour'));
      this.feedbackText.setColor('#4ade80');
      audioManager.playCorrect();
      if (this.spoonMascot) {
        this.scene.tweens.add({
          targets: this.spoonMascot,
          y: -20,
          scaleX: 1.18,
          scaleY: 0.85,
          duration: 120,
          yoyo: true,
          repeat: 1
        });
      }
    } else if (errorMargin <= 15) {
      accuracy = 0.8;
      this.feedbackText.setText('+80 PTS');
      this.feedbackText.setColor('#facc15');
      audioManager.playCorrect();
      if (this.spoonMascot) {
        this.scene.tweens.add({
          targets: this.spoonMascot,
          y: -12,
          duration: 100,
          yoyo: true
        });
      }
    } else {
      accuracy = Math.max(0.4, 1.0 - errorMargin / 50);
      this.feedbackText.setText(localizationManager.t('cooking.missed'));
      this.feedbackText.setColor('#f87171');
      audioManager.playWrong();
    }

    this.scene.time.delayedCall(1200, () => {
      this.destroy();
      this.onComplete(accuracy);
    });
  }

  destroy() {
    if (this.stopPour && this.scene && this.scene.input) {
      this.scene.input.off('pointerup', this.stopPour);
    }
    this.container.destroy();
  }
}

export default MeasureGame;
