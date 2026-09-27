import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';
import { createMixingBowl } from '../ui/utensilArt.js';

export class MixGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.ratio1 = options.ratio1 || 3;
    this.ratio2 = options.ratio2 || 2;
    this.currentVal1 = 1;
    this.currentVal2 = 1;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 580 : 380;
    this.container = this.scene.add.container(cx, cy);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'MIX THE RECIPE', 'Match the ratio shown on screen');
    // Mixing Bowl & Table
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelBg, 1);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.fillStyle(THEME.surfaceWoodLight, 0.12);
    board.fillRoundedRect(-300, -140, 600, 280, 14);
    this.container.add(board);

    // Shared Warung mixing bowl with the same cream/teal/cocoa treatment used
    // by the other utensil illustrations.
    const bowl = createMixingBowl(this.scene, 0, -10, 1.25);
    // Dough inside
    this.dough = this.scene.add.graphics();
    this.dough.fillStyle(0xfef08a, 1);
    this.dough.fillEllipse(0, -13, 108, 40);
    this.container.add(bowl);
    this.container.add(this.dough);

    // Instruction Banner
    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.mixInstruction', {
      ratio1: this.ratio1,
      ratio2: this.ratio2
    }), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Readout Text
    this.readoutText = this.scene.add.text(0, 80, this.getReadoutString(), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.readoutText);

    // Controls: Add Flour (+), Add Water (+)
    this.createIngredientButtons();

    // Feedback Text
    this.feedbackText = this.scene.add.text(0, 155, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);
  }

  createIngredientButtons() {
    // Flour + Button
    const btnFlour = this.scene.add.container(-140, 120);
    const bg1 = this.scene.add.graphics();
    bg1.fillStyle(THEME.secondary, 1);
    bg1.fillRoundedRect(-80, -20, 160, 40, 10);
    const txt1 = this.scene.add.text(0, 0, '+1 FLOUR', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btnFlour.add(bg1);
    btnFlour.add(txt1);
    setMiniGameInteractive(btnFlour, 160, 40);
    btnFlour.on('pointerdown', () => {
      if (this.isCompleted) return;
      this.currentVal1 = Math.min(6, this.currentVal1 + 1);
      audioManager.playClick();
      this.checkRatio();
    });
    this.container.add(btnFlour);

    // Water + Button
    const btnWater = this.scene.add.container(140, 120);
    const bg2 = this.scene.add.graphics();
    bg2.fillStyle(THEME.accentBlueLip, 1);
    bg2.fillRoundedRect(-80, -20, 160, 40, 10);
    const txt2 = this.scene.add.text(0, 0, '+1 WATER', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btnWater.add(bg2);
    btnWater.add(txt2);
    setMiniGameInteractive(btnWater, 160, 40);
    btnWater.on('pointerdown', () => {
      if (this.isCompleted) return;
      this.currentVal2 = Math.min(6, this.currentVal2 + 1);
      audioManager.playPour();
      this.checkRatio();
    });
    this.container.add(btnWater);
  }

  getReadoutString() {
    return localizationManager.t('cooking.mixRatio', {
      val1: this.currentVal1,
      val2: this.currentVal2
    });
  }

  checkRatio() {
    this.readoutText.setText(this.getReadoutString());

    // Animate dough squish
    this.scene.tweens.add({
      targets: this.dough,
      scaleX: 1.15,
      scaleY: 0.9,
      duration: 100,
      yoyo: true
    });

    if (this.currentVal1 === this.ratio1 && this.currentVal2 === this.ratio2) {
      this.isCompleted = true;
      audioManager.playCorrect();
      this.feedbackText.setText('PERFECT DOUGH RATIO!');
      this.feedbackText.setColor('#4ade80');
      this.scene.time.delayedCall(1000, () => {
        this.destroy();
        this.onComplete(1.0);
      });
    } else if (this.currentVal1 >= 5 && this.currentVal2 >= 5) {
      this.isCompleted = true;
      audioManager.playWrong();
      this.feedbackText.setText('RATIO IMBALANCED!');
      this.feedbackText.setColor('#f87171');
      this.scene.time.delayedCall(1000, () => {
        this.destroy();
        this.onComplete(0.6);
      });
    } else {
      const isMs = localizationManager.getLanguage() === 'ms';
      this.feedbackText.setText(isMs ? 'Nisbah belum tepat — terus laraskan.' : 'Not quite — keep adjusting the ratio.')
        .setColor('#9a3412');
    }
  }

  destroy() {
    this.container.destroy();
  }
}

export default MixGame;
