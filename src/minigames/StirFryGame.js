import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import cookingManager from '../managers/CookingManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';
import { createWok, createWokSpatula } from '../ui/utensilArt.js';

export class StirFryGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    this.targetTosses = 4;
    this.currentTosses = 0;

    // Rhythm Ring indicator
    this.ringScale = 2.4;
    this.ringSpeed = 1.3; // collapses in ~1.5s
    this.isTossing = false;

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 560 : 380;
    this.container = this.scene.add.container(cx, cy);

    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'STIR FRY', 'Keep the wok moving to cook evenly');
    const isMs = localizationManager.getLanguage() === 'ms';
    // 1. Warm Honey-Pine Stove Counter with Clean Cocoa Outline
    const board = this.scene.add.graphics();
    // Drop shadow
    board.fillStyle(0x000000, 0.18);
    board.fillRoundedRect(-324, -166, 648, 338, 22);
    // Honey wood counter
    board.fillStyle(0xfde68a, 1);
    board.fillRoundedRect(-320, -170, 640, 340, 20);
    // Inner bevel & wood grain
    board.fillStyle(0xfef3c7, 0.6);
    board.fillRoundedRect(-312, -162, 624, 324, 16);
    board.lineStyle(1.5, 0xd97706, 0.35);
    board.lineBetween(-290, -80, 290, -80);
    board.lineBetween(-290, 80, 290, 80);
    board.lineStyle(3, 0x331f12, 1);
    board.strokeRoundedRect(-320, -170, 640, 340, 20);

    // Washi-tape corners
    board.fillStyle(0xfb7185, 0.9);
    board.fillRect(-305, -180, 36, 14);
    board.fillStyle(0x6ee7b7, 0.9);
    board.fillRect(269, -180, 36, 14);
    this.container.add(board);

    // Shared, uncharacterized wok spatula prop.
    this.spoonMascot = createWokSpatula(this.scene, -220, 10, 0.9);
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
    memoG.fillRoundedRect(-224, -214, 448, 44, 14);
    memoG.fillStyle(0xfffdf5, 1);
    memoG.fillRoundedRect(-220, -217, 440, 42, 12);
    memoG.lineStyle(2.5, 0x331f12, 1);
    memoG.strokeRoundedRect(-220, -217, 440, 42, 12);
    this.container.add(memoG);

    this.instructionText = this.scene.add.text(0, -196, '🍳 ' + (isMs ? 'KACAU & LAMBUNG KUALI MENGIKUT IRAMA!' : 'STIR & TOSS THE WOK TO THE RHYTHM!'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Gas Burner Flame underneath wok
    this.flameGfx = this.scene.add.graphics();
    this.container.add(this.flameGfx);
    this.drawFlames(1.0);

    // Cast Iron Wok Container (Can shake / tilt on toss)
    this.wokContainer = this.scene.add.container(0, 15);
    this.container.add(this.wokContainer);

    // Shared painted-teal wok with teak handle and brass rim.
    const wokBody = createWok(this.scene, 0, 0, 0.92);
    this.wokContainer.add(wokBody);

    // Ingredients in the wok (Noodles, Veggies, Prawn, Chili)
    this.foodGfx = this.scene.add.graphics();
    this.wokContainer.add(this.foodGfx);
    this.drawWokFood();

    // Flash Burst / Flame effect on toss
    this.burstGfx = this.scene.add.graphics();
    this.container.add(this.burstGfx);

    // Rhythm Ring Target Ring (Fixed at radius 50)
    const targetRing = this.scene.add.graphics();
    targetRing.lineStyle(4, 0x22c55e, 0.9);
    targetRing.strokeCircle(0, 15, 48);
    this.container.add(targetRing);

    // Collapsing Ring
    this.collapseRing = this.scene.add.graphics();
    this.container.add(this.collapseRing);

    // Toss Button
    this.btnToss = this.scene.add.container(0, 125);
    const bBg = this.scene.add.graphics();
    bBg.fillStyle(THEME.secondary, 1);
    bBg.fillRoundedRect(-100, -22, 200, 44, 12);
    bBg.lineStyle(2, THEME.secondaryLight, 0.9);
    bBg.strokeRoundedRect(-100, -22, 200, 44, 12);

    const bTxt = this.scene.add.text(0, 0, isMs ? 'LAMBUNG KUALI! 🥘' : 'TOSS THE WOK! 🥘', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.btnToss.add([bBg, bTxt]);
    setMiniGameInteractive(this.btnToss, 200, 44);
    this.btnToss.on('pointerdown', () => this.handleToss());
    this.container.add(this.btnToss);

    // Also clickable directly on wok
    const wokZone = this.scene.add.zone(0, 15, 200, 200).setInteractive({ cursor: 'pointer' });
    wokZone.on('pointerdown', () => this.handleToss());
    this.container.add(wokZone);

    // Toss Counter
    this.counterText = this.scene.add.text(0, -115, `${isMs ? 'WOK HEI LAMBUNG' : 'WOK TOSSES'}: 0 / ${this.targetTosses}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.counterText);

    // Feedback floating text
    this.feedbackText = this.scene.add.text(0, -145, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);
  }

  drawFlames(intensity = 1.0) {
    this.flameGfx.clear();
    // Small amber burner tongues below the pan, not a giant glowing disc.
    this.flameGfx.fillStyle(0xf97316, 0.72 * intensity);
    [-34, -17, 0, 17, 34].forEach((x, index) => {
      const h = index % 2 ? 15 : 21;
      this.flameGfx.fillTriangle(x - 7, 78, x + 7, 78, x, 78 - h * intensity);
    });
    this.flameGfx.fillStyle(0xfde68a, 0.86 * intensity);
    [-25, -8, 9, 26].forEach((x) => {
      this.flameGfx.fillTriangle(x - 3, 77, x + 3, 77, x, 77 - 9 * intensity);
    });
  }

  drawWokFood(offsetY = 0) {
    this.foodGfx.clear();
    // Glossy mee goreng ribbons, softly edged tofu and sliced aromatics.
    this.foodGfx.lineStyle(7, 0x9a5b05, 0.9);
    for (let i = -38; i <= 38; i += 19) {
      this.foodGfx.lineBetween(i - 12, -24 + offsetY, i + 11, -7 + offsetY);
      this.foodGfx.lineBetween(i + 11, -7 + offsetY, i - 7, 11 + offsetY);
      this.foodGfx.lineBetween(i - 7, 11 + offsetY, i + 12, 28 + offsetY);
    }
    this.foodGfx.lineStyle(2, 0xfde68a, 0.9);
    for (let i = -38; i <= 38; i += 19) {
      this.foodGfx.lineBetween(i - 12, -25 + offsetY, i + 11, -8 + offsetY);
      this.foodGfx.lineBetween(i + 11, -8 + offsetY, i - 7, 10 + offsetY);
    }

    // Golden tofu cubes with warm browned edges.
    [[-43, -8], [20, 7], [31, -27]].forEach(([x, y]) => {
      this.foodGfx.fillStyle(0x92400e, 1).fillRoundedRect(x, y + offsetY, 20, 18, 5);
      this.foodGfx.fillStyle(0xfbbf24, 1).fillRoundedRect(x + 2, y + 2 + offsetY, 16, 11, 4);
      this.foodGfx.fillStyle(0xfff7d1, 0.8).fillRoundedRect(x + 4, y + 3 + offsetY, 8, 3, 2);
    });

    // Chili coins and bright spring onion cuts.
    [[-19, 23], [18, -22]].forEach(([x, y]) => {
      this.foodGfx.fillStyle(0x9f1239, 1).fillEllipse(x, y + offsetY, 16, 14);
      this.foodGfx.fillStyle(0xfb7185, 1).fillEllipse(x - 1, y - 1 + offsetY, 10, 8);
      this.foodGfx.fillStyle(0xfff7d1, 1).fillCircle(x - 1, y - 1 + offsetY, 2);
    });
    this.foodGfx.lineStyle(6, 0x166534, 1);
    this.foodGfx.lineBetween(-23, -29 + offsetY, -8, -17 + offsetY);
    this.foodGfx.lineBetween(3, 25 + offsetY, 19, 14 + offsetY);
    this.foodGfx.lineStyle(3, 0x86efac, 1);
    this.foodGfx.lineBetween(-22, -30 + offsetY, -10, -21 + offsetY);
    this.foodGfx.lineBetween(4, 24 + offsetY, 16, 16 + offsetY);
  }

  handleToss() {
    if (this.isCompleted || this.isTossing) return;

    // Radius at current ringScale
    const currentRadius = 48 * this.ringScale;
    const diff = Math.abs(currentRadius - 48);

    let quality = 'GOOD';
    let pts = 75;
    let textColor = 0xfacc15;

    if (diff < 15) {
      quality = 'PERFECT WOK HEI! 🔥';
      pts = 100;
      textColor = 0x4ade80;
    } else if (diff < 32) {
      quality = 'GREAT TOSS! 👍';
      pts = 80;
      textColor = 0x38bdf8;
    } else {
      quality = 'OKAY! ✨';
      pts = 60;
      textColor = 0xfde047;
    }

    this.currentTosses++;
    this.counterText.setText(`${localizationManager.getLanguage() === 'ms' ? 'WOK HEI LAMBUNG' : 'WOK TOSSES'}: ${this.currentTosses} / ${this.targetTosses}`);
    this.showFeedback(quality, textColor);

    // Toss animation: Wok tilts and ingredients fly upward
    this.isTossing = true;
    audioManager.playChop();

    // Wok tilt tween
    this.scene.tweens.add({
      targets: this.wokContainer,
      angle: -15,
      y: 0,
      duration: 140,
      yoyo: true,
      onComplete: () => {
        this.wokContainer.angle = 0;
        this.wokContainer.y = 15;
        this.isTossing = false;
      }
    });

    // Food fly up
    this.scene.tweens.addCounter({
      from: 0,
      to: -45,
      duration: 160,
      yoyo: true,
      onUpdate: (tw) => {
        this.drawWokFood(tw.getValue());
      }
    });

    // Fire burst at wok rim
    this.drawFlames(1.6);
    this.scene.time.delayedCall(200, () => {
      this.drawFlames(1.0);
    });

    // Reset ring
    this.ringScale = 2.4;

    if (this.currentTosses >= this.targetTosses) {
      this.isCompleted = true;
      const recipeName = cookingManager.currentRecipe ? localizationManager.t(cookingManager.currentRecipe.nameKey) : 'MASAKAN';
      const isMs = localizationManager.getLanguage() === 'ms';
      const doneMsg = isMs ? `${recipeName.toUpperCase()} AROMA SEMPURNA! ⭐⭐⭐` : `${recipeName.toUpperCase()} PERFECT WOK AROMA! ⭐⭐⭐`;
      this.instructionText.setText(doneMsg);
      this.instructionText.setColor('#4ade80');
      this.btnToss.setVisible(false);

      this.showFeedback(isMs ? 'MASAK DENGAN SEMPURNA! 🏆' : 'COOKED TO PERFECTION! 🏆', 0x4ade80);
      try {
        audioManager.playLevelUp();
      } catch (e) {
        console.warn('Audio error:', e);
      }

      this.scene.time.delayedCall(1200, () => {
        try {
          this.destroy();
        } catch (e) {
          console.warn('StirFryGame destroy error:', e);
        }
        this.onComplete(1.0);
      });
    }
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

    // Ring shrinks
    this.ringScale -= this.ringSpeed * dt;
    if (this.ringScale < 0.6) {
      this.ringScale = 2.4; // Loop back
    }

    // Draw collapsing ring
    this.collapseRing.clear();
    const radius = 48 * this.ringScale;
    this.collapseRing.lineStyle(3, 0xfacc15, 0.85);
    this.collapseRing.strokeCircle(0, 15, radius);
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default StirFryGame;
