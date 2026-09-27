import Phaser from 'phaser';
import gameManager from '../managers/GameManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    gameManager.init();
    this.scene.start('PreloadScene');
  }
}

export default BootScene;
