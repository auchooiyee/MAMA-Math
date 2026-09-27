import badgesData from '../data/badges.json' with { type: 'json' };
import playerManager from './PlayerManager.js';
import audioManager from './AudioManager.js';

class BadgeManager {
  constructor() {
    this.badges = badgesData;
    this.unlockedBadges = new Set();
    this.listeners = new Set();
  }

  init(saveData) {
    this.unlockedBadges.clear();
    const loaded = saveData?.badges || [];
    loaded.forEach(bId => this.unlockedBadges.add(bId));
  }

  getAllBadges() {
    return this.badges.map(b => ({
      ...b,
      isUnlocked: this.unlockedBadges.has(b.id)
    }));
  }

  isUnlocked(badgeId) {
    return this.unlockedBadges.has(badgeId);
  }

  unlock(badgeId) {
    if (!this.unlockedBadges.has(badgeId)) {
      this.unlockedBadges.add(badgeId);
      audioManager.playCorrect();
      this.notifyListeners(badgeId);
      return true;
    }
    return false;
  }

  checkProgress() {
    const player = playerManager.player;
    const stats = playerManager.stats || {};
    const completedMissions = playerManager.completedMissions || {};
    const newlyUnlocked = [];

    this.badges.forEach(b => {
      if (this.unlockedBadges.has(b.id)) return;

      let qualified = false;
      if (b.reqType === 'dishes') {
        qualified = (stats.totalDishesServed || 0) >= b.reqValue;
      } else if (b.reqType === 'total_stars') {
        qualified = (player?.stars || 0) >= b.reqValue;
      } else if (b.reqType === 'chapter_mastery') {
        // Qualified if any completed mission for this chapter has 3 stars
        const ch = b.chapter;
        const missionsInCh = Object.entries(completedMissions).filter(([mId, data]) => {
          return mId.startsWith(`M${ch.toString().padStart(2, '0')}`) && data.stars >= 3;
        });
        qualified = missionsInCh.length > 0;
      }

      if (qualified) {
        this.unlock(b.id);
        newlyUnlocked.push(b);
      }
    });

    return newlyUnlocked;
  }

  onUnlock(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    for (const cb of this.listeners) {
      try {
        cb(badge);
      } catch (err) {
        console.error('Error in badge listener:', err);
      }
    }
  }

  toJSON() {
    return Array.from(this.unlockedBadges);
  }
}

export const badgeManager = new BadgeManager();
export default badgeManager;
