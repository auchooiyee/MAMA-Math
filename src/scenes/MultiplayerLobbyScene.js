import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import multiplayerManager, { MULTIPLAYER_MODES } from '../managers/MultiplayerManager.js';
import audioManager from '../managers/AudioManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class MultiplayerLobbyScene extends Phaser.Scene {
  constructor() {
    super('MultiplayerLobbyScene');
    this.enteredCode = '';
  }

  isPortrait() {
    return this.cameras.main.height > this.cameras.main.width;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createNameBar();
    this.createModeOptions();
    this.createJoinBox();
  }

  createBackground() {
    createWarungBackdrop(this, { dim: 0.14, counter: true });
  }

  createHeader() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;

    // Back Button
    createButton(this, isPortrait ? 90 : 110, isPortrait ? 45 : 45, '← MENU', {
      width: 120,
      height: 40,
      fontSize: '15px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => {
        this.scene.start('MainMenuScene');
      }
    });

    // Title
    this.add.text(cx, isPortrait ? 105 : 42, '👥 ' + localizationManager.t('mp.title'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '26px' : '28px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, isPortrait ? 138 : 72, localizationManager.t('mp.subtitle'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '15px' : '14px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createNameBar() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;
    const y = isPortrait ? 190 : 112;
    const barWidth = isPortrait ? Math.min(660, width - 40) : 520;
    const barHeight = isPortrait ? 46 : 40;
    const halfW = barWidth / 2;

    this.nameBarContainer = this.add.container(cx, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRoundedRect(-halfW, -barHeight / 2, barWidth, barHeight, 12);
    bg.lineStyle(1.5, 0x38bdf8, 0.75);
    bg.strokeRoundedRect(-halfW, -barHeight / 2, barWidth, barHeight, 12);
    this.nameBarContainer.add(bg);

    const icon = this.add.text(-halfW + 15, 0, '👨‍🍳', { fontSize: isPortrait ? '22px' : '20px' }).setOrigin(0, 0.5);
    this.nameBarContainer.add(icon);

    const label = this.add.text(-halfW + 48, 0, localizationManager.t('mp.yourName'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '14px' : '13px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.nameBarContainer.add(label);

    const currentName = multiplayerManager.getPlayerName();
    this.nameText = this.add.text(-halfW + 200, 0, currentName, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '17px' : '16px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.nameBarContainer.add(this.nameText);

    const editBtn = createButton(this, halfW - 65, 0, localizationManager.t('mp.editName'), {
      width: 110,
      height: isPortrait ? 32 : 28,
      fontSize: isPortrait ? '12px' : '11px',
      bgColor: 0x0284c7,
      onClick: () => {
        this.promptPlayerName();
      }
    });
    this.nameBarContainer.add(editBtn.container);

    // Make whole bar interactive
    const hitZone = this.add.zone(-halfW, -barHeight / 2, barWidth, barHeight).setOrigin(0, 0).setInteractive({ cursor: 'pointer' });
    hitZone.on('pointerdown', () => this.promptPlayerName());
    this.nameBarContainer.add(hitZone);
  }

  promptPlayerName() {
    const current = multiplayerManager.getPlayerName();
    const promptMsg = localizationManager.t('mp.enterNamePrompt');
    const input = this.safePrompt(promptMsg, current.startsWith('Chef ') ? '' : current);
    if (input && input.trim()) {
      multiplayerManager.setPlayerName(input.trim());
      if (this.nameText) {
        this.nameText.setText(multiplayerManager.getPlayerName());
      }
    }
  }

  ensurePlayerName() {
    let name = multiplayerManager.getPlayerName();
    // Never block room creation on a browser prompt. Embedded browsers and
    // some mobile WebViews disable `prompt()`, so keep the generated chef
    // name and let players edit it from the visible name control instead.
    if (!name || name.startsWith('Chef ')) {
      name = name || 'Chef';
      multiplayerManager.setPlayerName(name);
      if (this.nameText) this.nameText.setText(name);
    }
    return name;
  }

  safePrompt(message, initial = '') {
    try {
      return window.prompt(message, initial);
    } catch (error) {
      // Phaser's visible UI remains usable when a WebView rejects prompt().
      console.warn('Inline prompt unavailable:', error);
      return null;
    }
  }

  createModeOptions() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;

    if (isPortrait) {
      const startY = 240;
      const stepY = 136;

      // Card 1: 2-Player Co-op
      this.createModeCard(cx, startY + 58, {
        icon: '🍳 + 📐',
        title: localizationManager.t('mp.mode2p'),
        desc: localizationManager.t('mp.mode2pDesc'),
        color: 0x0284c7,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.COOP2, { nickname: name });
          this.scene.start('MultiplayerRoomScene');
        }
      });

      // Card 2: 4-Player Co-op
      this.createModeCard(cx, startY + stepY + 58, {
        icon: '🍳 💰 🥬 🛵',
        title: localizationManager.t('mp.mode4p'),
        desc: localizationManager.t('mp.mode4pDesc'),
        color: 0x059669,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.COOP4, { nickname: name });
          this.scene.start('MultiplayerRoomScene');
        }
      });

      // Card 3: Classroom Mode
      this.createModeCard(cx, startY + stepY * 2 + 58, {
        icon: '🏫 🎓',
        title: localizationManager.t('mp.modeClass'),
        desc: localizationManager.t('mp.modeClassDesc'),
        color: 0x7c3aed,
        btnLabel: 'JOIN →',
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), this.enteredCode || '');
          if (input && input.trim()) {
            this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
            multiplayerManager.joinRoom(this.enteredCode, name);
            this.scene.start('MultiplayerRoomScene');
          }
        }
      });

      // Card 4: Local Shared Screen
      this.createModeCard(cx, startY + stepY * 3 + 58, {
        icon: '🤝 🖥️',
        title: localizationManager.t('mp.modeLocal'),
        desc: localizationManager.t('mp.modeLocalDesc'),
        color: 0xd97706,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.LOCAL, { nickname: name });
          this.scene.start('CoopCookingScene');
        }
      });
    } else {
      const startY = 160;

      // Card 1: 2-Player Co-op (Chef + Math Specialist)
      this.createModeCard(360, startY + 80, {
        icon: '🍳 + 📐',
        title: localizationManager.t('mp.mode2p'),
        desc: localizationManager.t('mp.mode2pDesc'),
        color: 0x0284c7,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.COOP2, { nickname: name });
          this.scene.start('MultiplayerRoomScene');
        }
      });

      // Card 2: 4-Player Co-op (Chef, Cashier, Ingredients, Delivery)
      this.createModeCard(920, startY + 80, {
        icon: '🍳 💰 🥬 🛵',
        title: localizationManager.t('mp.mode4p'),
        desc: localizationManager.t('mp.mode4pDesc'),
        color: 0x059669,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.COOP4, { nickname: name });
          this.scene.start('MultiplayerRoomScene');
        }
      });

      // Card 3: Whole-Classroom Mode (Join with 4-Digit PIN)
      this.createModeCard(360, startY + 260, {
        icon: '🏫 🎓',
        title: localizationManager.t('mp.modeClass'),
        desc: localizationManager.t('mp.modeClassDesc'),
        color: 0x7c3aed,
        btnLabel: 'JOIN →',
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), this.enteredCode || '');
          if (input && input.trim()) {
            this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
            multiplayerManager.joinRoom(this.enteredCode, name);
            this.scene.start('MultiplayerRoomScene');
          }
        }
      });

      // Card 4: Local Shared Screen (Single Device Pass & Play)
      this.createModeCard(920, startY + 260, {
        icon: '🤝 🖥️',
        title: localizationManager.t('mp.modeLocal'),
        desc: localizationManager.t('mp.modeLocalDesc'),
        color: 0xd97706,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;
          multiplayerManager.createRoom(MULTIPLAYER_MODES.LOCAL, { nickname: name });
          this.scene.start('CoopCookingScene');
        }
      });
    }
  }

  createModeCard(x, y, data) {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cardWidth = isPortrait ? Math.min(660, width - 40) : 480;
    const cardHeight = isPortrait ? 122 : 130;
    const halfW = cardWidth / 2;
    const halfH = cardHeight / 2;

    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.9);
    bg.fillRoundedRect(-halfW, -halfH, cardWidth, cardHeight, 16);
    bg.lineStyle(2, data.color, 0.8);
    bg.strokeRoundedRect(-halfW, -halfH, cardWidth, cardHeight, 16);
    card.add(bg);

    const icon = this.add.text(-halfW + 20, isPortrait ? -38 : -40, data.icon, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '22px' : '24px'
    });
    card.add(icon);

    const title = this.add.text(-halfW + 20, isPortrait ? -10 : -8, data.title, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '17px' : '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    card.add(title);

    const desc = this.add.text(-halfW + 20, isPortrait ? 16 : 18, data.desc, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '13px' : '13px',
      color: '#94a3b8',
      wordWrap: { width: isPortrait ? cardWidth - 165 : 330 }
    });
    card.add(desc);

    const btn = createButton(this, halfW - 68, 0, data.btnLabel || localizationManager.t('mp.createRoom'), {
      width: isPortrait ? 115 : 100,
      height: isPortrait ? 44 : 40,
      fontSize: isPortrait ? '14px' : '13px',
      bgColor: data.color,
      onClick: data.onClick
    });
    card.add(btn.container);

    this.add.existing(card);
  }

  createJoinBox() {
    const isPortrait = this.isPortrait();
    const width = this.cameras.main.width;
    const cx = width / 2;

    if (isPortrait) {
      const boxW = Math.min(660, width - 40);
      const boxH = 170;
      const halfW = boxW / 2;
      const container = this.add.container(cx, 885);

      const boxBg = this.add.graphics();
      boxBg.fillStyle(0x0f172a, 0.95);
      boxBg.fillRoundedRect(-halfW, -boxH / 2, boxW, boxH, 16);
      boxBg.lineStyle(2, THEME.primary, 0.9);
      boxBg.strokeRoundedRect(-halfW, -boxH / 2, boxW, boxH, 16);
      container.add(boxBg);

      const label = this.add.text(0, -60, '🚪 ' + localizationManager.t('mp.joinPrompt'), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#f59e0b',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(label);

      const subLabel = this.add.text(0, -36, localizationManager.t('mp.joinHelp'), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      }).setOrigin(0.5);
      container.add(subLabel);

      // Display for the code
      const codeDisplayBg = this.add.graphics();
      codeDisplayBg.fillStyle(0x1e293b, 1);
      codeDisplayBg.fillRoundedRect(-220, -10, 440, 44, 10);
      codeDisplayBg.lineStyle(1.5, 0x38bdf8, 0.75);
      codeDisplayBg.strokeRoundedRect(-220, -10, 440, 44, 10);
      container.add(codeDisplayBg);

      const placeholderText = localizationManager.t('mp.clickToType') || 'TEKAN UNTUK TAIP KOD (4 DIGIT)';
      this.codeText = this.add.text(0, 12, placeholderText, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '17px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(this.codeText);

      // Interactive button over code area to trigger input prompt
      const typeBtn = this.add.zone(0, 12, 440, 44).setInteractive({ cursor: 'pointer' });
      typeBtn.on('pointerdown', () => {
        const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), this.enteredCode || '');
        if (input) {
          this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
          this.codeText.setText(this.enteredCode);
          this.codeText.setColor('#4ade80');
        }
      });
      container.add(typeBtn);

      // Join Button
      const btnJoin = createButton(this, 0, 56, localizationManager.t('mp.joinButton'), {
        width: 440,
        height: 44,
        fontSize: '17px',
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;

          if (!this.enteredCode || this.enteredCode === placeholderText) {
            const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), '');
            if (!input) return;
            this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
          }
          multiplayerManager.joinRoom(this.enteredCode, name);
          this.scene.start('MultiplayerRoomScene');
        }
      });
      container.add(btnJoin.container);
    } else {
      const container = this.add.container(640, 620);

      const boxBg = this.add.graphics();
      boxBg.fillStyle(0x0f172a, 0.95);
      boxBg.fillRoundedRect(-500, -45, 1000, 90, 16);
      boxBg.lineStyle(2, THEME.primary, 0.9);
      boxBg.strokeRoundedRect(-500, -45, 1000, 90, 16);
      container.add(boxBg);

      const label = this.add.text(-470, -25, localizationManager.t('mp.joinPrompt'), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        color: '#f59e0b',
        fontStyle: 'bold'
      });
      container.add(label);

      const subLabel = this.add.text(-470, 2, localizationManager.t('mp.joinHelp'), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      });
      container.add(subLabel);

      // Display for the code
      const codeDisplayBg = this.add.graphics();
      codeDisplayBg.fillStyle(0x1e293b, 1);
      codeDisplayBg.fillRoundedRect(-20, -25, 260, 50, 10);
      container.add(codeDisplayBg);

      this.codeText = this.add.text(110, 0, 'TEKAN UNTUK TAIP', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(this.codeText);

      // Interactive button over code area to trigger input prompt
      const typeBtn = this.add.zone(110, 0, 260, 50).setInteractive({ cursor: 'pointer' });
      typeBtn.on('pointerdown', () => {
        const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), this.enteredCode || '');
        if (input) {
          this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
          this.codeText.setText(this.enteredCode);
          this.codeText.setColor('#4ade80');
        }
      });
      container.add(typeBtn);

      // Join Button
      const btnJoin = createButton(this, 370, 0, localizationManager.t('mp.joinButton'), {
        width: 190,
        height: 48,
        fontSize: '16px',
        bgColor: THEME.secondary,
        bgDarkColor: THEME.secondaryDark,
        onClick: () => {
          const name = this.ensurePlayerName();
          if (!name) return;

          if (!this.enteredCode || this.enteredCode === 'TEKAN UNTUK TAIP' || this.enteredCode === 'CLICK TO TYPE') {
            const input = this.safePrompt(localizationManager.t('mp.enterCodePrompt'), '');
            if (!input) return;
            this.enteredCode = input.trim().toUpperCase().replace(/^WM-/, '');
          }
          multiplayerManager.joinRoom(this.enteredCode, name);
          this.scene.start('MultiplayerRoomScene');
        }
      });
      container.add(btnJoin.container);
    }
  }
}

export default MultiplayerLobbyScene;
