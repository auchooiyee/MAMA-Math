import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class TemperatureGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.targetMin = options.targetMin || 160;
    this.targetMax = options.targetMax || 200;
    this.currentTemp = 100;
    this.isHeating = false;
    this.cookProgress = 0; // 0 to 100%
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 580 : 380;
    this.container = this.scene.add.container(cx, cy);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'CONTROL THE HEAT', localizationManager.getLanguage() === 'ms'
      ? 'Tahan haba untuk kekalkan penunjuk dalam zon hijau'
      : 'Hold heat to keep the needle in the green zone');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.heatInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Thermometer Gauge Track
    const gauge = this.scene.add.graphics();
    gauge.fillStyle(THEME.surfaceTealDark, 1);
    gauge.fillRoundedRect(-220, -40, 440, 40, 10);

    // Green Optimal Zone on track (160 to 200 out of 250 max)
    const greenX = -220 + (160 / 250) * 440;
    const greenW = ((200 - 160) / 250) * 440;
    gauge.fillStyle(0x22c55e, 0.5);
    gauge.fillRect(greenX, -40, greenW, 40);
    this.container.add(gauge);

    // Indicator Needle
    this.needle = this.scene.add.graphics();
    this.drawNeedle();
    this.container.add(this.needle);

    // Temperature text
    this.tempText = this.scene.add.text(0, 25, localizationManager.t('cooking.currentTemp', { temp: 100 }), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.tempText);
    this.feedbackText = this.scene.add.text(0, 98, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '16px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Progress Bar
    const progBg = this.scene.add.graphics();
    progBg.fillStyle(THEME.surfaceTealDark, 1);
    progBg.fillRoundedRect(-160, 65, 320, 18, 9);
    this.progBar = this.scene.add.graphics();
    this.container.add(progBg);
    this.container.add(this.progBar);

    // Heat Button
    const heatBtn = this.scene.add.container(0, 134);
    const hBg = this.scene.add.graphics();
    hBg.fillStyle(THEME.secondary, 1);
    hBg.fillRoundedRect(-90, -20, 180, 40, 10);
    const hTxt = this.scene.add.text(0, 0, 'HOLD: HEAT UP 🔥', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    heatBtn.add(hBg);
    heatBtn.add(hTxt);
    setMiniGameInteractive(heatBtn, 180, 40);

    heatBtn.on('pointerdown', () => { this.isHeating = true; });
    this.stopHeat = () => { this.isHeating = false; };
    heatBtn.on('pointerup', this.stopHeat);
    this.scene.input.on('pointerup', this.stopHeat);

    this.container.add(heatBtn);
  }

  drawNeedle() {
    this.needle.clear();
    const x = -220 + (this.currentTemp / 250) * 440;
    this.needle.fillStyle(0xf59e0b, 1);
    this.needle.fillTriangle(x - 8, -48, x + 8, -48, x, -38);
    this.needle.lineStyle(3, 0xffffff, 1);
    this.needle.lineBetween(x, -40, x, 0);
  }

  update(time, delta) {
    if (this.isCompleted) return;
    const dt = delta / 1000;

    if (this.isHeating) {
      this.currentTemp = Math.min(250, this.currentTemp + 70 * dt);
    } else {
      this.currentTemp = Math.max(60, this.currentTemp - 40 * dt);
    }

    this.drawNeedle();
    this.tempText.setText(localizationManager.t('cooking.currentTemp', { temp: Math.round(this.currentTemp) }));

    // If inside green zone, increase cook progress
    if (this.currentTemp >= this.targetMin && this.currentTemp <= this.targetMax) {
      this.cookProgress += 25 * dt;
      this.tempText.setColor('#4ade80');
    } else {
      this.tempText.setColor(THEME.textDark);
    }

    // Update progress bar
    this.progBar.clear();
    this.progBar.fillStyle(THEME.secondary, 1);
    this.progBar.fillRoundedRect(-158, 67, (316 * Math.min(100, this.cookProgress)) / 100, 14, 7);

    if (this.cookProgress >= 100) {
      this.isCompleted = true;
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms' ? 'Haba tepat — masakan siap!' : 'PERFECT HEAT — COOKED!').setColor('#15803d');
      audioManager.playCorrect();
      this.scene.time.delayedCall(800, () => {
        this.destroy();
        this.onComplete(1.0);
      });
    }
  }

  destroy() {
    if (this.stopHeat && this.scene && this.scene.input) {
      this.scene.input.off('pointerup', this.stopHeat);
    }
    this.container.destroy();
  }
}

export default TemperatureGame;
