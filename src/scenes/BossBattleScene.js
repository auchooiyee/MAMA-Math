import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import audioManager from '../managers/AudioManager.js';
import { bossManager } from '../managers/BossManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

// Boss questions are authored with lightweight LaTeX delimiters, while Phaser
// renders plain text. Convert the small command subset used by the curriculum
// into readable Unicode/plain text instead of exposing raw `$...$` markers.
function formatBossMathText(value = '') {
  return String(value)
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\implies/g, '⇒')
    .replace(/\\cap/g, '∩')
    .replace(/\\cup/g, '∪')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\sim/g, '∼')
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossId = 'boss-01';
    this.timerEvent = null;
    this.timeRemaining = 60;
  }

  init(data) {
    this.bossId = data.bossId || 'boss-01';
  }

  create() {
    try {
      this.battleState = bossManager.startBattle(this.bossId);
      this.boss = this.battleState.boss;
      this.timeRemaining = this.boss.timeLimit || 75;
      this.isAnswering = false;

      this.createBackground();
      this.createTopHUD();
      this.createBossStage();
      this.createQuestionArea();
      this.startBattleTimer();
    } catch (err) {
      console.error('Error starting boss battle:', err);
      this.add.graphics().fillStyle(0x0f172a, 1).fillRect(0, 0, 1280, 720);
      this.add.text(640, 300, 'Ralat memuatkan bos. Sila kembali ke peta.', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '20px',
        color: '#f87171'
      }).setOrigin(0.5);
      createButton(this, 640, 380, '← KEMBALI KE PETA', {
        onClick: () => this.scene.start('WorldMapScene')
      });
    }
  }

  createBackground() {
    const bg = this.add.graphics();
    // Dramatic dark red / midnight blue arena gradient
    bg.fillGradientStyle(0x311028, 0x311028, 0x0f172a, 0x0f172a, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Arena battle ring
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xf43f5e, 0.3);
    ring.strokeCircle(640, 260, 240);
  }

  createTopHUD() {
    const isMs = localizationManager.currentLanguage === 'ms';

    // Back to map button
    createButton(this, 110, 45, isMs ? '← PETA' : '← MAP', {
      width: 120,
      height: 40,
      fontSize: '15px',
      bgColor: 0x334155,
      onClick: () => {
        if (this.timerEvent) this.timerEvent.remove();
        this.scene.start('WorldMapScene');
      }
    });

    // Boss Tag & Name Header
    this.titleText = this.add.text(640, 35, isMs ? this.boss.name_ms : this.boss.name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(640, 62, isMs ? this.boss.subtitle_ms : this.boss.subtitle, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    // Timer display on right
    this.timerBox = this.add.container(1160, 45);
    const tBg = this.add.graphics();
    tBg.fillStyle(0x0f172a, 0.8);
    tBg.fillRoundedRect(-65, -20, 130, 40, 10);
    this.timerBox.add(tBg);

    this.timerText = this.add.text(0, 0, `⏱️ ${this.timeRemaining}s`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.timerBox.add(this.timerText);
  }

  createBossStage() {
    const isMs = localizationManager.currentLanguage === 'ms';

    // Boss Avatar
    this.bossAvatar = this.add.text(640, 160, this.boss.avatar, {
      fontSize: '70px'
    }).setOrigin(0.5);

    // Idle breathing tween on boss avatar
    this.tweens.add({
      targets: this.bossAvatar,
      y: 152,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Boss HP Bar Container
    const hpBarWidth = 420;
    const hpBarHeight = 22;
    const hpX = 640 - hpBarWidth / 2;
    const hpY = 225;

    // HP Bar background
    this.hpBg = this.add.graphics();
    this.hpBg.fillStyle(0x334155, 1);
    this.hpBg.fillRoundedRect(hpX, hpY, hpBarWidth, hpBarHeight, 6);

    // HP Bar fill
    this.hpFill = this.add.graphics();
    this.updateHPBar(this.boss.hp, this.boss.hp);

    // HP Text
    this.hpText = this.add.text(640, hpY + 11, `HP: ${this.boss.hp} / ${this.boss.hp}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Dialogue speech bubble
    this.dialogueBox = this.add.container(640, 280);
    const bubble = this.add.graphics();
    bubble.fillStyle(0x0f172a, 0.9);
    bubble.lineStyle(2, 0xf59e0b, 0.8);
    bubble.fillRoundedRect(-320, -25, 640, 50, 12);
    bubble.strokeRoundedRect(-320, -25, 640, 50, 12);
    this.dialogueBox.add(bubble);

    const initialText = isMs ? this.boss.dialogue.intro_ms : this.boss.dialogue.intro_en;
    this.dialogueText = this.add.text(0, 0, `"${initialText}"`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#fef08a',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 610 }
    }).setOrigin(0.5);
    this.dialogueBox.add(this.dialogueText);
  }

  updateHPBar(currentHP, maxHP) {
    this.hpFill.clear();
    const ratio = Math.max(0, currentHP / maxHP);
    const hpBarWidth = 420;
    const hpBarHeight = 22;
    const hpX = 640 - hpBarWidth / 2;
    const hpY = 225;

    // Change color based on health
    const fillColor = ratio > 0.5 ? 0x10b981 : (ratio > 0.25 ? 0xf59e0b : 0xef4444);
    this.hpFill.fillStyle(fillColor, 1);
    this.hpFill.fillRoundedRect(hpX, hpY, hpBarWidth * ratio, hpBarHeight, 6);
  }

  createQuestionArea() {
    if (this.questionContainer) {
      this.questionContainer.destroy();
    }

    const isMs = localizationManager.currentLanguage === 'ms';
    const currentPhase = bossManager.getCurrentPhase();

    if (!currentPhase) return;

    this.questionContainer = this.add.container(640, 490);

    // Background Card
    const panel = createPanel(this, 0, 0, 820, 280, {
      bgColor: 0x1e293b,
      borderColor: 0x475569,
      borderWidth: 2,
      radius: 14
    });
    this.questionContainer.add(panel.container);
    // Stage / Phase banner
    const totalPhases = bossManager.getTotalPhases();
    const currentPhaseIdx = bossManager.currentPhaseIndex + 1;
    const stageTitle = currentPhase.stageTitle_en ? 
      (isMs ? currentPhase.stageTitle_ms : currentPhase.stageTitle_en) :
      (isMs ? `Fasa ${currentPhaseIdx} / ${totalPhases}` : `Phase ${currentPhaseIdx} / ${totalPhases}`);

    const phaseTag = this.add.text(0, -115, `⚔️ ${stageTitle}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#f43f5e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.questionContainer.add(phaseTag);

    // Question Prompt
    const qData = currentPhase.question;
    const prompt = formatBossMathText(isMs ? qData.prompt_ms : qData.prompt_en);

    const promptText = this.add.text(0, -70, prompt, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 760 }
    }).setOrigin(0.5);
    this.questionContainer.add(promptText);

    // 4 Answer Option Buttons (2x2 Grid)
    const options = qData.options || [];
    const gridPositions = [
      { x: -195, y: -5 },
      { x: 195, y: -5 },
      { x: -195, y: 70 },
      { x: 195, y: 70 }
    ];

    options.forEach((optText, index) => {
      const pos = gridPositions[index];
      const optBtn = this.createOptionButton(pos.x, pos.y, formatBossMathText(optText), index === qData.correctIndex);
      this.questionContainer.add(optBtn);
    });
  }

  createOptionButton(x, y, text, isCorrect) {
    const container = this.add.container(x, y);

    const btn = this.add.graphics();
    btn.fillStyle(0x334155, 1);
    btn.lineStyle(2, 0x64748b, 1);
    btn.fillRoundedRect(-180, -25, 360, 50, 10);
    btn.strokeRoundedRect(-180, -25, 360, 50, 10);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([btn, label]);
    container.setSize(360, 50);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerover', () => {
      if (this.isAnswering) return;
      btn.clear();
      btn.fillStyle(0x475569, 1);
      btn.lineStyle(2, 0xf59e0b, 1);
      btn.fillRoundedRect(-180, -25, 360, 50, 10);
      btn.strokeRoundedRect(-180, -25, 360, 50, 10);
    });

    container.on('pointerout', () => {
      if (this.isAnswering) return;
      btn.clear();
      btn.fillStyle(0x334155, 1);
      btn.lineStyle(2, 0x64748b, 1);
      btn.fillRoundedRect(-180, -25, 360, 50, 10);
      btn.strokeRoundedRect(-180, -25, 360, 50, 10);
    });

    container.on('pointerdown', () => {
      if (this.isAnswering) return;
      this.handleOptionSelection(container, btn, isCorrect);
    });

    return container;
  }

  handleOptionSelection(container, btnGraphic, isCorrect) {
    this.isAnswering = true;
    const isMs = localizationManager.currentLanguage === 'ms';

    if (isCorrect) {
      btnGraphic.clear();
      btnGraphic.fillStyle(0x10b981, 1);
      btnGraphic.fillRoundedRect(-180, -25, 360, 50, 10);

      // Boss damage animation & floating number
      const result = bossManager.processPhaseAnswer(true, 10);

      // Flash & shake boss
      this.cameras.main.shake(250, 0.015);
      this.tweens.add({
        targets: this.bossAvatar,
        scale: 1.25,
        alpha: 0.5,
        y: '-=15',
        yoyo: true,
        duration: 120,
        repeat: 2,
        onComplete: () => {
          this.bossAvatar.setScale(1.0);
          this.bossAvatar.setAlpha(1.0);
        }
      });

      // Floating damage text
      const dmgText = this.add.text(640, 200, `-${result.damage} HP!`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '28px',
        color: '#f43f5e',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: dmgText,
        y: 140,
        alpha: 0,
        duration: 800,
        onComplete: () => dmgText.destroy()
      });

      // Update HP UI
      this.updateHPBar(result.bossHP, result.maxHP);
      this.hpText.setText(`HP: ${result.bossHP} / ${result.maxHP}`);

      // Boss hurt dialogue
      this.dialogueText.setText(`"${isMs ? this.boss.dialogue.hurt_ms : this.boss.dialogue.hurt_en}"`);

      this.time.delayedCall(1000, () => {
        if (result.defeated) {
          this.handleBossDefeated();
        } else {
          this.isAnswering = false;
          this.createQuestionArea();
        }
      });
    } else {
      btnGraphic.clear();
      btnGraphic.fillStyle(0xef4444, 1);
      btnGraphic.fillRoundedRect(-180, -25, 360, 50, 10);

      // Miss penalty
      this.dialogueText.setText(isMs ? '"Jawapan itu salah! Cuba lagi!"' : '"Wrong answer! Try again!"');
      this.cameras.main.shake(150, 0.008);

      this.time.delayedCall(800, () => {
        this.isAnswering = false;
        btnGraphic.clear();
        btnGraphic.fillStyle(0x334155, 1);
        btnGraphic.lineStyle(2, 0x64748b, 1);
        btnGraphic.fillRoundedRect(-180, -25, 360, 50, 10);
        btnGraphic.strokeRoundedRect(-180, -25, 360, 50, 10);
      });
    }
  }

  startBattleTimer() {
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeRemaining -= 1;
        this.timerText.setText(`⏱️ ${this.timeRemaining}s`);
        if (this.timeRemaining <= 15) {
          this.timerText.setColor('#ef4444');
        }
        if (this.timeRemaining <= 0) {
          this.handleTimeOut();
        }
      },
      loop: true
    });
  }

  handleTimeOut() {
    if (this.timerEvent) this.timerEvent.remove();
    this.isAnswering = true;
    const isMs = localizationManager.currentLanguage === 'ms';

    const modal = this.add.container(640, 360);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.lineStyle(3, 0xef4444, 1);
    bg.fillRoundedRect(-240, -150, 480, 300, 16);
    bg.strokeRoundedRect(-240, -150, 480, 300, 16);

    const title = this.add.text(0, -90, isMs ? '⏰ MASA TAMAT!' : '⏰ TIME EXPIRED!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -20, isMs ? 'Bos telah menewaskan anda dalam pertempuran masa!' : 'The Boss overpowered your kitchen under time pressure!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: 420 }
    }).setOrigin(0.5);

    modal.add([bg, title, desc]);

    createButton(this, 640, 450, isMs ? '🔄 CUBA LAGI' : '🔄 TRY AGAIN', {
      width: 200,
      height: 48,
      fontSize: '16px',
      bgColor: 0x3b82f6,
      onClick: () => {
        this.scene.restart({ bossId: this.bossId });
      }
    });
  }

  handleBossDefeated() {
    if (this.timerEvent) this.timerEvent.remove();
    const isMs = localizationManager.currentLanguage === 'ms';

    // Dialogue victory line
    this.dialogueText.setText(`"${isMs ? this.boss.dialogue.defeat_ms : this.boss.dialogue.defeat_en}"`);

    // Modal Victory Fanfare
    const modal = this.add.container(640, 360);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    bg.lineStyle(3, 0xf59e0b, 1);
    bg.fillRoundedRect(-280, -190, 560, 380, 18);
    bg.strokeRoundedRect(-280, -190, 560, 380, 18);

    const trophy = this.add.text(0, -125, '🏆', { fontSize: '50px' }).setOrigin(0.5);

    const title = this.add.text(0, -65, isMs ? 'KEMENANGAN BOS!' : 'BOSS DEFEATED!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const bossDefeatedMsg = this.add.text(0, -25, `${isMs ? 'Anda telah menewaskan' : 'You have conquered'} ${isMs ? this.boss.name_ms : this.boss.name}!`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    const rewards = this.boss.rewards || { xp: 500, coins: 300 };
    const rewardBox = this.add.graphics();
    rewardBox.fillStyle(0x1e293b, 1);
    rewardBox.fillRoundedRect(-180, 5, 360, 65, 10);

    const rewText = this.add.text(0, 37, `+${rewards.xp} XP   +RM ${rewards.coins} KEUNTUNGAN`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#34d399',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    modal.add([bg, trophy, title, bossDefeatedMsg, rewardBox, rewText]);

    createButton(this, 640, 505, isMs ? '🌟 KEMBALI KE PETA DUNIA' : '🌟 RETURN TO WORLD MAP', {
      width: 280,
      height: 48,
      fontSize: '16px',
      bgColor: 0x10b981,
      onClick: () => {
        this.scene.start('WorldMapScene');
      }
    });
  }
}

export default BossBattleScene;
