import { playerManager } from './PlayerManager.js';
import recipesData from '../data/recipes.json' with { type: 'json' };
import worldsData from '../data/worlds.json' with { type: 'json' };

class DailyChallengeManager {
  constructor() {
    this.storageKey = 'math_mama_daily_challenge';
    this.maxAttempts = 3;
    this.state = this.loadState();
  }

  getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadState() {
    const today = this.getTodayDateString();
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date === today) {
            return parsed;
          }
          // New day: update streak logic
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          
          let streak = parsed.streak || 0;
          if (parsed.date === yStr && parsed.completed) {
            // Maintained streak
          } else if (parsed.date !== yStr) {
            streak = 0; // Streak broken
          }

          const newState = {
            date: today,
            attemptsLeft: this.maxAttempts,
            completed: false,
            bestScore: 0,
            streak: streak
          };
          this.saveState(newState);
          return newState;
        }
      }
    } catch (e) {
      console.warn('Error loading daily challenge state', e);
    }

    return {
      date: today,
      attemptsLeft: this.maxAttempts,
      completed: false,
      bestScore: 0,
      streak: 0
    };
  }

  saveState(state = this.state) {
    this.state = state;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Error saving daily challenge state', e);
    }
  }

  getDailyMission() {
    const today = this.getTodayDateString();
    // Simple deterministic hash based on date string
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
    }

    const recipes = recipesData.recipes || [];
    const worlds = worldsData.worlds || [];

    const recipeIndex = hash % (recipes.length || 1);
    const worldIndex = (hash >> 3) % (worlds.length || 1);

    const targetRecipe = recipes[recipeIndex] || { id: 'nasi_lemak', name: 'Nasi Lemak' };
    const targetWorld = worlds[worldIndex] || { id: 'world-01', chapter: 1, name: 'Quadratic Kitchen' };

    return {
      date: today,
      id: `DAILY-${today}`,
      title_en: `Today's Special: ${targetRecipe.name}`,
      title_ms: `Istimewa Hari Ini: ${targetRecipe.name_ms || targetRecipe.name}`,
      chapter: targetWorld.chapter,
      worldId: targetWorld.id,
      worldName: targetWorld.name,
      recipeId: targetRecipe.id,
      recipeName: targetRecipe.name,
      attemptsLeft: this.state.attemptsLeft,
      maxAttempts: this.maxAttempts,
      completed: this.state.completed,
      streak: this.state.streak,
      bonusMultiplier: 2.0, // 2x XP and Coins
      bonusXP: 300,
      bonusCoins: 200
    };
  }

  useAttempt() {
    if (this.state.attemptsLeft > 0) {
      this.state.attemptsLeft -= 1;
      this.saveState();
      return true;
    }
    return false;
  }

  recordCompletion(success = true, score = 100) {
    if (success) {
      if (!this.state.completed) {
        this.state.completed = true;
        this.state.streak = (this.state.streak || 0) + 1;
        // Award player bonus
        if (playerManager.player) {
          playerManager.addXP(300);
          playerManager.addCoins(200);
          playerManager.player.dailyStreak = this.state.streak;
          playerManager.save();
        }
      }
      if (score > (this.state.bestScore || 0)) {
        this.state.bestScore = score;
      }
      this.saveState();
    }
  }

  canPlay() {
    return this.state.attemptsLeft > 0 && !this.state.completed;
  }
}

export const dailyChallengeManager = new DailyChallengeManager();
export default DailyChallengeManager;
