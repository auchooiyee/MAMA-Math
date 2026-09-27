import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createMiniGameShell, setMiniGameInteractive } from '../ui/miniGameShell.js';

export class RouteGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.onComplete = options.onComplete || (() => {});
    this.isCompleted = false;

    this.container = this.scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    createMiniGameShell(this.scene, this.container, 'DELIVERY ROUTE', 'Choose the shortest route to the customer');
    const board = this.scene.add.graphics();
    board.fillStyle(THEME.panelLight, 0.98);
    board.fillRoundedRect(-320, -160, 640, 320, 20);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-320, -160, 640, 320, 20);
    this.container.add(board);

    this.instructionText = this.scene.add.text(0, -190, localizationManager.t('cooking.routeInstruction'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.instructionText);
    this.feedbackText = this.scene.add.text(0, 145, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '16px', color: THEME.textDark, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Network Nodes: K (-200, 0), A (-60, -60), B (-60, 60), C (160, 0)
    const netG = this.scene.add.graphics();
    netG.lineStyle(3, 0x64748b, 1);
    netG.lineBetween(-200, 0, -60, -60); // K-A (3km)
    netG.lineBetween(-200, 0, -60, 60);  // K-B (5km)
    netG.lineBetween(-60, -60, 160, 0);  // A-C (6km)
    netG.lineBetween(-60, 60, 160, 0);   // B-C (3km)
    this.container.add(netG);

    // Draw Nodes
    this.drawNode(-200, 0, 'K');
    this.drawNode(-60, -60, 'A (3km)');
    this.drawNode(-60, 60, 'B (5km)');
    this.drawNode(160, 0, 'C');

    // Route Buttons
    this.createRouteBtn(-120, 110, 'Route 1: K → B → C (8 km)', true);
    this.createRouteBtn(120, 110, 'Route 2: K → A → C (9 km)', false);
  }

  drawNode(x, y, label) {
    const node = this.scene.add.graphics();
    node.fillStyle(THEME.secondary, 1);
    node.fillCircle(x, y, 22);
    node.lineStyle(2, 0xffffff, 1);
    node.strokeCircle(x, y, 22);
    this.container.add(node);

    const txt = this.scene.add.text(x, y, label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(txt);
  }

  createRouteBtn(x, y, label, isShortest) {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x334155, 1);
    bg.fillRoundedRect(-110, -20, 220, 40, 10);
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.add(bg);
    btn.add(txt);
    setMiniGameInteractive(btn, 220, 40);
    btn.on('pointerdown', () => {
      if (this.isCompleted) return;
      if (isShortest) {
        audioManager.playCorrect();
        this.isCompleted = true;
        this.feedbackText.setText(localizationManager.getLanguage() === 'ms'
          ? 'Laluan terpendek dipilih — 8 km!'
          : 'Shortest route selected — 8 km!').setColor('#15803d');
        this.scene.time.delayedCall(700, () => {
          this.destroy();
          this.onComplete(1.0);
        });
      } else {
        audioManager.playWrong();
        this.feedbackText.setText(localizationManager.getLanguage() === 'ms'
          ? 'Belum — bandingkan jumlah jarak kedua-dua laluan.'
          : 'Not yet — compare the total distance of both routes.').setColor('#b91c1c');
      }
    });
    this.container.add(btn);
  }

  destroy() {
    this.container.destroy();
  }
}

export default RouteGame;
