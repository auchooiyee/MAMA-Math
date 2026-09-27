import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MainMenuScene from '../scenes/MainMenuScene.js';
import RestaurantScene from '../scenes/RestaurantScene.js';
import WorldMapScene from '../scenes/WorldMapScene.js';
import MissionSelectScene from '../scenes/MissionSelectScene.js';
import CookingScene from '../scenes/CookingScene.js';
import MathChallengeScene from '../scenes/MathChallengeScene.js';
import ResultScene from '../scenes/ResultScene.js';
import MultiplayerLobbyScene from '../scenes/MultiplayerLobbyScene.js';
import MultiplayerRoomScene from '../scenes/MultiplayerRoomScene.js';
import CoopCookingScene from '../scenes/CoopCookingScene.js';
import AchievementsScene from '../scenes/AchievementsScene.js';
import TeacherDashboardScene from '../scenes/TeacherDashboardScene.js';
import TeacherChallengeScene from '../scenes/TeacherChallengeScene.js';
import DailyChallengeScene from '../scenes/DailyChallengeScene.js';
import BossBattleScene from '../scenes/BossBattleScene.js';

export function getGameConfig() {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'game-container',
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    input: {
      activePointers: 3
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      BootScene,
      PreloadScene,
    MainMenuScene,
    RestaurantScene,
    WorldMapScene,
    MissionSelectScene,
    CookingScene,
    MathChallengeScene,
    ResultScene,
    MultiplayerLobbyScene,
    MultiplayerRoomScene,
    CoopCookingScene,
    AchievementsScene,
    TeacherDashboardScene,
    TeacherChallengeScene,
      DailyChallengeScene,
      BossBattleScene
    ]
  };
}

export const gameConfig = getGameConfig();
export default gameConfig;
