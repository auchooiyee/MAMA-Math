import saveManager from './SaveManager.js';
import playerManager from './PlayerManager.js';
import localizationManager from './LocalizationManager.js';
import audioManager from './AudioManager.js';
import recipeManager from './RecipeManager.js';
import cookingManager from './CookingManager.js';
import questionManager from './QuestionManager.js';
import economyManager from './EconomyManager.js';
import badgeManager from './BadgeManager.js';
import missionsData from '../data/missions.json' with { type: 'json' };

class GameManager {
  constructor() {
    this.isInitialized = false;
    this.currentMission = null;
    this.saveData = null;
    this.missions = new Map();
  }

  init() {
    if (this.isInitialized) return;

    this.saveData = saveManager.load();
    localizationManager.init(this.saveData.settings.language);
    playerManager.init(this.saveData);
    badgeManager.init(this.saveData);
    audioManager.setSoundEnabled(this.saveData.settings.soundEnabled);
    audioManager.setMusicEnabled(this.saveData.settings.musicEnabled);

    missionsData.forEach(m => this.missions.set(m.id, m));

    this.isInitialized = true;
  }

  saveCurrentState() {
    const data = {
      ...this.saveData,
      player: playerManager.player,
      equipment: playerManager.equipment,
      completedMissions: playerManager.completedMissions,
      badges: badgeManager.toJSON(),
      stats: playerManager.stats,
      settings: {
        language: localizationManager.getLanguage(),
        soundEnabled: audioManager.soundEnabled,
        musicEnabled: audioManager.musicEnabled
      }
    };
    this.saveData = data;
    saveManager.save(data);
  }

  getMission(id) {
    return this.missions.get(id);
  }

  startMission(missionId) {
    const mission = this.getMission(missionId);
    if (!mission) throw new Error(`Mission ${missionId} not found`);
    this.currentMission = mission;
    const recipe = recipeManager.getRecipe(mission.recipeId);
    cookingManager.startRecipe(recipe);
    return { mission, recipe };
  }

  startCustomMission(mission) {
    if (!mission?.recipeId) throw new Error('Custom mission requires recipeId');
    const recipe = recipeManager.getRecipe(mission.recipeId);
    if (!recipe) throw new Error(`Recipe ${mission.recipeId} not found`);
    this.currentMission = mission;
    cookingManager.startRecipe(recipe);
    return { mission, recipe };
  }
}

export const gameManager = new GameManager();
export default gameManager;
