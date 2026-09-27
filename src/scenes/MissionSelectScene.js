import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import gameManager from '../managers/GameManager.js';
import audioManager from '../managers/AudioManager.js';
import worldsData from '../data/worlds.json' with { type: 'json' };
import missionsData from '../data/missions.json' with { type: 'json' };
import { bossManager } from '../managers/BossManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class MissionSelectScene extends Phaser.Scene {
  constructor() {
    super('MissionSelectScene');
    this.worldId = 1;
  }

  init(data) {
    this.worldId = data.worldId || 1;
  }

  create() {
    this.createBackground();
    this.createTopHUD();
    this.createMissionList();
  }

  createBackground() {
    createWarungBackdrop(this, { dim: 0.12, counter: true });

    const world = worldsData.find(w => w.id === this.worldId) || worldsData[0];

    // Header Title
    this.titleText = this.add.text(640, 50, `${world.icon} ${localizationManager.t(world.titleKey)}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.subText = this.add.text(640, 80, localizationManager.t(world.subtitleKey), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createTopHUD() {
    // Back to World Map Button
    createButton(this, 110, 50, '← MAP', {
      width: 120,
      height: 42,
      fontSize: '15px',
      bgColor: 0x334155,
      onClick: () => {
        this.scene.start('WorldMapScene');
      }
    });
  }

  createMissionList() {
    const worldMissions = missionsData.filter(m => m.world === this.worldId);

    if (worldMissions.length === 0) {
      // Several curriculum districts have no authored campaign missions yet.
      // Keep the screen actionable: the district boss is still available below.
      const emptyState = this.add.container(640, 155);
      const panel = this.add.graphics();
      panel.fillStyle(THEME.panelLight, 0.97).fillRoundedRect(-390, -37, 780, 74, 18);
      panel.lineStyle(2, THEME.accentGold, 0.9).strokeRoundedRect(-390, -37, 780, 74, 18);
      emptyState.add(panel);
      const isMs = localizationManager.getLanguage() === 'ms';
      const title = this.add.text(0, -12, isMs ? 'MISI KEMPEN AKAN DATANG' : 'CAMPAIGN MISSIONS COMING SOON', {
        fontFamily: 'Fredoka, sans-serif', fontSize: '19px', color: THEME.textDark, fontStyle: 'bold'
      }).setOrigin(0.5);
      const hint = this.add.text(0, 15, isMs
        ? 'Cabaran bos daerah ini boleh dimainkan sekarang.'
        : 'You can still play this district’s boss challenge now.', {
        fontFamily: 'Nunito, sans-serif', fontSize: '15px', color: THEME.textMuted, fontStyle: 'bold'
      }).setOrigin(0.5);
      emptyState.add([title, hint]);
    }

    let startY = 160;
    worldMissions.forEach((mission, index) => {
      const card = this.add.container(640, startY + index * 120);

      // Card Background
      const bg = this.add.graphics();
      bg.fillStyle(THEME.panelLight, 0.98);
      bg.fillRoundedRect(-380, -45, 760, 90, 16);
      bg.lineStyle(2, THEME.surfaceTeal, 0.85);
      bg.strokeRoundedRect(-380, -45, 760, 90, 16);
      card.add(bg);

      // Mission Code & Title
      const title = this.add.text(-350, -26, `${mission.code}: ${localizationManager.t(mission.titleKey)}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '20px',
        color: THEME.textDark,
        fontStyle: 'bold'
      });
      card.add(title);

      // Customer & Recipe info
      const info = this.add.text(-350, 4, `Recipe: ${mission.recipeId.toUpperCase()}  |  Customer: ${mission.customer.name}  |  Diff: ${mission.difficulty.toUpperCase()}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: THEME.textMuted
      });
      card.add(info);

      // Reward tag
      const rewards = this.add.text(-350, 24, `Reward: +${mission.xpReward} XP  |  +RM ${(mission.coinReward / 10).toFixed(2)}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#b45309'
      });
      card.add(rewards);

      // Start Mission Button
      const startBtn = createButton(this, 270, 0, localizationManager.t('missions.startMission'), {
        width: 170,
        height: 44,
        fontSize: '15px',
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        onClick: () => {
          gameManager.startMission(mission.id);
          this.scene.start('CookingScene');
        }
      });
      card.add(startBtn.container);

      this.add.existing(card);
    });

    // Render World Boss Mission if available
    const bossKey = this.worldId < 10 ? `boss-0${this.worldId}` : `boss-${this.worldId}`;
    const boss = bossManager.getBossById(bossKey);
    if (boss) {
      const isMs = localizationManager.getLanguage() === 'ms';
      const bossY = worldMissions.length === 0 ? 300 : startY + worldMissions.length * 120;
      const bossCard = this.add.container(640, bossY);

      const bBg = this.add.graphics();
      bBg.fillStyle(0x3f101f, 0.95);
      bBg.fillRoundedRect(-380, -45, 760, 90, 16);
      bBg.lineStyle(2, 0xf43f5e, 1);
      bBg.strokeRoundedRect(-380, -45, 760, 90, 16);
      bossCard.add(bBg);

      const bTitle = this.add.text(-350, -26, `⚔️ BOSS: ${isMs ? boss.name_ms : boss.name}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '20px',
        color: '#fca5a5',
        fontStyle: 'bold'
      });
      bossCard.add(bTitle);

      const bInfo = this.add.text(-350, 4, `${isMs ? boss.subtitle_ms : boss.subtitle}  |  HP: ${boss.hp}  |  ${isMs ? 'Masa' : 'Time'}: ${boss.timeLimit}s`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#fecdd3'
      });
      bossCard.add(bInfo);

      const bRew = this.add.text(-350, 24, `Reward: +${boss.rewards.xp} XP  |  +RM ${boss.rewards.coins}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#facc15'
      });
      bossCard.add(bRew);

      const bossBtn = createButton(this, 270, 0, isMs ? '⚔️ LAWAN BOS' : '⚔️ FIGHT BOSS', {
        width: 170,
        height: 44,
        fontSize: '15px',
        bgColor: 0xe11d48,
        bgDarkColor: 0xbe123c,
        onClick: () => {
          this.scene.start('BossBattleScene', { bossId: boss.id });
        }
      });
      bossCard.add(bossBtn.container);
      this.add.existing(bossCard);
    }
  }
}

export default MissionSelectScene;
