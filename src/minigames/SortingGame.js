import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class SortingGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;
    this.items = [
      { name: '🌶️ Extra Sambal', correctSet: 'A' },
      { name: '🍜 Kway Teow', correctSet: 'B' },
      { name: '🔥 Curry Laksa', correctSet: 'BOTH' }
    ];
    this.currentIndex = 0;
    this.correctCount = 0;

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'SORT THE ORDER', 'Arrange the ingredients using the clue');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.sortingInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Venn Circles
    const circles = this.scene.add.graphics();
    // Circle A: Spicy
    circles.fillStyle(0xef4444, 0.25);
    circles.fillCircle(-80, 0, 100);
    circles.lineStyle(2, 0xef4444, 0.8);
    circles.strokeCircle(-80, 0, 100);

    // Circle B: Noodles
    circles.fillStyle(0x3b82f6, 0.25);
    circles.fillCircle(80, 0, 100);
    circles.lineStyle(2, 0x3b82f6, 0.8);
    circles.strokeCircle(80, 0, 100);
    this.container.add(circles);

    // Labels
    const lblA = this.scene.add.text(-120, -90, 'SET A: SPICY', { fontFamily: 'Nunito', fontSize: '15px', color: '#b91c1c', fontStyle: 'bold' }).setOrigin(0.5);
    const lblB = this.scene.add.text(120, -90, 'SET B: NOODLES', { fontFamily: 'Nunito', fontSize: '15px', color: '#0369a1', fontStyle: 'bold' }).setOrigin(0.5);
    const lblBoth = this.scene.add.text(0, -90, 'A ∩ B', { fontFamily: 'Nunito', fontSize: '15px', color: '#a16207', fontStyle: 'bold' }).setOrigin(0.5);
    this.container.add(lblA);
    this.container.add(lblB);
    this.container.add(lblBoth);

    // Current Item Display Box
    this.itemText = this.scene.add.text(0, -20, this.items[0].name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.itemText);
    this.feedbackText = this.scene.add.text(0, 112, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '17px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // 3 Buttons for selection
    this.createChoiceBtn(-140, 60, 'SET A ONLY', 'A', 0xef4444);
    this.createChoiceBtn(0, 60, 'BOTH (A ∩ B)', 'BOTH', 0xeab308);
    this.createChoiceBtn(140, 60, 'SET B ONLY', 'B', 0x3b82f6);
  }

  createChoiceBtn(x, y, label, choiceVal, color) {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-55, -18, 110, 36, 10);
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.add(bg);
    btn.add(txt);
    setMiniGameInteractive(btn, 110, 36);
    btn.on('pointerdown', () => this.handleChoice(choiceVal));
    this.container.add(btn);
  }

  handleChoice(choice) {
    if (this.isCompleted) return;
    const current = this.items[this.currentIndex];

    if (choice === current.correctSet) {
      this.correctCount += 1;
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms' ? 'Betul! Susunan yang tepat.' : 'Correct! That belongs here.').setColor('#15803d');
      audioManager.playCorrect();
    } else {
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms' ? 'Belum tepat — cuba kategori lain.' : 'Not quite — try the other category.').setColor('#b91c1c');
      audioManager.playWrong();
    }

    this.currentIndex += 1;
    if (this.currentIndex < this.items.length) {
      this.itemText.setText(this.items[this.currentIndex].name);
    } else {
      this.isCompleted = true;
      this.scene.time.delayedCall(700, () => {
        this.destroy();
        this.onComplete(this.correctCount / this.items.length);
      });
    }
  }

  destroy() {
    this.container.destroy();
  }
}

export default SortingGame;
