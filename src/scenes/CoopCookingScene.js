import Phaser from 'phaser';
import cookingManager from '../managers/CookingManager.js';
import multiplayerManager, { ROLES, MULTIPLAYER_MODES, ROOM_STATUS } from '../managers/MultiplayerManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import audioManager from '../managers/AudioManager.js';
import gameManager from '../managers/GameManager.js';
import recipeManager from '../managers/RecipeManager.js';
import questionManager from '../managers/QuestionManager.js';
import ChopGame from '../minigames/ChopGame.js';
import MeasureGame from '../minigames/MeasureGame.js';
import MixGame from '../minigames/MixGame.js';
import TemperatureGame from '../minigames/TemperatureGame.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

export class CoopCookingScene extends Phaser.Scene {
  constructor() {
    super('CoopCookingScene');
    this.activeMiniGame = null;
    this.isStationLocked = false;
    this.currentLocalRole = ROLES.CHEF.id;
  }

  isPortrait() {
    return this.cameras.main.height > this.cameras.main.width;
  }

  create() {
    this.events.on('minigame:restart', this.restartActiveMiniGame, this);
    questionManager.resetSession();
    const localPlayer = multiplayerManager.getLocalPlayer();
    this.currentLocalRole = localPlayer ? localPlayer.role : ROLES.CHEF.id;

    // 1. Initialize mission & recipe properly so currentRecipe is never null on client phones!
    const missionId = multiplayerManager.room?.missionId || 'M01-01';
    gameManager.init();
    try {
      gameManager.startMission(missionId);
    } catch (e) {
      const recipe = recipeManager.getRecipe('nasi_lemak');
      if (recipe) cookingManager.startRecipe(recipe);
    }

    this.createKitchenBackground();
    this.createTopHUD();
    this.createLockBanner();
    this.executeCoopStep();

    // Listen for peer updates (math unlocks, step advancements, and session completion)
    this.unsubscribeMP = multiplayerManager.onStateChange((room) => {
      if (!room) return;
      if (room.status === ROOM_STATUS.RESULT) {
        this.showCoopResult(room.resultMetrics);
        return;
      }
      if (this.isStationLocked && multiplayerManager.isStepUnlocked(cookingManager.currentStepIndex)) {
        this.unlockStation();
      }
      const latestStep = room.unlockedSteps ? Math.max(...room.unlockedSteps) : 0;
      if (cookingManager.currentStepIndex < latestStep) {
        cookingManager.currentStepIndex = latestStep;
        this.executeCoopStep();
      }
    });
  }

  shutdown() {
    if (this.unsubscribeMP) {
      this.unsubscribeMP();
      this.unsubscribeMP = null;
    }
  }

  createKitchenBackground() {
    const isPort = this.isPortrait();
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x334155, 0x334155, 0x1e293b, 0x1e293b, 1);
    bg.fillRect(0, 0, w, h);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x475569, 0.4);
    for (let x = 0; x < w; x += 64) grid.lineBetween(x, 0, x, h);
    for (let y = 0; y < h; y += 64) grid.lineBetween(0, y, w, y);

    const counterY = isPort ? 920 : 560;
    const counterH = isPort ? (h - 920) : 160;

    const counter = this.add.graphics();
    counter.fillStyle(0x475569, 1);
    counter.fillRect(0, counterY, w, counterH);
    counter.fillStyle(0x64748b, 1);
    counter.fillRect(0, counterY, w, 18);
  }

  createTopHUD() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const isObservant = (this.currentLocalRole === ROLES.OBSERVANT.id);

    if (isPort) {
      this.topHUD = this.add.container(cx, 60);

      const banner = this.add.graphics();
      banner.fillStyle(0x0f172a, 0.95);
      banner.fillRoundedRect(-330, -38, 660, 76, 16);
      banner.lineStyle(2, 0x38bdf8, 0.85);
      banner.strokeRoundedRect(-330, -38, 660, 76, 16);
      this.topHUD.add(banner);

      const hudLabel = isObservant
        ? '👁️ MOD PEMERHATI • LIVE MONITORING'
        : (this.currentLocalRole === ROLES.CHEF.id ? '👨‍🍳 CHEF EKSEKUTIF' : '📐 PAKAR MATEMATIK');

      this.modeText = this.add.text(0, -14, hudLabel, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: isObservant ? '#c084fc' : (this.currentLocalRole === ROLES.CHEF.id ? '#38bdf8' : '#facc15'),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.topHUD.add(this.modeText);

      this.stepTitle = this.add.text(isObservant ? -70 : 0, 16, 'LANGKAH 1 / STEP 1', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.topHUD.add(this.stepTitle);

      const isHost = multiplayerManager.isHost() || isObservant;
      if (isHost) {
        const btnEnd = createButton(this, 255, 0, '🛑 END', {
          width: 90,
          height: 38,
          fontSize: '13px',
          bgColor: 0xd97706,
          bgDarkColor: 0xb45309,
          onClick: () => {
            const confirmMsg = localizationManager.getLanguage() === 'ms'
              ? 'Tamatkan sesi permainan untuk semua pemain?'
              : 'End game session for all players?';
            if (confirm(confirmMsg)) {
              this.endGameByTeacher();
            }
          }
        });
        this.topHUD.add(btnEnd.container);
      }

    } else {
      this.topHUD = this.add.container(cx, 45);

      const banner = this.add.graphics();
      banner.fillStyle(0x0f172a, 0.95);
      banner.fillRoundedRect(-480, -32, 960, 64, 16);
      banner.lineStyle(2, 0x38bdf8, 0.85);
      banner.strokeRoundedRect(-480, -32, 960, 64, 16);
      this.topHUD.add(banner);

      const hudLabel = isObservant
        ? '👁️ TEACHER OBSERVANT • LIVE CLASSROOM MONITORING'
        : '👥 CO-OP: CHEF 🍳 & MATH SPECIALIST 📐';

      this.modeText = this.add.text(-450, 0, hudLabel, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        color: isObservant ? '#c084fc' : '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      this.topHUD.add(this.modeText);

      this.stepTitle = this.add.text(isObservant ? 110 : 120, 0, 'STEP 1', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '17px',
        color: '#f59e0b',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.topHUD.add(this.stepTitle);

      const isHost = multiplayerManager.isHost() || isObservant;
      if (isHost) {
        const btnEnd = createButton(this, 380, 0, '🛑 END GAME', {
          width: 140,
          height: 38,
          fontSize: '13px',
          bgColor: 0xd97706,
          bgDarkColor: 0xb45309,
          onClick: () => {
            const confirmMsg = localizationManager.getLanguage() === 'ms'
              ? 'Tamatkan sesi permainan untuk semua pemain?'
              : 'End game session for all players?';
            if (confirm(confirmMsg)) {
              this.endGameByTeacher();
            }
          }
        });
        this.topHUD.add(btnEnd.container);
      } else if (multiplayerManager.room?.gameMode === MULTIPLAYER_MODES.LOCAL) {
        const btnToggle = createButton(this, 370, 0, 'SWITCH ROLE', {
          width: 140,
          height: 38,
          fontSize: '13px',
          bgColor: 0x0284c7,
          onClick: () => {
            this.currentLocalRole = this.currentLocalRole === ROLES.CHEF.id ? ROLES.MATH.id : ROLES.CHEF.id;
            audioManager.playClick();
            this.refreshRoleHUD();
            this.executeCoopStep();
          }
        });
        this.topHUD.add(btnToggle.container);
      }
    }
  }

  refreshRoleHUD() {
    const isPort = this.isPortrait();
    if (this.currentLocalRole === ROLES.OBSERVANT.id) {
      this.modeText.setText('👁️ TEACHER OBSERVANT • LIVE MONITORING');
    } else {
      const roleIcon = this.currentLocalRole === ROLES.CHEF.id ? '🍳 CHEF' : '📐 MATH SPECIALIST';
      this.modeText.setText(isPort ? roleIcon : `👥 ACTIVE ROLE: ${roleIcon}`);
    }
  }

  createLockBanner() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const cy = isPort ? 560 : 360;

    this.lockContainer = this.add.container(cx, cy);
    this.lockContainer.setDepth(20);
    this.lockContainer.setVisible(false);

    const lockBg = this.add.graphics();
    lockBg.fillStyle(0x09090b, 0.95);
    const boxW = isPort ? 640 : 640;
    const boxH = isPort ? 380 : 240;
    lockBg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    lockBg.lineStyle(3, 0xf59e0b, 1);
    lockBg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    this.lockContainer.add(lockBg);

    const lockIcon = this.add.text(0, isPort ? -110 : -60, '🔒', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '56px' : '44px'
    }).setOrigin(0.5);
    this.lockContainer.add(lockIcon);

    this.lockTitle = this.add.text(0, isPort ? -40 : -10, localizationManager.t('mp.stationLocked'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '26px' : '22px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.lockContainer.add(this.lockTitle);

    this.lockDesc = this.add.text(0, isPort ? 25 : 25, localizationManager.t('mp.waitingForMath'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '18px' : '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: isPort ? 540 : 500 }
    }).setOrigin(0.5);
    this.lockContainer.add(this.lockDesc);

    // Button to open math challenge (if player is math or testing)
    this.btnOpenMath = createButton(this, 0, isPort ? 115 : 75, localizationManager.t('mp.solveMath'), {
      width: isPort ? 400 : 280,
      height: isPort ? 56 : 44,
      fontSize: isPort ? '18px' : '15px',
      bgColor: THEME.secondary,
      onClick: () => {
        this.openMathChallenge();
      }
    });
    this.lockContainer.add(this.btnOpenMath.container);
  }

  showObservantDashboard(step) {
    if (this.observantContainer) {
      this.observantContainer.destroy();
    }
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const cy = isPort ? 560 : 360;

    this.observantContainer = this.add.container(cx, cy);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    const boxW = isPort ? 660 : 720;
    const boxH = isPort ? 580 : 360;
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    bg.lineStyle(2, 0xa855f7, 0.9);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    this.observantContainer.add(bg);

    const icon = this.add.text(0, isPort ? -220 : -135, '👁️ 🎓', { fontSize: isPort ? '44px' : '34px' }).setOrigin(0.5);
    this.observantContainer.add(icon);

    const title = this.add.text(0, isPort ? -165 : -90, 'TEACHER OBSERVANT DASHBOARD', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '24px' : '22px',
      color: '#c084fc',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.observantContainer.add(title);

    const room = multiplayerManager.room;
    const players = room ? room.players.filter(p => !p.isObservant && p.id !== room.hostId) : [];
    const p1 = players[0] ? players[0].name : 'Phone 1 (Chef)';
    const p2 = players[1] ? players[1].name : 'Phone 2 (Math)';

    const status1 = this.add.text(0, isPort ? -95 : -40, `🍳 Chef: ${p1} (Mengendalikan Masakan)`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '19px' : '16px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.observantContainer.add(status1);

    const status2 = this.add.text(0, isPort ? -35 : -5, `📐 Math Specialist: ${p2} (Selesaikan Cabaran Matematik)`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '19px' : '16px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.observantContainer.add(status2);

    const stepNum = cookingManager.currentStepIndex + 1;
    const totalSteps = cookingManager.currentRecipe?.steps?.length || 4;
    const stepLabel = this.add.text(0, isPort ? 25 : 30, `Langkah Semasa: Langkah ${stepNum} / ${totalSteps} - ${step.id.toUpperCase()}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '17px' : '15px',
      color: '#cbd5e1',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.observantContainer.add(stepLabel);

    const tip = this.add.text(0, isPort ? 90 : 70, 'Murid sedang bermain di telefon masing-masing. Skrin ini memantau perkembangan secara langsung.', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '15px' : '13px',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: isPort ? 580 : 560 }
    }).setOrigin(0.5);
    this.observantContainer.add(tip);

    // End Game button for teacher inside the dashboard
    const btnEnd = createButton(this, 0, isPort ? 200 : 125, '🛑 TAMATKAN PERMAINAN (END GAME)', {
      width: isPort ? 520 : 380,
      height: isPort ? 56 : 46,
      fontSize: isPort ? '18px' : '15px',
      bgColor: 0xd97706,
      bgDarkColor: 0xb45309,
      onClick: () => {
        const confirmMsg = localizationManager.getLanguage() === 'ms'
          ? 'Tamatkan sesi permainan untuk semua pemain?'
          : 'End game session for all players?';
        if (confirm(confirmMsg)) {
          this.endGameByTeacher();
        }
      }
    });
    this.observantContainer.add(btnEnd.container);
  }

  endGameByTeacher() {
    try { audioManager.play('coin'); } catch (e) {}
    const metrics = cookingManager.getPerformanceMetrics();
    multiplayerManager.finishCoopGame(metrics);
    this.showCoopResult(metrics);
  }

  executeCoopStep() {
    this.isMiniGamePaused = false;
    if (cookingManager.isRecipeComplete()) {
      const metrics = cookingManager.getPerformanceMetrics();
      multiplayerManager.finishCoopGame(metrics);
      this.showCoopResult(metrics);
      return;
    }

    const step = cookingManager.getCurrentStep();
    if (!step) return;

    const stepNum = cookingManager.currentStepIndex + 1;
    this.stepTitle.setText(`STEP ${stepNum}: ${step.id.toUpperCase()}`);

    if (this.currentLocalRole === ROLES.OBSERVANT.id) {
      this.hideStationLocked();
      this.showObservantDashboard(step);
      return;
    }

    if (step.type === 'math') {
      if (this.currentLocalRole === ROLES.MATH.id || multiplayerManager.room?.gameMode === MULTIPLAYER_MODES.LOCAL) {
        this.openMathChallenge();
      } else {
        this.showStationLocked();
      }
    } else if (step.type === 'minigame') {
      if (this.currentLocalRole === ROLES.CHEF.id || multiplayerManager.room?.gameMode === MULTIPLAYER_MODES.LOCAL) {
        this.hideStationLocked();
        this.startMiniGame(step);
      } else {
        // Math Specialist waits for Chef to cook!
        this.showStationLockedWaitingChef();
      }
    }
  }

  showStationLockedWaitingChef() {
    const isPort = this.isPortrait();
    this.isStationLocked = true;
    this.lockContainer.setVisible(true);
    this.lockContainer.setDepth(20);
    this.lockTitle.setText('CHEF SEDANG MEMASAK! 🍳');
    this.lockDesc.setText('Rakan anda sedang memasak di stesen dapur. Bersedia untuk soalan matematik seterusnya!');
    this.btnOpenMath.container.setVisible(false);
    this.children.bringToTop(this.lockContainer);
  }

  openMathChallenge() {
    const step = cookingManager.getCurrentStep();
    if (!step) return;

    this.hideStationLocked();

    const room = multiplayerManager.room;
    let targetChapter = room?.targetChapter;
    if (targetChapter === undefined || targetChapter === null) {
      targetChapter = gameManager.currentMission?.chapter || step.chapter || 1;
    }
    if (targetChapter === 0) {
      // 0 means All Chapters / Mixed: pick random chapter from 1 to 10
      targetChapter = Math.floor(Math.random() * 10) + 1;
    }
    const difficulty = room?.difficulty || gameManager.currentMission?.difficulty || 'medium';

    // Check if question bank has remaining questions
    if (!questionManager.hasMoreQuestions({ chapter: targetChapter, difficulty })) {
      this.handleBankExhausted();
      return;
    }

    this.scene.launch('MathChallengeScene', {
      chapter: targetChapter,
      difficulty: difficulty,
      isCoopChallenge: true,
      onBankExhausted: () => {
        this.scene.stop('MathChallengeScene');
        this.handleBankExhausted();
      },
      onComplete: (accuracy) => {
        cookingManager.recordMathScore(accuracy);
        multiplayerManager.unlockStepByMath(cookingManager.currentStepIndex + 1, accuracy);
        this.scene.stop('MathChallengeScene');
        cookingManager.nextStep();
        this.time.delayedCall(100, () => {
          this.executeCoopStep();
        });
      }
    });
    this.scene.bringToTop('MathChallengeScene');
  }

  handleBankExhausted() {
    if (this.isEndingGame) return;
    this.isEndingGame = true;

    if (this.lockContainer) {
      this.lockContainer.setVisible(true);
      this.lockTitle.setText('🎉 BANK SOALAN SELESAI!');
      this.lockDesc.setText('Semua soalan dalam bank soalan telah dijawab! Tahniah, sesi permainan selesai.');
      this.btnOpenMath.container.setVisible(false);
    }

    this.time.delayedCall(1200, () => {
      const metrics = cookingManager.getPerformanceMetrics();
      multiplayerManager.broadcast({
        type: 'COOP_FINISHED',
        metrics: metrics
      });
      this.showCoopResult(metrics);
    });
  }

  showStationLocked() {
    this.isStationLocked = true;
    this.lockContainer.setVisible(true);
    this.lockContainer.setDepth(20);
    this.lockTitle.setText(localizationManager.t('mp.stationLocked'));
    this.lockDesc.setText(localizationManager.t('mp.waitingForMath'));
    this.btnOpenMath.container.setVisible(true);
    this.children.bringToTop(this.lockContainer);
  }

  hideStationLocked() {
    this.isStationLocked = false;
    this.lockContainer.setVisible(false);
  }

  unlockStation() {
    this.hideStationLocked();
    audioManager.playCorrect();
    cookingManager.nextStep();
    this.executeCoopStep();
  }

  startMiniGame(step) {
    if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') {
      try { this.activeMiniGame.destroy(); } catch (e) {}
      this.activeMiniGame = null;
    }

    const onDone = (accuracy) => {
      cookingManager.recordCookingScore(accuracy);
      this.activeMiniGame = null;
      this.activeMiniGameRestart = null;
      this.isMiniGamePaused = false;
      multiplayerManager.completeChefStep(cookingManager.currentStepIndex + 1, accuracy);
      cookingManager.nextStep();
      this.time.delayedCall(100, () => {
        this.executeCoopStep();
      });
    };

    this.activeMiniGameRestart = () => {
      if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') this.activeMiniGame.destroy();
      this.isMiniGamePaused = false;
      this.activeMiniGame = this.createCoopMiniGame(step, onDone);
    };
    this.activeMiniGame = this.createCoopMiniGame(step, onDone);
  }

  restartActiveMiniGame() {
    if (typeof this.activeMiniGameRestart === 'function') this.activeMiniGameRestart();
  }

  createCoopMiniGame(step, onDone) {
    const common = { onComplete: onDone };
    switch (step.game) {
      case 'chop': return new ChopGame(this, { ...common, target: step.target || 4 });
      case 'measure': return new MeasureGame(this, { ...common, target: step.target || 150 });
      case 'mix': return new MixGame(this, { ...common, ratio1: step.ratio1 || 3, ratio2: step.ratio2 || 2 });
      case 'temperature': return new TemperatureGame(this, { ...common, targetMin: 160, targetMax: 200 });
      default: return null;
    }
  }

  showCoopResult(providedMetrics = null) {
    if (this.resultModal) {
      this.resultModal.destroy();
    }
    if (this.observantContainer) {
      this.observantContainer.destroy();
    }
    if (this.lockContainer) {
      this.lockContainer.destroy();
    }
    if (this.activeMiniGame && typeof this.activeMiniGame.destroy === 'function') {
      try { this.activeMiniGame.destroy(); } catch (e) {}
      this.activeMiniGame = null;
    }
    if (this.scene.isActive('MathChallengeScene')) {
      this.scene.stop('MathChallengeScene');
    }

    const metrics = providedMetrics || cookingManager.getPerformanceMetrics();
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const cy = isPort ? 600 : 360;

    this.resultModal = this.add.container(cx, cy);
    this.resultModal.setDepth(100);

    const bg = this.add.graphics();
    bg.fillStyle(0x09090b, 0.95);
    const boxW = isPort ? 660 : 640;
    const boxH = isPort ? 660 : 440;
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    bg.lineStyle(3, THEME.secondary, 1);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
    this.resultModal.add(bg);

    const title = this.add.text(0, isPort ? -240 : -160, '🎉 CO-OP MISSION COMPLETE! 🎉', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '26px' : '26px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.resultModal.add(title);

    const starText = this.add.text(0, isPort ? -180 : -100, `${metrics.stars} ★★★ EXCELLENT SYNERGY!`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '24px' : '22px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.resultModal.add(starText);

    const statsData = [
      { label: 'Chef Cooking Precision:', val: `${Math.round(metrics.cookingAccuracy * 100)}%` },
      { label: 'Math Specialist Accuracy:', val: `${Math.round(metrics.mathAccuracy * 100)}%` },
      { label: localizationManager.t('mp.challengePoints'), val: `${multiplayerManager.room?.challengeScore || 0} PTS` },
      { label: 'Team Synergy Bonus:', val: '+100 XP  |  +RM 15.00' }
    ];

    statsData.forEach((s, idx) => {
      const rowY = isPort ? (-90 + idx * 60) : (-35 + idx * 38);
      const lbl = this.add.text(isPort ? -280 : -220, rowY, s.label, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: isPort ? '18px' : '16px',
        color: '#cbd5e1'
      });
      const val = this.add.text(isPort ? 280 : 220, rowY, s.val, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '19px' : '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(1, 0);
      this.resultModal.add(lbl);
      this.resultModal.add(val);
    });

    const isObservant = (this.currentLocalRole === ROLES.OBSERVANT.id);
    const returnLabel = isObservant ? 'RETURN TO TEACHER DASHBOARD' : 'RETURN TO MULTIPLAYER LOBBY';

    const btnLobby = createButton(this, 0, isPort ? 180 : 140, returnLabel, {
      width: isPort ? 460 : 340,
      height: isPort ? 56 : 48,
      fontSize: isPort ? '17px' : '15px',
      bgColor: THEME.secondary,
      bgDarkColor: THEME.secondaryDark,
      onClick: () => {
        multiplayerManager.leaveRoom();
        if (isObservant) {
          this.scene.start('TeacherDashboardScene');
        } else {
          this.scene.start('MultiplayerLobbyScene');
        }
      }
    });
    this.resultModal.add(btnLobby.container);
  }

  update(time, delta) {
    if (!this.isMiniGamePaused && this.activeMiniGame && typeof this.activeMiniGame.update === 'function') {
      this.activeMiniGame.update(time, delta);
    }
  }
}

export default CoopCookingScene;
