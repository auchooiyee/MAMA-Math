import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createButton } from '../ui/buttons.js';
import { createMiniGameShell } from '../ui/miniGameShell.js';
import { createKnife, createWokSpatula } from '../ui/utensilArt.js';

export class ChopGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.targetSlices = options.target || 4;
    this.currentSlices = 0;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;
    this.knifeSpeed = 220;
    this.knifeDirection = 1;

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 580 : 380;
    this.container = this.scene.add.container(cx, cy);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'PREPARE INGREDIENTS', 'Tap SLICE when the knife reaches the guide line');
    // 1. Warm Honey-Pine Cutting Board with Clean Cocoa Outline
    const board = this.scene.add.graphics();
    // Soft drop shadow
    board.fillStyle(0x000000, 0.18);
    board.fillRoundedRect(-324, -156, 648, 318, 22);
    // Cutting board body (honey beechwood)
    board.fillStyle(0xfde68a, 1);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    // Inner wood grain & bevel
    board.fillStyle(0xfef3c7, 0.6);
    board.fillRoundedRect(-312, -152, 624, 304, 16);
    // Wood grain lines
    board.lineStyle(1.5, 0xd97706, 0.35);
    board.lineBetween(-290, -90, 290, -90);
    board.lineBetween(-290, 0, 290, 0);
    board.lineBetween(-290, 90, 290, 90);
    // Clean Cartoon Cocoa Outline
    board.lineStyle(3, 0x331f12, 1);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);

    // Washi-tape corners (pink polka dot & pandan mint)
    board.fillStyle(0xfb7185, 0.9);
    board.fillRect(-305, -170, 36, 14);
    board.fillStyle(0x6ee7b7, 0.9);
    board.fillRect(269, -170, 36, 14);

    this.container.add(board);

    // Shared, uncharacterized wok spatula prop.
    this.spoonMascot = createWokSpatula(this.scene, 268, 10, 0.9);
    this.container.add(this.spoonMascot);
    this.spoonMascot.setVisible(false);

    // Gentle mascot idle breathing bob
    this.scene.tweens.add({
      targets: this.spoonMascot,
      y: 4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Cucumber Base
    this.cucumber = this.scene.add.graphics();
    this.drawCucumber();
    this.container.add(this.cucumber);

    // 4. Slice guide & target line
    this.guideLine = this.scene.add.graphics();
    this.guideLine.lineStyle(3, 0xffffff, 0.85);
    this.guideLine.lineBetween(0, -85, 0, 85);
    this.container.add(this.guideLine);

    // 5. Shared Warung Santoku illustration (keeps the blade and handle
    // consistent with the other mini-game utensils).
    this.knife = createKnife(this.scene, 0, -112, 0.55);
    this.container.add(this.knife);

    // 6. Cute Recipe Memo Note for Instruction
    const memoG = this.scene.add.graphics();
    memoG.fillStyle(0x000000, 0.15);
    memoG.fillRoundedRect(-224, -212, 448, 44, 14);
    memoG.fillStyle(0xfffdf5, 1);
    memoG.fillRoundedRect(-220, -215, 440, 42, 12);
    memoG.lineStyle(2.5, 0x331f12, 1);
    memoG.strokeRoundedRect(-220, -215, 440, 42, 12);
    this.container.add(memoG);

    this.instructionText = this.scene.add.text(0, -194, '🔪 ' + localizationManager.t('cooking.chopInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Slice counter
    this.counterText = this.scene.add.text(0, 185, this.getCounterString(), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#331f12',
      backgroundColor: '#fef3c7',
      padding: { x: 14, y: 5 },
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.counterText);

    // Feedback text
    this.feedbackText = this.scene.add.text(0, 75, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '24px',
      color: '#059669',
      stroke: '#ffffff',
      strokeThickness: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Interactive hit area on the whole board
    const hitArea = this.scene.add.zone(0, 0, 640, 320).setInteractive({ cursor: 'pointer' });
    hitArea.on('pointerdown', () => this.handleChop());
    this.container.add(hitArea);

    // Visible fallback control for touch devices and clear affordance for players.
    this.sliceButton = createButton(this.scene, 0, 128, '🔪 SLICE', {
      width: 190,
      height: 46,
      fontSize: '18px',
      bgColor: THEME.secondary,
      bgDarkColor: THEME.secondaryDark,
      onClick: () => this.handleChop()
    });
    this.container.add(this.sliceButton.container);

    this.targets = [];
    const stepX = 300 / (this.targetSlices + 1);
    for (let i = 1; i <= this.targetSlices; i++) {
      this.targets.push(Math.round(-150 + stepX * i));
    }
    this.knife.x = -200;
  }

  drawCucumber() {
    this.cucumber.clear();
    // Whole cucumber body
    this.cucumber.fillStyle(0x15803d, 1); // Dark green skin
    this.cucumber.fillRoundedRect(-220, -40, 440, 80, 40);
    // Inner cucumber core
    this.cucumber.fillStyle(0x86efac, 1); // Light green inside
    this.cucumber.fillRoundedRect(-200, -25, 400, 50, 25);
  }

  getCounterString() {
    return localizationManager.t('cooking.chopCount', {
      current: this.currentSlices,
      target: this.targetSlices
    });
  }

  update(time, delta) {
    if (this.isCompleted) return;

    // Slide the knife back and forth
    const dt = delta / 1000;
    this.knife.x += this.knifeDirection * this.knifeSpeed * dt;

    if (this.knife.x > 220) {
      this.knife.x = 220;
      this.knifeDirection = -1;
    } else if (this.knife.x < -220) {
      this.knife.x = -220;
      this.knifeDirection = 1;
    }

    // Guide line tracks next target
    const currentTarget = this.targets[this.currentSlices] || 0;
    this.guideLine.x = currentTarget;
  }

  handleChop() {
    if (this.isCompleted) return;

    audioManager.playChop();

    const targetX = this.targets[this.currentSlices] || 0;
    const distance = Math.abs(this.knife.x - targetX);

    // Precision calculation
    let accuracy = 0.5;
    if (distance < 25) {
      accuracy = 1.0;
      this.showFeedback(localizationManager.t('cooking.perfectCut'), 0x4ade80);
      if (this.spoonMascot) {
        this.scene.tweens.add({
          targets: this.spoonMascot,
          y: -18,
          scaleX: 1.18,
          scaleY: 0.86,
          duration: 120,
          yoyo: true
        });
      }
    } else if (distance < 50) {
      accuracy = 0.8;
      this.showFeedback('+75 PTS', 0xfacc15);
      if (this.spoonMascot) {
        this.scene.tweens.add({
          targets: this.spoonMascot,
          y: -10,
          duration: 100,
          yoyo: true
        });
      }
    } else {
      accuracy = 0.5;
      this.showFeedback(localizationManager.t('cooking.missed'), 0xf87171);
    }

    // Spawn cut line graphic
    const cutLine = this.scene.add.graphics();
    cutLine.lineStyle(3, 0x14532d, 1);
    cutLine.lineBetween(this.knife.x, -40, this.knife.x, 40);
    this.container.add(cutLine);

    this.currentSlices += 1;
    this.counterText.setText(this.getCounterString());

    if (this.currentSlices >= this.targetSlices) {
      this.isCompleted = true;
      this.instructionText.setText(localizationManager.t('cooking.perfectCut') || 'SELESAI! ⭐⭐⭐');
      this.instructionText.setColor('#4ade80');
      this.scene.time.delayedCall(450, () => {
        try {
          this.destroy();
        } catch (e) {
          console.warn('ChopGame destroy error:', e);
        }
        if (typeof this.onComplete === 'function') {
          this.onComplete(accuracy);
        }
      });
    }
  }

  showFeedback(text, colorHex) {
    this.feedbackText.setText(text);
    this.feedbackText.setColor('#' + colorHex.toString(16));
    this.feedbackText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.feedbackText,
      y: 50,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.feedbackText.y = 70;
      }
    });
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default ChopGame;
