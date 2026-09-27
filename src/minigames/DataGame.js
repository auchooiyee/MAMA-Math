import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class DataGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;
    this.feedbackText = null;

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'READ THE DATA', 'Use the chart to answer the question');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.dataInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);
    this.feedbackText = this.scene.add.text(0, 126, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '16px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Card A: Assistant A (Mean = 12m, σ = 1.4m)
    this.createCard(-140, -10, 'ASSISTANT A', 'Mean: 12 min\nStd Dev: 1.4 min\n(Tight Cluster)', true);

    // Card B: Assistant B (Mean = 12m, σ = 3.8m)
    this.createCard(140, -10, 'ASSISTANT B', 'Mean: 12 min\nStd Dev: 3.8 min\n(High Spread)', false);
  }

  createCard(x, y, title, details, isConsistent) {
    const card = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(THEME.surfaceTealDark, 1);
    bg.fillRoundedRect(-110, -70, 220, 140, 14);
    bg.lineStyle(2, 0x475569, 1);
    bg.strokeRoundedRect(-110, -70, 220, 140, 14);
    card.add(bg);

    const t = this.scene.add.text(0, -45, title, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    card.add(t);

    const d = this.scene.add.text(0, 5, details, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5);
    card.add(d);

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(THEME.secondary, 1);
    btnBg.fillRoundedRect(-70, 42, 140, 28, 8);
    const btnTxt = this.scene.add.text(0, 56, 'CHOOSE', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    card.add(btnBg);
    card.add(btnTxt);

    setMiniGameInteractive(card, 220, 140);
    card.on('pointerdown', () => {
      if (this.isCompleted) return;
      if (isConsistent) {
        audioManager.playCorrect();
        this.isCompleted = true;
        this.feedbackText.setText(localizationManager.getLanguage() === 'ms'
          ? 'Tepat! Sisihan piawai lebih kecil.'
          : 'Correct! The lower standard deviation is more consistent.').setColor('#15803d');
        this.scene.time.delayedCall(700, () => {
          this.destroy();
          this.onComplete(1.0);
        });
      } else {
        audioManager.playWrong();
        this.feedbackText.setText(localizationManager.getLanguage() === 'ms'
          ? 'Semak sisihan piawai: lebih kecil bermaksud lebih konsisten.'
          : 'Check the spread: a smaller standard deviation is more consistent.').setColor('#b91c1c');
      }
    });

    this.container.add(card);
  }

  destroy() {
    this.container.destroy();
  }
}

export default DataGame;
