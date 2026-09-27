import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class TimingGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.targetFlips = options.targetCycles || 3;
    this.successfulFlips = 0;
    this.indicatorX = -200;
    this.speed = 340;
    this.direction = 1;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'TIMING THE COOK', 'Tap FLIP inside the green sweet spot');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(3, THEME.outlineDark, 0.95);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.timingInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Track
    const track = this.scene.add.graphics();
    track.fillStyle(THEME.surfaceTealDark, 1);
    track.fillRoundedRect(-200, -30, 400, 60, 14);

    // Green Sweet Spot in Center (-40 to +40)
    track.fillStyle(0x22c55e, 0.6);
    track.fillRoundedRect(-45, -30, 90, 60, 10);
    this.container.add(track);

    // Moving Needle Indicator
    this.needle = this.scene.add.graphics();
    this.container.add(this.needle);

    // Flip Button
    const flipBtn = this.scene.add.container(0, 60);
    const fBg = this.scene.add.graphics();
    fBg.fillStyle(THEME.secondary, 1);
    fBg.fillRoundedRect(-90, -22, 180, 44, 12);
    const fTxt = this.scene.add.text(0, 0, 'FLIP! 🍳', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    flipBtn.add(fBg);
    flipBtn.add(fTxt);
    setMiniGameInteractive(flipBtn, 180, 44);
    flipBtn.on('pointerdown', () => this.handleFlip());
    this.container.add(flipBtn);

    // Counter & Feedback
    this.counterText = this.scene.add.text(0, 108, `Flips: ${this.successfulFlips} / ${this.targetFlips}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.counterText);
    this.feedbackText = this.scene.add.text(0, 140, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '16px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);
  }

  update(time, delta) {
    if (this.isCompleted) return;
    const dt = delta / 1000;
    this.indicatorX += this.direction * this.speed * dt;

    if (this.indicatorX > 190) {
      this.indicatorX = 190;
      this.direction = -1;
    } else if (this.indicatorX < -190) {
      this.indicatorX = -190;
      this.direction = 1;
    }

    this.needle.clear();
    this.needle.fillStyle(0xf59e0b, 1);
    this.needle.fillTriangle(this.indicatorX - 10, -45, this.indicatorX + 10, -45, this.indicatorX, -32);
    this.needle.lineStyle(3, 0xffffff, 1);
    this.needle.lineBetween(this.indicatorX, -30, this.indicatorX, 30);
  }

  handleFlip() {
    if (this.isCompleted) return;

    if (Math.abs(this.indicatorX) <= 45) {
      audioManager.playCorrect();
      this.successfulFlips += 1;
      this.counterText.setText(`Flips: ${this.successfulFlips} / ${this.targetFlips}`);
      this.counterText.setColor('#15803d');
      this.feedbackText.setText(Math.abs(this.indicatorX) <= 18 ? 'PERFECT FLIP!' : 'GOOD FLIP!').setColor('#15803d');
    } else {
      audioManager.playWrong();
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms'
        ? 'TIDAK KENA — tunggu zon hijau.'
        : 'MISS — wait for the green zone.').setColor('#b91c1c');
    }

    if (this.successfulFlips >= this.targetFlips) {
      this.isCompleted = true;
      this.scene.time.delayedCall(700, () => {
        this.destroy();
        this.onComplete(1.0);
      });
    }
  }

  destroy() {
    this.container.destroy();
  }
}

export default TimingGame;
