import bossesData from '../data/bosses.json' with { type: 'json' };
import { playerManager } from './PlayerManager.js';

class BossManager {
  constructor() {
    this.bosses = bossesData.bosses || [];
    this.currentBoss = null;
    this.currentPhaseIndex = 0;
    this.currentBossHP = 0;
    this.maxBossHP = 0;
    this.battleLog = [];
  }

  getBossList() {
    return this.bosses;
  }

  getBossById(bossId) {
    return this.bosses.find(b => b.id === bossId) || null;
  }

  getBossByWorldId(worldId) {
    return this.bosses.find(b => b.worldId === worldId) || null;
  }

  startBattle(bossId) {
    const boss = this.getBossById(bossId);
    if (!boss) {
      throw new Error(`Boss not found with id: ${bossId}`);
    }

    this.currentBoss = boss;
    this.currentPhaseIndex = 0;
    this.maxBossHP = boss.hp;
    this.currentBossHP = boss.hp;
    this.battleLog = [];

    return {
      boss: this.currentBoss,
      phase: this.getCurrentPhase(),
      hp: this.currentBossHP,
      maxHp: this.maxBossHP
    };
  }

  getCurrentPhase() {
    if (!this.currentBoss || !this.currentBoss.phases) return null;
    return this.currentBoss.phases[this.currentPhaseIndex] || null;
  }

  getTotalPhases() {
    return this.currentBoss?.phases?.length || 1;
  }

  processPhaseAnswer(isCorrect, timeTaken = 10) {
    if (!this.currentBoss) return { error: 'No active boss battle' };

    const totalPhases = this.getTotalPhases();
    const phaseDamageBase = Math.ceil(this.maxBossHP / totalPhases);

    let damage = 0;
    let feedback = '';

    if (isCorrect) {
      // Speed multiplier
      let speedBonus = 1.0;
      if (timeTaken <= 10) speedBonus = 1.25;
      else if (timeTaken <= 20) speedBonus = 1.1;

      damage = Math.round(phaseDamageBase * speedBonus);
      this.currentBossHP = Math.max(0, this.currentBossHP - damage);
      feedback = 'CRITICAL HIT!';
      this.currentPhaseIndex += 1;
    } else {
      feedback = 'MISS! Boss counter-attacked!';
      // Boss remains on phase, but player loses some momentum
    }

    const defeated = this.currentBossHP <= 0 || this.currentPhaseIndex >= totalPhases;

    if (defeated) {
      this.currentBossHP = 0;
      this.recordBossDefeat(this.currentBoss.id);
    }

    return {
      isCorrect,
      damage,
      bossHP: this.currentBossHP,
      maxHP: this.maxBossHP,
      currentPhase: this.currentPhaseIndex,
      totalPhases,
      nextPhase: this.getCurrentPhase(),
      defeated,
      rewards: defeated ? this.currentBoss.rewards : null
    };
  }

  recordBossDefeat(bossId) {
    if (!playerManager.player) return;

    if (!playerManager.player.defeatedBosses) {
      playerManager.player.defeatedBosses = [];
    }
    if (!playerManager.player.defeatedBosses.includes(bossId)) {
      playerManager.player.defeatedBosses.push(bossId);
    }

    const boss = this.getBossById(bossId);
    if (boss && boss.rewards) {
      playerManager.addXP(boss.rewards.xp || 300);
      playerManager.addCoins(boss.rewards.coins || 200);
    }
    playerManager.save();
  }

  isBossDefeated(bossId) {
    return (playerManager.player?.defeatedBosses || []).includes(bossId);
  }
}

export const bossManager = new BossManager();
export default BossManager;
