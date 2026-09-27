import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import gameManager from '../managers/GameManager.js';
import { dailyChallengeManager } from '../managers/DailyChallengeManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class DailyChallengeScene extends Phaser.Scene {
  constructor() {
    super('DailyChallengeScene');
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createChallengeCard();
  }

  createBackground() {
    createWarungBackdrop(this, { dim: 0.16, counter: true });

    // Subtle sunburst / highlight
    const glow = this.add.graphics();
    glow.fillStyle(0xf59e0b, 0.05);
    glow.fillCircle(640, 360, 450);
  }

  createHeader() {
    const isMs = localizationManager.currentLanguage === 'ms';

    // Back to Menu Button
    createButton(this, 110, 50, isMs ? '← MENU' : '← MENU', {
      width: 120,
      height: 42,
      fontSize: '15px',
      bgColor: 0x334155,
      onClick: () => {
        this.scene.start('MainMenuScene');
      }
    });

    // Scene Title
    this.add.text(640, 50, isMs ? '⚡ CABARAN HARIAN' : '⚡ DAILY CHALLENGE', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 85, isMs ? 'Selesaikan misi istimewa hari ini untuk ganjaran berganda!' : 'Complete today\'s special mission for double XP & coin rewards!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createChallengeCard() {
    const isMs = localizationManager.currentLanguage === 'ms';
    const mission = dailyChallengeManager.getDailyMission();

    // Central Panel
    createPanel(this, 640, 380, 750, 480, {
      bgColor: 0x1e293b,
      borderColor: 0xf59e0b,
      borderWidth: 2,
      radius: 16
    });

    // Special Dish Icon & Title
    this.add.text(640, 200, '🍲', { fontSize: '56px' }).setOrigin(0.5);

    this.add.text(640, 260, isMs ? mission.title_ms : mission.title_en, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 295, `${isMs ? 'Topik Form 4: Bab' : 'Form 4 Topic: Chapter'} ${mission.chapter} (${mission.worldName})`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Stats Grid Container
    const gridY = 360;

    // Attempts box
    const attBox = this.add.graphics();
    attBox.fillStyle(0x0f172a, 0.9);
    attBox.fillRoundedRect(350, gridY, 170, 90, 10);
    this.add.text(435, gridY + 25, isMs ? 'PERCUBAAN' : 'ATTEMPTS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);
    const attemptsColor = mission.attemptsLeft > 0 ? '#10b981' : '#ef4444';
    this.add.text(435, gridY + 55, `${mission.attemptsLeft} / ${mission.maxAttempts}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: attemptsColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Streak box
    const streakBox = this.add.graphics();
    streakBox.fillStyle(0x0f172a, 0.9);
    streakBox.fillRoundedRect(555, gridY, 170, 90, 10);
    this.add.text(640, gridY + 25, isMs ? 'STREAK HARIAN' : 'DAILY STREAK', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);
    this.add.text(640, gridY + 55, `🔥 ${mission.streak} ${isMs ? 'Hari' : 'Days'}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Rewards box
    const rewardBox = this.add.graphics();
    rewardBox.fillStyle(0x0f172a, 0.9);
    rewardBox.fillRoundedRect(760, gridY, 170, 90, 10);
    this.add.text(845, gridY + 25, isMs ? 'GANJARAN' : 'REWARDS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);
    this.add.text(845, gridY + 55, `+${mission.bonusXP} XP  +RM${mission.bonusCoins}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#a855f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Action Button or Status Banner
    if (mission.completed) {
      const banner = this.add.graphics();
      banner.fillStyle(0x065f46, 0.8);
      banner.fillRoundedRect(420, 490, 440, 50, 12);
      this.add.text(640, 515, isMs ? '🎉 CABARAN HARI INI TELAH SELESAI!' : '🎉 TODAY\'S CHALLENGE COMPLETED!', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#6ee7b7',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else if (mission.attemptsLeft <= 0) {
      const banner = this.add.graphics();
      banner.fillStyle(0x7f1d1d, 0.8);
      banner.fillRoundedRect(420, 490, 440, 50, 12);
      this.add.text(640, 515, isMs ? '❌ TIADA PERCUBAAN TINGGAL HARI INI' : '❌ NO ATTEMPTS REMAINING TODAY', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#fca5a5',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      createButton(this, 640, 520, isMs ? '🍳 MULAKAN CABARAN' : '🍳 START DAILY CHALLENGE', {
        width: 320,
        height: 54,
        fontSize: '20px',
        bgColor: 0x10b981,
        onClick: () => {
          dailyChallengeManager.useAttempt();
          // Dispatch to CookingScene with daily challenge settings
          const dailyMission = {
            id: mission.id,
            world: mission.chapter,
            recipeId: mission.recipeId,
            difficulty: 'normal',
            isDaily: true
          };
          gameManager.startCustomMission(dailyMission);
          this.scene.start('CookingScene');
        }
      });
    }

    // Reset countdown info
    this.add.text(640, 585, isMs ? 'Misi baharu bermula setiap 12:00 tengah malam' : 'New mission refreshes daily at midnight', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#64748b',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }
}

export default DailyChallengeScene;
