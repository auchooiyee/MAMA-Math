import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';
import { createCashRegister } from '../ui/utensilArt.js';

export class CashierGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.total = options.total || 12;
    this.paid = options.paid || 20;
    this.targetChange = this.paid - this.total; // RM 8
    this.currentChange = 0;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'CASHIER COUNTER', 'Calculate the correct change');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.cashierInstruction', {
      paid: this.paid,
      total: this.total
    }), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Bill & Paid Summary Card
    const card = this.scene.add.graphics();
    card.fillStyle(THEME.surfaceTealDark, 1);
    card.fillRoundedRect(-220, -90, 440, 60, 10);
    this.container.add(card);

    // Small illustrated till anchors the cashier scene visually and replaces
    // the otherwise text-only control area with a recognizable Warung prop.
    this.container.add(createCashRegister(this.scene, -254, 0, 0.48));

    const billTxt = this.scene.add.text(-200, -60, `Total: RM ${this.total.toFixed(2)}  |  Customer Paid: RM ${this.paid.toFixed(2)}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.container.add(billTxt);

    // Change Counter Display
    this.changeText = this.addChangeDisplay(0, 0);
    this.feedbackText = this.scene.add.text(0, 39, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Denomination Buttons (+RM 5, +RM 1, Clear)
    this.createMoneyBtn(-140, 75, '+ RM 5', 5, 0x10b981);
    this.createMoneyBtn(0, 75, '+ RM 1', 1, 0x3b82f6);
    this.createClearBtn(140, 75, 'RESET', 0xef4444);

    // Submit Change Button
    const submitBtn = this.scene.add.container(0, 130);
    const sBg = this.scene.add.graphics();
    sBg.fillStyle(THEME.secondary, 1);
    sBg.fillRoundedRect(-80, -20, 160, 40, 10);
    const sTxt = this.scene.add.text(0, 0, 'GIVE CHANGE', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    submitBtn.add(sBg);
    submitBtn.add(sTxt);
    setMiniGameInteractive(submitBtn, 160, 36);
    submitBtn.on('pointerdown', () => this.submit());
    this.container.add(submitBtn);
  }

  addChangeDisplay(x, y) {
    const t = this.scene.add.text(x, y, `Selected Change: RM 0.00`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textGold,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(t);
    return t;
  }

  createMoneyBtn(x, y, label, amount, color) {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-50, -18, 100, 36, 8);
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.add(bg);
    btn.add(txt);
    setMiniGameInteractive(btn, 100, 36);
    btn.on('pointerdown', () => {
      if (this.isCompleted) return;
      audioManager.playCoin();
      this.currentChange += amount;
      this.changeText.setText(`Selected Change: RM ${this.currentChange.toFixed(2)}`);
    });
    this.container.add(btn);
  }

  createClearBtn(x, y, label, color) {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-45, -18, 90, 36, 8);
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.add(bg);
    btn.add(txt);
    setMiniGameInteractive(btn, 90, 36);
    btn.on('pointerdown', () => {
      if (this.isCompleted) return;
      audioManager.playClick();
      this.currentChange = 0;
      this.changeText.setText(`Selected Change: RM 0.00`);
    });
    this.container.add(btn);
  }

  submit() {
    if (this.isCompleted) return;

    if (this.currentChange === this.targetChange) {
      this.isCompleted = true;
      audioManager.playCorrect();
      this.changeText.setColor('#4ade80');
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms' ? 'Baki tepat — bagus!' : 'Exact change — well done!').setColor('#15803d');
      this.scene.time.delayedCall(700, () => {
        this.destroy();
        this.onComplete(1.0);
      });
    } else {
      audioManager.playWrong();
      this.changeText.setColor('#f87171');
      this.feedbackText.setText(localizationManager.getLanguage() === 'ms' ? 'Belum tepat — laraskan baki dan cuba lagi.' : 'Not quite — adjust the change and try again.').setColor('#b91c1c');
    }
  }

  destroy() {
    this.container.destroy();
  }
}

export default CashierGame;
