import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '../config/constants.js';

class SaveManager {
  getDefaultSaveData() {
    return {
      version: '0.1.0',
      player: {
        name: 'Chef Pelajar',
        level: 1,
        xp: 0,
        coins: 100, // Starter funds
        stars: 0,
        reputation: 100
      },
      equipment: ['basic_stove', 'basic_knife'],
      unlockedRecipes: ['nasi_lemak'],
      completedMissions: {},
      settings: {
        language: DEFAULT_LANGUAGE, // Default English
        soundEnabled: true,
        musicEnabled: true
      },
      stats: {
        totalDishesServed: 0,
        mathQuestionsAnswered: 0,
        mathAccuracySum: 0,
        totalProfitRM: 0
      }
    };
  }

  load() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
      if (!dataStr) {
        return this.getDefaultSaveData();
      }
      const parsed = JSON.parse(dataStr);
      return { ...this.getDefaultSaveData(), ...parsed };
    } catch (e) {
      console.warn('Failed to load save from localStorage, returning default', e);
      return this.getDefaultSaveData();
    }
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      return false;
    }
  }

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVE_DATA);
      return this.getDefaultSaveData();
    } catch (e) {
      console.error('Failed to reset save data', e);
      return this.getDefaultSaveData();
    }
  }
}

export const saveManager = new SaveManager();
export default saveManager;
