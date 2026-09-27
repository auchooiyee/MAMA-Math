import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class ProbabilityGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;
    this.isSpinning = false;
    this.prediction = null;
    this.choiceButtons = [];

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    const isMs = localizationManager.getLanguage() === 'ms';
    createMiniGameShell(this.scene, this.container, 'PROBABILITY WHEEL', isMs
      ? 'Pilih warna yang paling mungkin, kemudian putar roda'
      : 'Choose the most likely color, then spin the wheel');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, isMs
      ? 'WARNA MANAKAH PALING MUNGKIN? PILIH DAHULU!'
      : 'WHICH COLOR IS MOST LIKELY? CHOOSE ONE FIRST!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Wheel Container
    this.wheel = this.scene.add.container(0, -40);
    const wheelG = this.scene.add.graphics();
    // 4 Quadrants: Gold (90 deg), Red (90 deg), Blue (180 deg)
    wheelG.fillStyle(0xfbbf24, 1); // Gold 1/4
    wheelG.slice(0, 0, 75, 0, Math.PI / 2, false);
    wheelG.fillPath();

    wheelG.fillStyle(0xef4444, 1); // Red 1/4
    wheelG.slice(0, 0, 75, Math.PI / 2, Math.PI, false);
    wheelG.fillPath();

    wheelG.fillStyle(0x3b82f6, 1); // Blue 1/2
    wheelG.slice(0, 0, 75, Math.PI, 2 * Math.PI, false);
    wheelG.fillPath();

    wheelG.lineStyle(3, 0xffffff, 1);
    wheelG.strokeCircle(0, 0, 75);
    this.wheel.add(wheelG);
    this.container.add(this.wheel);

    // Pointer pin
    const pin = this.scene.add.graphics();
    pin.fillStyle(0xffffff, 1);
    pin.fillTriangle(0, -118, -10, -134, 10, -134);
    this.container.add(pin);

    // Predict before the random spin: Blue covers half the wheel, the other
    // two colors each cover one quarter.
    this.createPredictionChoice(-104, 'Blue', isMs ? 'BIRU ½' : 'BLUE ½', 0x3b82f6);
    this.createPredictionChoice(0, 'Red', isMs ? 'MERAH ¼' : 'RED ¼', 0xef4444);
    this.createPredictionChoice(104, 'Gold', isMs ? 'EMAS ¼' : 'GOLD ¼', 0xf59e0b);

    // Spin Button
    const spinBtn = this.scene.add.container(0, 112);
    const bG = this.scene.add.graphics();
    bG.fillStyle(THEME.secondary, 1);
    bG.fillRoundedRect(-80, -20, 160, 40, 10);
    const bTxt = this.scene.add.text(0, 0, isMs ? 'PUTAR RODA! 🎡' : 'SPIN WHEEL! 🎡', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    spinBtn.add(bG);
    spinBtn.add(bTxt);
    setMiniGameInteractive(spinBtn, 160, 40);
    spinBtn.on('pointerdown', () => this.spin());
    this.container.add(spinBtn);

    // Result readout
    this.resultText = this.scene.add.text(0, 152, isMs ? 'Biru: ½  •  Merah: ¼  •  Emas: ¼' : 'Blue: 1/2  •  Red: 1/4  •  Gold: 1/4', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.resultText);
  }

  createPredictionChoice(x, color, label, fillColor) {
    const button = this.scene.add.container(x, 58);
    const bg = this.scene.add.graphics();
    bg.fillStyle(fillColor, 1).fillRoundedRect(-48, -17, 96, 34, 10);
    bg.lineStyle(2, 0xffffff, 0.9).strokeRoundedRect(-48, -17, 96, 34, 10);
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    button.add([bg, text]);
    setMiniGameInteractive(button, 96, 34);
    button.on('pointerdown', () => {
      if (this.isSpinning || this.isCompleted) return;
      this.prediction = color;
      this.choiceButtons.forEach(({ color: choiceColor, bg: choiceBg, fillColor: choiceFill }) => {
        choiceBg.clear();
        choiceBg.fillStyle(choiceFill, 1).fillRoundedRect(-48, -17, 96, 34, 10);
        choiceBg.lineStyle(2, choiceColor === this.prediction ? 0xffdf72 : 0xffffff, choiceColor === this.prediction ? 1 : 0.9)
          .strokeRoundedRect(-48, -17, 96, 34, 10);
      });
      this.resultText.setText(localizationManager.getLanguage() === 'ms' ? `Pilihan anda: ${label}` : `Your prediction: ${label}`)
        .setColor(THEME.textDark);
      audioManager.playClick();
    });
    this.container.add(button);
    this.choiceButtons.push({ color, bg, fillColor });
  }

  spin() {
    if (this.isSpinning || this.isCompleted) return;
    if (!this.prediction) {
      this.resultText.setText(localizationManager.getLanguage() === 'ms'
        ? 'Pilih warna dahulu sebelum memutar.'
        : 'Choose a color before spinning.').setColor('#b91c1c');
      audioManager.playWrong();
      return;
    }
    this.isSpinning = true;
    audioManager.playClick();

    // Sector weights match the artwork: Gold 1/4, Red 1/4, Blue 1/2.
    // The pointer is fixed at the top; these wheel rotations place each
    // sector's centre under it after four full turns.
    const roll = Math.random();
    const outcome = roll < 0.25
      ? { name: 'Gold', probability: '1/4', rotation: 225 }
      : roll < 0.5
        ? { name: 'Red', probability: '1/4', rotation: 135 }
        : { name: 'Blue', probability: '1/2', rotation: 0 };
    const targetAngle = 360 * 4 + outcome.rotation;
    this.scene.tweens.add({
      targets: this.wheel,
      angle: targetAngle,
      duration: 1600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        audioManager.playCorrect();
        this.isCompleted = true;
        const isMs = localizationManager.getLanguage() === 'ms';
        const correctPrediction = this.prediction === 'Blue';
        this.resultText.setText(isMs
          ? `${correctPrediction ? 'Betul' : 'Belum tepat'}: Biru paling mungkin (½). Roda: ${outcome.name === 'Blue' ? 'Biru' : outcome.name === 'Gold' ? 'Emas' : 'Merah'} (${outcome.probability}).`
          : `${correctPrediction ? 'Correct' : 'Not quite'}: Blue is most likely (1/2). Wheel: ${outcome.name} (${outcome.probability}).`);
        this.resultText.setColor(correctPrediction ? '#15803d' : '#b91c1c');
        this.scene.time.delayedCall(800, () => {
          this.destroy();
          this.onComplete(correctPrediction ? 1.0 : 0.6);
        });
      }
    });
  }

  destroy() {
    this.container.destroy();
  }
}

export default ProbabilityGame;
