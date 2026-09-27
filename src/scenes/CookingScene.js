import Phaser from 'phaser';
import cookingManager from '../managers/CookingManager.js';
import gameManager from '../managers/GameManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import questionManager from '../managers/QuestionManager.js';
import recipeManager from '../managers/RecipeManager.js';
import ChopGame from '../minigames/ChopGame.js';
import MeasureGame from '../minigames/MeasureGame.js';
import MixGame from '../minigames/MixGame.js';
import TemperatureGame from '../minigames/TemperatureGame.js';
import TimingGame from '../minigames/TimingGame.js';
import SortingGame from '../minigames/SortingGame.js';
import RouteGame from '../minigames/RouteGame.js';
import DataGame from '../minigames/DataGame.js';
import ProbabilityGame from '../minigames/ProbabilityGame.js';
import CashierGame from '../minigames/CashierGame.js';
import SatayGame from '../minigames/SatayGame.js';
import TehTarikGame from '../minigames/TehTarikGame.js';
import StirFryGame from '../minigames/StirFryGame.js';
import ServeOrderGame from '../minigames/ServeOrderGame.js';
import audioManager from '../managers/AudioManager.js';
import { createButton } from '../ui/buttons.js';
import { THEME } from '../config/constants.js';

export class CookingScene extends Phaser.Scene {
  constructor() {
    super('CookingScene');
    this.activeMiniGame = null;
  }

  create() {
    this.events.on('minigame:restart', this.restartActiveMiniGame, this);
    const missionRecipeId = gameManager.currentMission?.recipeId;
    const needsMissionRecipe = missionRecipeId && cookingManager.currentRecipe?.id !== missionRecipeId;
    const exhaustedRecipe = cookingManager.currentRecipe && cookingManager.isRecipeComplete();
    if (!cookingManager.currentRecipe || needsMissionRecipe || exhaustedRecipe) {
      const recipe = recipeManager.getRecipe(missionRecipeId || 'nasi_lemak');
      if (recipe) cookingManager.startRecipe(recipe);
    }
    this.createKitchenBackground();
    this.createProgressHeader();
    this.createQualityHUD();
    this.executeCurrentStep();
  }

  createKitchenBackground() {
    // Use the same illustrated warung world as the character and dish assets.
    const warung = this.add.image(640, 360, 'bg_warung_morning')
      .setDisplaySize(1280, 720)
      .setDepth(-20);
    warung.setAlpha(0.98);

    const bg = this.add.graphics();
    // 1. Soft teal wash keeps HUD text legible without hiding the painted scene.
    bg.fillStyle(THEME.surfaceTealDark, 0.16);
    bg.fillRect(0, 0, 1280, 720);

    // Keep the illustrated warung visible; avoid a competing checkerboard texture.

    // Decorative Kitchen Shelf on upper wall
    const shelf = this.add.graphics();
    shelf.fillStyle(THEME.surfaceWood, 0.5);
    shelf.fillRect(100, 122, 1080, 14);
    shelf.fillStyle(THEME.surfaceWoodLight, 0.9);
    shelf.fillRect(100, 116, 1080, 12);
    shelf.lineStyle(2, THEME.outlineDark, 0.8);
    shelf.strokeRect(100, 116, 1080, 12);

    // Cute pastel spice jars on shelf
    const jarColors = [THEME.accentRed, THEME.accentBlue, THEME.primaryLight, THEME.secondaryLight, THEME.accentPurple];
    for (let j = 0; j < 5; j++) {
      const jx = 160 + j * 48;
      shelf.fillStyle(jarColors[j], 0.9);
      shelf.fillRoundedRect(jx, 92, 28, 24, 4);
      shelf.fillStyle(THEME.panelLight, 0.9);
      shelf.fillRect(jx + 6, 86, 16, 6);
      shelf.lineStyle(1.5, THEME.outlineDark, 0.8);
      shelf.strokeRoundedRect(jx, 92, 28, 24, 4);
    }

    // Overhead Warm Sunlight
    const spot = this.add.graphics();
    spot.fillStyle(THEME.primaryGlow, 0.1);
    spot.fillTriangle(640, 0, 160, 560, 1120, 560);

    // 2. Honey Pine Wood Cooking Prep Counter with Clean Cocoa Outlines
    const counter = this.add.graphics();
    // Soft shadow below counter ledge
    counter.fillStyle(0x000000, 0.14);
    counter.fillRect(0, 545, 1280, 175);
    // Counter body (warm honey wood)
    counter.fillStyle(THEME.surfaceWood, 0.82);
    counter.fillRect(0, 550, 1280, 170);
    // Wood grain accents
    counter.fillStyle(THEME.surfaceWoodLight, 0.28);
    counter.fillRect(0, 570, 1280, 8);
    counter.fillRect(0, 630, 1280, 8);
    // Counter top ledge (smooth polished butter pine)
    counter.fillStyle(THEME.panelBg, 0.9);
    counter.fillRect(0, 550, 1280, 26);
    // Clean cartoon cocoa border
    counter.lineStyle(3, THEME.outlineDark, 0.9);
    counter.lineBetween(0, 550, 1280, 550);
    counter.lineStyle(1.5, THEME.surfaceWoodLight, 0.7);
    counter.lineBetween(0, 576, 1280, 576);
  }

  createProgressHeader() {
    this.headerContainer = this.add.container(640, 52);

    // Warm Cream Recipe Ticket Banner with Cartoon Cocoa Outline
    const bannerBg = this.add.graphics();
    // Ambient shadow
    bannerBg.fillStyle(0x000000, 0.15);
    bannerBg.fillRoundedRect(-402, -28, 804, 64, 18);
    // 3D lip
    bannerBg.fillStyle(0xd97706, 0.35);
    bannerBg.fillRoundedRect(-400, -29, 800, 62, 16);
    // Warm cream body
    bannerBg.fillStyle(0xfffdf5, 0.98);
    bannerBg.fillRoundedRect(-400, -32, 800, 62, 16);
    // Top specular sheen
    bannerBg.fillStyle(0xffffff, 0.6);
    bannerBg.fillRoundedRect(-396, -30, 792, 18, 12);
    // Clean cartoon cocoa border
    bannerBg.lineStyle(2.5, 0x331f12, 1);
    bannerBg.strokeRoundedRect(-400, -32, 800, 62, 16);
    // Inner delicate honey stroke
    bannerBg.lineStyle(1.5, 0xfcd34d, 0.9);
    bannerBg.strokeRoundedRect(-394, -26, 788, 50, 12);

    // Washi-tape corner stickers
    bannerBg.fillStyle(0xfb7185, 0.85);
    bannerBg.fillRect(-385, -34, 34, 8);
    bannerBg.fillStyle(0x6ee7b7, 0.85);
    bannerBg.fillRect(351, -34, 34, 8);

    this.headerContainer.add(bannerBg);

    this.stepTitle = this.add.text(0, -6, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#331f12',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: 'rgba(255, 255, 255, 0.8)', blur: 1, fill: true }
    }).setOrigin(0.5);
    this.headerContainer.add(this.stepTitle);

    this.stepDots = this.add.container(0, 18);
    this.headerContainer.add(this.stepDots);
  }

  updateProgressDots() {
    this.stepDots.removeAll(true);
    const recipe = cookingManager.currentRecipe;
    if (!recipe) return;

    const totalSteps = recipe.steps.length;
    const dotSpacing = 36;
    const startX = -((totalSteps - 1) * dotSpacing) / 2;

    for (let i = 0; i < totalSteps; i++) {
      const dot = this.add.graphics();
      const dx = startX + i * dotSpacing;

      if (i < cookingManager.currentStepIndex) {
        // Completed: Pandan Mint Emerald with cartoon outline
        dot.fillStyle(0x059669, 1);
        dot.fillCircle(dx, 1.5, 8);
        dot.fillStyle(0x10b981, 1);
        dot.fillCircle(dx, 0, 7.5);
        dot.fillStyle(0xffffff, 0.7);
        dot.fillCircle(dx - 2, -2, 2.5);
        dot.lineStyle(1.5, 0x331f12, 1);
        dot.strokeCircle(dx, 0, 7.5);
      } else if (i === cookingManager.currentStepIndex) {
        // Active: Butter Yellow Glowing with cartoon outline
        dot.fillStyle(0xd97706, 1);
        dot.fillCircle(dx, 2, 9.5);
        dot.fillStyle(0xf59e0b, 1);
        dot.fillCircle(dx, 0, 9);
        dot.fillStyle(0xfef08a, 0.95);
        dot.fillCircle(dx - 2.5, -2.5, 3.5);
        dot.lineStyle(2, 0x331f12, 1);
        dot.strokeCircle(dx, 0, 9);

        this.tweens.add({
          targets: dot,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else {
        // Upcoming: Soft cream pastel dot with cocoa outline
        dot.fillStyle(0xe2e8f0, 1);
        dot.fillCircle(dx, 0, 6.5);
        dot.lineStyle(1.5, 0x94a3b8, 1);
        dot.strokeCircle(dx, 0, 6.5);
      }
      this.stepDots.add(dot);
    }
  }

  createQualityHUD() {
    this.qualityHud = this.add.container(1120, 52).setDepth(900);
    const bg = this.add.graphics();
    bg.fillStyle(0xfffbeb, 0.96);
    bg.fillRoundedRect(-112, -28, 224, 56, 16);
    bg.lineStyle(2, 0x713f12, 1);
    bg.strokeRoundedRect(-112, -28, 224, 56, 16);
    bg.fillStyle(0xe2e8f0, 1);
    bg.fillRoundedRect(-94, 8, 188, 9, 5);
    this.qualityHud.add(bg);

    this.qualityFill = this.add.graphics();
    this.qualityHud.add(this.qualityFill);
    this.qualityText = this.add.text(0, -9, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#713f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.qualityHud.add(this.qualityText);
    this.updateQualityHUD();
  }

  updateQualityHUD() {
    if (!this.qualityFill || !this.qualityText) return;
    const quality = cookingManager.getLiveQuality();
    const percent = Math.round(quality * 100);
    const color = quality >= 0.9 ? 0x10b981 : quality >= 0.7 ? 0xf59e0b : 0xef4444;
    this.qualityFill.clear();
    this.qualityFill.fillStyle(color, 1);
    this.qualityFill.fillRoundedRect(-94, 8, 188 * quality, 9, 5);
    this.qualityText.setText(localizationManager.t('cooking.liveQuality', { percent }));
  }

  showStepImpact(type, accuracy, onComplete) {
    this.updateQualityHUD();
    const isPerfect = accuracy >= 0.95;
    const isStrong = accuracy >= 0.8;
    const isMiss = accuracy <= 0.4;
    const labelKey = type === 'math'
      ? (isPerfect ? 'cooking.mathImpactPerfect' : isMiss ? 'cooking.mathImpactMiss' : isStrong ? 'cooking.mathImpactGood' : 'cooking.mathImpactBad')
      : (isPerfect ? 'cooking.skillImpactPerfect' : isMiss ? 'cooking.skillImpactMiss' : isStrong ? 'cooking.skillImpactGood' : 'cooking.skillImpactBad');
    const combo = gameManager.comboStreak || 0;
    const comboLabel = combo >= 2 ? `  •  ${localizationManager.t('cooking.comboLabel', { count: combo })}` : '';
    const toast = this.add.container(640, 620).setDepth(950);
    const bg = this.add.graphics();
    bg.fillStyle(isStrong ? 0x065f46 : isMiss ? 0x7f1d1d : 0x92400e, 0.96);
    bg.fillRoundedRect(-285, -30, 570, 60, 18);
    bg.lineStyle(2, isStrong ? 0x6ee7b7 : isMiss ? 0xfca5a5 : 0xfcd34d, 1);
    bg.strokeRoundedRect(-285, -30, 570, 60, 18);
    toast.add(bg);
    toast.add(this.add.text(0, 0, localizationManager.t(labelKey) + comboLabel, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5));
    toast.setAlpha(0).setScale(0.92);
    if (combo >= 2 && type === 'skill') {
      // Give a readable, celebratory payoff for consecutive strong mini-game
      // results without changing the existing scoring rules.
      const comboCopy = combo >= 3
        ? `🔥 ${localizationManager.t('cooking.comboStreak', { count: combo })}`
        : `✨ ${localizationManager.t('cooking.comboNice')}`;
      const comboBadge = this.add.text(0, -48, comboCopy, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#fff2a8',
        stroke: '#064e3b',
        strokeThickness: 4,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      toast.add(comboBadge);
      this.tweens.add({
        targets: comboBadge,
        scaleX: { from: 0.7, to: 1.08 },
        scaleY: { from: 0.7, to: 1.08 },
        y: -56,
        duration: 360,
        yoyo: true,
        ease: 'Back.easeOut'
      });
      if (combo % 3 === 0) {
        try { audioManager.playLevelUp(); } catch (e) {}
      }
    }
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      if (onComplete) onComplete();
    };
    // Safety fallback: a tween can be interrupted when a scene is brought to top.
    this.time.delayedCall(1250, advance);
    this.tweens.add({
      targets: toast,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: 600,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(650, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: 575,
            duration: 220,
            onComplete: () => {
              toast.destroy();
              advance();
            }
          });
        });
      }
    });
  }

  executeCurrentStep() {
    this.isMiniGamePaused = false;
    this.updateProgressDots();

    // Clean up any lingering minigame graphics
    if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') {
      try {
        this.activeMiniGame.destroy();
      } catch (e) {
        console.warn('Active minigame cleanup error:', e);
      }
      this.activeMiniGame = null;
    }

    if (cookingManager.isRecipeComplete()) {
      this.showCompletedDishAndServe();
      return;
    }

    const step = cookingManager.getCurrentStep();
    if (!step) return;

    const stepNum = cookingManager.currentStepIndex + 1;
    const stepKey = `cooking.step${stepNum}`;
    this.stepTitle.setText(localizationManager.t(stepKey));

    if (step.type === 'math') {
      const difficulty = cookingManager.difficulty || 'medium';
      const chapter = step.chapter || (step.questionId ? parseInt(step.questionId.split('-')[1]?.replace('C', ''), 10) : 1) || 1;

      if (!step.questionId && !questionManager.hasMoreQuestions({ chapter, difficulty, includeProcedural: true })) {
        this.showCompletedDishAndServe();
        return;
      }

      if (this.scene.isActive('MathChallengeScene')) {
        this.scene.stop('MathChallengeScene');
      }

      this.scene.launch('MathChallengeScene', {
        questionId: step.questionId,
        chapter: chapter,
        difficulty: difficulty,
        onBankExhausted: () => {
          if (this.scene.isActive('MathChallengeScene')) {
            this.scene.stop('MathChallengeScene');
          }
          if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') {
            try { this.activeMiniGame.destroy(); } catch (e) {}
            this.activeMiniGame = null;
          }
          this.showCompletedDishAndServe();
        },
        onComplete: (accuracy) => {
          cookingManager.recordMathScore(accuracy);
          if (this.scene.isActive('MathChallengeScene')) {
            this.scene.stop('MathChallengeScene');
          }
          cookingManager.nextStep();
          this.showStepImpact('math', accuracy, () => this.executeCurrentStep());
        }
      });
      this.scene.bringToTop('MathChallengeScene');
    } else if (step.type === 'minigame') {
      const onDone = (accuracy) => {
        cookingManager.recordCookingScore(accuracy);
        if (accuracy >= 0.9) {
          gameManager.comboStreak = (gameManager.comboStreak || 0) + 1;
        } else {
          gameManager.comboStreak = 0;
        }
        if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') {
          try {
            this.activeMiniGame.destroy();
          } catch (e) {
            console.warn('MiniGame destroy error in onDone:', e);
          }
        }
        this.activeMiniGame = null;
        this.activeMiniGameRestart = null;
        this.isMiniGamePaused = false;
        cookingManager.nextStep();
        this.showStepImpact('skill', accuracy, () => this.executeCurrentStep());
      };

      try {
        this.activeMiniGameRestart = () => {
          if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') this.activeMiniGame.destroy();
          this.isMiniGamePaused = false;
          this.activeMiniGame = this.createMiniGameForStep(step, onDone);
        };
        this.activeMiniGame = this.createMiniGameForStep(step, onDone);
      } catch (err) {
        console.error('MiniGame launch error:', err);
        onDone(1.0);
      }
    }
  }

  restartActiveMiniGame() {
    if (typeof this.activeMiniGameRestart === 'function') this.activeMiniGameRestart();
  }

  createMiniGameForStep(step, onDone) {
    const common = { onComplete: onDone };
    switch (step.game) {
      case 'chop': return new ChopGame(this, { ...common, target: step.target || 4 });
      case 'measure': return new MeasureGame(this, { ...common, target: step.target || 150 });
      case 'mix': return new MixGame(this, { ...common, ratio1: step.ratio1 || 3, ratio2: step.ratio2 || 2 });
      case 'temperature': return new TemperatureGame(this, { ...common, targetMin: 160, targetMax: 200 });
      case 'timing': return new TimingGame(this, { ...common, targetCycles: step.targetCycles || 3 });
      case 'sort': return new SortingGame(this, common);
      case 'route': return new RouteGame(this, common);
      case 'data': return new DataGame(this, common);
      case 'probability': return new ProbabilityGame(this, common);
      case 'cashier': return new CashierGame(this, { ...common, total: step.total || 12, paid: step.paid || 20 });
      case 'serve_order':
      case 'serveOrder': return new ServeOrderGame(this, {
        ...common,
        recipe: this.cookingManager?.currentRecipe || cookingManager.currentRecipe,
        customer: cookingManager.currentCustomer
      });
      case 'satay': return new SatayGame(this, common);
      case 'tehtarik':
      case 'teh_tarik': return new TehTarikGame(this, common);
      case 'stirfry':
      case 'stir_fry': return new StirFryGame(this, common);
      default: return null;
    }
  }

  showCompletedDishAndServe() {
    cookingManager.lastServedCustomer = cookingManager.currentCustomer;
    try { audioManager.playLevelUp(); } catch (e) {}

    const isMs = localizationManager.getLanguage() === 'ms';
    const currentCust = cookingManager.currentCustomer;
    const custName = currentCust ? currentCust.name : (isMs ? 'Pelanggan' : 'Customer');

    const texMap = {
      'nasi_lemak': 'dish_nasi_lemak',
      'roti_canai': 'dish_roti_canai',
      'mee_goreng': 'dish_mee_goreng',
      'teh_tarik': 'dish_teh_tarik',
      'satay_ayam': 'dish_satay'
    };
    const recId = cookingManager.currentRecipe?.id || 'nasi_lemak';
    const dishTex = texMap[recId] || 'dish_nasi_lemak';
    const performance = cookingManager.getPerformanceMetrics();
    const finishTitle = performance.stars >= 3
      ? (isMs ? 'HIDANGAN BERTARAF BINTANG!' : 'A STAR-WORTHY DISH!')
      : performance.stars === 2
        ? (isMs ? 'HIDANGAN SEDAP SUDAH SIAP!' : 'A TASTY DISH IS READY!')
        : (isMs ? 'HIDANGAN SIAP — TERUS BERLATIH!' : 'DISH READY — KEEP IMPROVING!');

    // Celebration presentation overlay
    const overlay = this.add.container(640, 360);

    // Dim background
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.65);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.add(dim);

    // Cute recipe card panel
    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.25);
    card.fillRoundedRect(-340, -220, 680, 440, 24);
    card.fillStyle(0xfffdf5, 1);
    card.fillRoundedRect(-340, -225, 680, 440, 22);
    card.lineStyle(2, 0xfcd34d, 1);
    card.strokeRoundedRect(-334, -219, 668, 428, 18);
    card.lineStyle(3.5, 0x331f12, 1);
    card.strokeRoundedRect(-340, -225, 680, 440, 22);

    // Washi-tape corners
    card.fillStyle(0xfb7185, 1);
    card.fillRect(-320, -232, 45, 14);
    card.fillStyle(0x34d399, 1);
    card.fillRect(275, -232, 45, 14);
    overlay.add(card);

    // Title Banner
    const bannerTitle = this.add.text(0, -170, `✨ ${finishTitle} ✨`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    overlay.add(bannerTitle);

    // Platter pedestal
    const plinth = this.add.graphics();
    plinth.fillStyle(0xd97706, 0.25);
    plinth.fillEllipse(0, 15, 230, 40);
    overlay.add(plinth);

    // Plated Dish image
    const dishImg = this.add.image(0, -28, dishTex).setScale(0.72);
    overlay.add(dishImg);

    // Bouncing celebratory tween
    this.tweens.add({
      targets: dishImg,
      y: -38,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating sparkles around the dish
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spx = Math.cos(angle) * 135;
      const spy = Math.sin(angle) * 80 - 30;
      const star = this.add.image(spx, spy, 'icon_star').setScale(0.45);
      overlay.add(star);
      this.tweens.add({
        targets: star,
        scaleX: 0.65,
        scaleY: 0.65,
        alpha: 0.4,
        duration: 600 + i * 100,
        yoyo: true,
        repeat: -1
      });
    }

    // Customer waiting note
    const waitBg = this.add.graphics();
    waitBg.fillStyle(THEME.surfaceTealDark, 0.96);
    waitBg.fillRoundedRect(-285, 82, 570, 40, 14);
    waitBg.lineStyle(2, THEME.accentGold, 0.9);
    waitBg.strokeRoundedRect(-285, 82, 570, 40, 14);
    overlay.add(waitBg);
    const waitText = this.add.text(0, 102, `🍽️ ${custName} ` + (isMs ? 'sedang menanti di kaunter warung! 🤤' : 'is waiting eagerly at the counter! 🤤'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#fff8e7',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    overlay.add(waitText);

    // Big Playful "🍽️ HIDANG KEPADA PELANGGAN!" Button
    const btnText = '🍽️ ' + (isMs ? `HIDANG KEPADA ${custName.toUpperCase()}!` : `SERVE TO ${custName.toUpperCase()}!`);
    const btnServe = createButton(this, 0, 166, btnText, {
      width: 400,
      height: 56,
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      fontSize: '18px',
      onClick: () => {
        try { audioManager.playCoin(); } catch (e) {}
        this.scene.start('ResultScene');
      }
    });
    overlay.add(btnServe.container);

    this.tweens.add({
      targets: btnServe.container,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    if (!this.isMiniGamePaused && this.activeMiniGame && typeof this.activeMiniGame.update === 'function') {
      this.activeMiniGame.update(time, delta);
    }
  }
}

export default CookingScene;
