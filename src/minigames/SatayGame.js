import Phaser from 'phaser';
import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell } from '../ui/miniGameShell.js';

export class SatayGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    // Charcoal heat (0 to 100) - comfortable initial heat and gentle decay
    this.heat = 75;
    this.heatDecayRate = 6; // gentle decay of 6% per sec (previously 12%)

    // 4 Skewers
    this.skewers = [
      { x: -150, side: 1, doneness1: 0, doneness2: 0, flipped: false, done: false },
      { x: -50, side: 1, doneness1: 0, doneness2: 0, flipped: false, done: false },
      { x: 50, side: 1, doneness1: 0, doneness2: 0, flipped: false, done: false },
      { x: 150, side: 1, doneness1: 0, doneness2: 0, flipped: false, done: false }
    ];

    this.sparks = [];

    const cx = this.scene.cameras.main.width / 2;
    const cy = this.scene.cameras.main.height > this.scene.cameras.main.width ? 560 : 380;
    this.container = this.scene.add.container(cx, cy);

    // Spacebar keyboard support to fan coals
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (this.spaceKey) {
      this.spaceKey.on('down', () => this.handleFan());
    }

    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'GRILL THE SATAY', 'Tap the skewers when they reach the flame zone');
    const isMs = localizationManager.getLanguage() === 'ms';

    // 1. Cute Pastel Wooden Prep Board / Tabletop
    const board = this.scene.add.graphics();
    // Drop shadow
    board.fillStyle(0x000000, 0.18);
    board.fillRoundedRect(-338, -186, 676, 372, 22);
    // Warm cream body
    board.fillStyle(0xfffdf5, 1);
    board.fillRoundedRect(-340, -190, 680, 370, 20);
    // Inner butter sheen
    board.lineStyle(2, 0xfcd34d, 1);
    board.strokeRoundedRect(-334, -184, 668, 358, 16);
    // Dark cocoa cartoon outline
    board.lineStyle(3.5, 0x331f12, 1);
    board.strokeRoundedRect(-340, -190, 680, 370, 20);

    // Washi-tape corners
    board.fillStyle(0xfb7185, 1);
    board.fillRect(-325, -196, 42, 12);
    board.fillStyle(0x34d399, 1);
    board.fillRect(283, -196, 42, 12);
    this.container.add(board);

    // Top Header & Clear Tutorial Instruction
    const stepGuide = isMs
      ? '🔥 1. Kipas Arang ke Zon Hijau  ➔  ↻ 2. Tekan "FLIP!" Bila Butang Kuning Keluar!'
      : '🔥 1. Fan Coals to Green Zone  ➔  ↻ 2. Tap "FLIP!" When Yellow Button Appears!';

    this.instructionText = this.scene.add.text(0, -162, stepGuide, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#331f12',
      backgroundColor: '#fef08a',
      padding: { x: 14, y: 5 },
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // 2. Satay Grill Frame (Charcoal trough)
    const grillFrame = this.scene.add.graphics();
    grillFrame.fillStyle(THEME.surfaceTeal, 1);
    grillFrame.fillRoundedRect(-240, -78, 480, 156, 12);
    grillFrame.lineStyle(3, 0x1e293b, 1);
    grillFrame.strokeRoundedRect(-240, -78, 480, 156, 12);
    this.container.add(grillFrame);

    if (this.scene.textures.exists('utensil_satay_grill')) {
      const satayProp = this.scene.add.image(278, -78, 'utensil_satay_grill').setScale(0.34);
      this.container.add(satayProp);
    }

    // 3. Glowing Charcoal Layer (Dynamic)
    this.charcoalGfx = this.scene.add.graphics();
    this.container.add(this.charcoalGfx);

    // 4. Metal Grate Bars
    const grate = this.scene.add.graphics();
    grate.lineStyle(2, 0x94a3b8, 0.7);
    for (let gx = -220; gx <= 220; gx += 25) {
      grate.lineBetween(gx, -72, gx, 72);
    }
    grate.lineBetween(-230, -38, 230, -38);
    grate.lineBetween(-230, 38, 230, 38);
    this.container.add(grate);

    // 5. Skewers Container
    this.skewersContainer = this.scene.add.container(0, 0);
    this.container.add(this.skewersContainer);

    this.skewerGraphics = [];
    this.flipBadges = [];
    this.skewerStatusLabels = [];

    this.skewers.forEach((s, idx) => {
      const sg = this.scene.add.graphics();
      this.skewersContainer.add(sg);
      this.skewerGraphics.push(sg);

      // Status label beneath skewer: doneness indicator at y = 86
      const statusLbl = this.scene.add.text(s.x, 86, `${isMs ? 'Bakar' : 'Grill'} 1: 0%`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        color: '#78350f',
        backgroundColor: '#fef3c7',
        padding: { x: 4, y: 2 },
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.container.add(statusLbl);
      this.skewerStatusLabels.push(statusLbl);

      // Interactive FLIP button container
      const badge = this.scene.add.container(s.x, -100);
      const bBg = this.scene.add.graphics();
      // Drop shadow
      bBg.fillStyle(0x000000, 0.25);
      bBg.fillRoundedRect(-38, -13, 76, 30, 10);
      // Bright yellow candy body
      bBg.fillStyle(0xfacc15, 1);
      bBg.fillRoundedRect(-38, -15, 76, 30, 9);
      // Top gloss highlight
      bBg.fillStyle(0xffffff, 0.45);
      bBg.fillRoundedRect(-36, -14, 72, 10, 6);
      // Cocoa border
      bBg.lineStyle(2.5, 0x331f12, 1);
      bBg.strokeRoundedRect(-38, -15, 76, 30, 9);

      const bTxt = this.scene.add.text(0, 0, 'FLIP! ↻', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#331f12',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      badge.add([bBg, bTxt]);
      badge.setSize(76, 32);
      badge.setInteractive(new Phaser.Geom.Rectangle(-38, -16, 76, 32), Phaser.Geom.Rectangle.Contains, { cursor: 'pointer' });
      badge.on('pointerdown', () => this.flipSkewer(idx));
      badge.on('pointerover', () => badge.setScale(1.1));
      badge.on('pointerout', () => badge.setScale(1.0));
      badge.setVisible(false);

      this.container.add(badge);
      this.flipBadges.push(badge);

      // Dedicated interactive zone for each skewer (covers skewer without overlapping lower buttons)
      const hitZone = this.scene.add.zone(s.x, -15, 84, 185).setInteractive({ cursor: 'pointer' });
      hitZone.on('pointerdown', () => this.flipSkewer(idx));
      this.container.add(hitZone);
    });

    // 6. Heat Gauge (Left side)
    const gaugeBg = this.scene.add.graphics();
    gaugeBg.fillStyle(THEME.surfaceTealDark, 0.95);
    gaugeBg.fillRoundedRect(-315, -75, 48, 150, 10);
    gaugeBg.lineStyle(2, 0x331f12, 1);
    gaugeBg.strokeRoundedRect(-315, -75, 48, 150, 10);

    // Sweet spot target zone (50% to 90% heat)
    gaugeBg.fillStyle(0x22c55e, 0.45);
    gaugeBg.fillRect(-313, -75 + 150 * 0.10, 44, 150 * 0.40);
    gaugeBg.lineStyle(1.5, 0x22c55e, 0.9);
    gaugeBg.strokeRect(-313, -75 + 150 * 0.10, 44, 150 * 0.40);
    this.container.add(gaugeBg);

    this.heatBar = this.scene.add.graphics();
    this.container.add(this.heatBar);

    const heatLabel = this.scene.add.text(-291, 88, isMs ? 'API 🔥' : 'HEAT 🔥', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#d97706',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(heatLabel);

    // Target sweet spot badge
    const targetBadge = this.scene.add.text(-291, -75 + 150 * 0.30, 'OPTIMUM\n🎯', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '8px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(targetBadge);

    // Status readout cleanly positioned below skewer labels (y = 114)
    this.statusText = this.scene.add.text(0, 114, isMs ? 'Kipas untuk panaskan arang! Satay akan masak pantas bila api di zon hijau.' : 'Fan coals to heat up! Satay cooks fast in green zone.', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.statusText);

    // 7. Fan Button ("KIPAS ARANG 🪭") at y = 150
    this.btnFan = this.scene.add.container(0, 150);
    const fBg = this.scene.add.graphics();
    // Drop shadow
    fBg.fillStyle(0x000000, 0.2);
    fBg.fillRoundedRect(-115, -22, 230, 48, 14);
    // Vibrant Orange-Coral Button
    fBg.fillStyle(THEME.secondary, 1);
    fBg.fillRoundedRect(-115, -24, 230, 48, 14);
    fBg.fillStyle(0xfed7aa, 0.4);
    fBg.fillRoundedRect(-113, -22, 226, 16, 8);
    fBg.lineStyle(2.5, 0x331f12, 1);
    fBg.strokeRoundedRect(-115, -24, 230, 48, 14);

    const fTxt = this.scene.add.text(0, 0, isMs ? '🪭 KIPAS ARANG! 🔥' : '🪭 FAN COALS! 🔥', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#7c2d12',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.btnFan.add([fBg, fTxt]);
    this.btnFan.setSize(230, 48);
    this.btnFan.setInteractive(new Phaser.Geom.Rectangle(-115, -24, 230, 48), Phaser.Geom.Rectangle.Contains, { cursor: 'pointer' });
    this.btnFan.on('pointerdown', () => this.handleFan());
    this.container.add(this.btnFan);

    // Feedback floating text
    this.feedbackText = this.scene.add.text(0, -145, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    this.drawCharcoal();
    this.drawAllSkewers();
    this.updateHeatBar();
  }

  drawCharcoal() {
    this.charcoalGfx.clear();
    const glowAlpha = Math.min(1, Math.max(0.2, this.heat / 100));
    this.charcoalGfx.fillStyle(0xd97706, glowAlpha * 0.4);
    this.charcoalGfx.fillRoundedRect(-230, -70, 460, 140, 10);

    // Hot coal chunks
    const colors = [0xef4444, 0xf97316, 0xf59e0b];
    for (let i = -200; i <= 200; i += 30) {
      const col = colors[Math.abs(i) % 3];
      this.charcoalGfx.fillStyle(col, glowAlpha);
      this.charcoalGfx.fillCircle(i, (i % 40) - 10, 12);
    }
  }

  drawAllSkewers() {
    this.skewers.forEach((s, idx) => {
      const sg = this.skewerGraphics[idx];
      sg.clear();

      // Bamboo shaft with a toasted edge and a pale grain highlight.
      sg.lineStyle(8, 0x8b5a2b, 1);
      sg.lineBetween(s.x, -76, s.x, 84);
      sg.lineStyle(4, 0xd6a15f, 1);
      sg.lineBetween(s.x - 1, -72, s.x - 1, 78);
      sg.fillStyle(0xf2d39b, 1);
      sg.fillTriangle(s.x - 4, -75, s.x + 4, -75, s.x, -84);

      // 4 chicken meat chunks
      const curDoneness = s.side === 1 ? s.doneness1 : s.doneness2;
      const progress = curDoneness / 100;

      // Color shifts from raw pale yellow to golden-brown to deep glaze
      let meatColor = 0xfde047;
      if (progress > 0.75) {
        meatColor = 0x9a3412;
      } else if (progress > 0.4) {
        meatColor = 0xd97706;
      }

      for (let m = -50; m <= 35; m += 28) {
        sg.fillStyle(0x78350f, 0.32);
        sg.fillEllipse(s.x + 2, m + 12, 34, 15);
        sg.fillStyle(meatColor, 1);
        sg.fillRoundedRect(s.x - 15, m, 30, 22, 9);
        sg.fillStyle(progress > 0.4 ? 0xfbbf24 : 0xfef3c7, 0.82);
        sg.fillRoundedRect(s.x - 10, m + 3, 19, 5, 3);
        // Grilled marks
        if (progress > 0.3) {
          sg.lineStyle(2.5, 0x451a03, Math.min(1, progress));
          sg.lineBetween(s.x - 8, m + 8, s.x + 8, m + 14);
          sg.lineBetween(s.x - 8, m + 14, s.x + 8, m + 19);
        }
      }

      // If done with both sides, draw green check
      if (s.done) {
        sg.fillStyle(0x22c55e, 1);
        sg.fillCircle(s.x, -65, 8);
      }
    });
  }

  updateHeatBar() {
    this.heatBar.clear();
    const barH = 146 * (this.heat / 100);
    const barY = 73 - barH;

    let barColor = 0x38bdf8;
    if (this.heat >= 50 && this.heat <= 90) {
      barColor = 0x22c55e; // Optimal Green
    } else if (this.heat > 90) {
      barColor = 0xef4444; // Too hot
    }

    this.heatBar.fillStyle(barColor, 1);
    this.heatBar.fillRoundedRect(-303, barY, 41, barH, 4);
  }

  handleFan() {
    if (this.isCompleted) return;

    // Responsive +22 heat boost
    this.heat = Math.min(100, this.heat + 22);
    this.drawCharcoal();
    this.updateHeatBar();

    // Kill any previous tweens to ensure crisp responsiveness without scale drift
    this.scene.tweens.killTweensOf(this.btnFan);
    this.btnFan.setScale(1);
    this.scene.tweens.add({
      targets: this.btnFan,
      scaleX: 1.08,
      scaleY: 0.94,
      duration: 70,
      yoyo: true
    });

    audioManager.playChop();
  }

  flipSkewer(idx) {
    if (this.isCompleted) return;
    const s = this.skewers[idx];
    const isMs = localizationManager.getLanguage() === 'ms';

    if (s.side === 1) {
      if (s.doneness1 >= 60) {
        s.side = 2;
        s.flipped = true;
        this.flipBadges[idx].setVisible(false);

        // Flip animation
        const sg = this.skewerGraphics[idx];
        this.scene.tweens.add({
          targets: sg,
          scaleX: 0.1,
          duration: 120,
          yoyo: true,
          onYoyo: () => {
            this.drawAllSkewers();
          }
        });

        this.showFeedback(isMs ? 'DIBALIKKAN! SEBELAH 2 MEMBAKAR ↻' : 'FLIPPED! GRILLING SIDE 2 ↻', 0xfacc15);
        try { audioManager.playChop(); } catch (e) {}
      } else {
        this.showFeedback(isMs ? 'Belum masak! Kipas arang dulu 🔥' : 'Not cooked yet! Fan coals 🔥', 0xf59e0b);
      }
    } else {
      if (s.done) {
        this.showFeedback(isMs ? 'Satay ini sudah masak! ⭐' : 'This skewer is done! ⭐', 0x22c55e);
      } else {
        this.showFeedback(isMs ? 'Sedang bakar sebelah kedua... ⏳' : 'Grilling second side... ⏳', 0x38bdf8);
      }
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
    const isMs = localizationManager.getLanguage() === 'ms';

    // Heat decay
    this.heat = Math.max(10, this.heat - this.heatDecayRate * dt);
    this.updateHeatBar();

    // Cooking speed based on heat - never freezes at 0
    let cookRate = 0;
    if (this.heat >= 50 && this.heat <= 90) {
      cookRate = 28; // Sweet spot: fast and smooth
      this.statusText.setText(isMs ? '✅ Api sempurna (Zon Hijau)! Satay sedang masak pantas!' : '✅ Perfect heat (Green Zone)! Satay cooking fast!');
      this.statusText.setColor('#059669');
    } else if (this.heat > 25) {
      cookRate = 16; // Steady cooking
      this.statusText.setText(isMs ? '💨 Arang mula suam! Tekan KIPAS ARANG untuk naikkan api!' : '💨 Charcoal getting warm! Tap FAN COALS to raise heat!');
      this.statusText.setColor('#0284c7');
    } else {
      cookRate = 10; // Residual ember warmth, never stuck
      this.statusText.setText(isMs ? '❄️ Arang sejuk! Kipas sekarang!' : '❄️ Coals cooling down! Fan now!');
      this.statusText.setColor('#dc2626');
    }

    // Dynamic guide text when all skewers are flipped to side 2
    const allFlipped = this.skewers.every(s => s.flipped || s.side === 2);
    if (allFlipped && !this.isCompleted) {
      const finishGuide = isMs
        ? '🔥 Sebelah 1 selesai! Kipas arang untuk selesaikan membakar Sebelah 2! ⭐'
        : '🔥 Side 1 done! Fan coals to finish grilling Side 2! ⭐';
      if (this.instructionText.text !== finishGuide) {
        this.instructionText.setText(finishGuide);
        this.instructionText.setBackgroundColor('#dcfce7');
      }
    }

    let allFinished = true;

    this.skewers.forEach((s, idx) => {
      const lbl = this.skewerStatusLabels[idx];
      if (lbl) {
        if (s.done) {
          lbl.setText(isMs ? 'MASAK! ⭐' : 'DONE! ⭐');
          lbl.setColor('#059669');
          lbl.setBackgroundColor('#dcfce7');
        } else if (s.side === 2) {
          lbl.setText(`${isMs ? 'Bakar' : 'Grill'} 2: ${Math.round(s.doneness2)}%`);
          lbl.setColor('#b45309');
          lbl.setBackgroundColor('#fef3c7');
        } else if (s.doneness1 >= 60) {
          lbl.setText(isMs ? 'TEKAN FLIP! ↻' : 'TAP FLIP! ↻');
          lbl.setColor('#dc2626');
          lbl.setBackgroundColor('#fee2e2');
        } else {
          lbl.setText(`${isMs ? 'Bakar' : 'Grill'} 1: ${Math.round(s.doneness1)}%`);
          lbl.setColor('#78350f');
          lbl.setBackgroundColor('#fef3c7');
        }
      }

      if (s.side === 1) {
        if (s.doneness1 < 100) {
          s.doneness1 = Math.min(100, s.doneness1 + cookRate * dt);
          allFinished = false;
        }
        if (s.doneness1 >= 60 && !s.flipped) {
          if (!this.flipBadges[idx].visible) {
            this.flipBadges[idx].setVisible(true);
            this.scene.tweens.add({
              targets: this.flipBadges[idx],
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 350,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }
      } else {
        if (s.doneness2 < 100) {
          s.doneness2 = Math.min(100, s.doneness2 + cookRate * dt);
          allFinished = false;
        } else {
          s.done = true;
        }
      }
      if (!s.done) allFinished = false;
    });

    this.drawAllSkewers();

    if (allFinished && !this.isCompleted) {
      this.isCompleted = true;
      this.statusText.setText(isMs ? 'SATAY TELAH MASAK DENGAN SEMPURNA! ⭐⭐⭐' : 'SATAY PERFECTLY GRILLED! ⭐⭐⭐');
      this.statusText.setColor('#4ade80');
      this.btnFan.setVisible(false);

      this.showFeedback(isMs ? 'AROMA KAJANG SEMPURNA! 🔥' : 'PERFECT SATAY AROMA! 🔥', 0x4ade80);
      try {
        audioManager.playLevelUp();
      } catch (e) {
        console.warn('Audio error:', e);
      }

      this.scene.time.delayedCall(1200, () => {
        try {
          this.destroy();
        } catch (e) {
          console.warn('SatayGame destroy error:', e);
        }
        this.onComplete(1.0);
      });
    }
  }

  destroy() {
    if (this.spaceKey) {
      this.spaceKey.removeAllListeners();
      this.spaceKey = null;
    }
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default SatayGame;
