import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import multiplayerManager, { ROLES, ROOM_STATUS, MULTIPLAYER_MODES } from '../managers/MultiplayerManager.js';
import gameManager from '../managers/GameManager.js';
import audioManager from '../managers/AudioManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

export class MultiplayerRoomScene extends Phaser.Scene {
  constructor() {
    super('MultiplayerRoomScene');
    this.unsubscribeRoom = null;
    this.unsubscribeKicked = null;
    this.lastPlayerCount = 1;
  }

  isPortrait() {
    return this.cameras.main.height > this.cameras.main.width;
  }

  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.createBackground();
    this.createTopHUD();
    this.createRoomHeader();
    this.createHostRoleToggle();
    this.renderPlayerSlots();
    this.renderExtraPlayersRoster();
    this.createActionButtons();

    this.lastPlayerCount = multiplayerManager.room?.players?.length || 1;

    // Listen to kicked event (if host kicked this player)
    this.unsubscribeKicked = multiplayerManager.onKicked(() => {
      alert(localizationManager.t('mp.kickedAlert') || 'You have been removed from the room by the Host.');
      this.scene.start('MultiplayerLobbyScene');
    });

    // Listen to real-time state changes (cross-device SSE, auto-polling & same-origin BroadcastChannel)
    this.unsubscribeRoom = multiplayerManager.onStateChange((room) => {
      if (!room) {
        this.scene.start('MultiplayerLobbyScene');
        return;
      }
      if (room.status === ROOM_STATUS.PLAYING) {
        if (room.gameMode === MULTIPLAYER_MODES.CLASSROOM) {
          this.createNetworkBadge();
          if (multiplayerManager.isObservant()) {
            this.createActionButtons();
            return;
          }
          if (!multiplayerManager.getLocalPlayer()?.challengeCompleted) {
            this.startIndividualClassChallenge();
            return;
          }
          this.createActionButtons();
          return;
        }
        this.scene.start('CoopCookingScene');
        return;
      }
      if (room.status === ROOM_STATUS.RESULT && room.gameMode === MULTIPLAYER_MODES.CLASSROOM) {
        this.createNetworkBadge();
        this.createRoomHeader();
        this.renderPlayerSlots();
        this.renderExtraPlayersRoster();
        this.createActionButtons();
        return;
      }
      if (room.status === ROOM_STATUS.CLOSED) {
        alert(localizationManager.t('mp.roomClosedAlert'));
        multiplayerManager.leaveRoom();
        this.scene.start('MultiplayerLobbyScene');
        return;
      }
      if (room.players && room.players.length > this.lastPlayerCount) {
        try {
          audioManager.play('sfx_success');
        } catch (e) {}
        const newPlayer = room.players[room.players.length - 1];
        if (newPlayer && newPlayer.name) {
          this.showJoinToast(`🎉 ${newPlayer.name} ${localizationManager.t('mp.playerJoined') || 'joined the kitchen!'}`);
        }
      }
      this.lastPlayerCount = room.players?.length || 1;
      this.createNetworkBadge();
      this.createRoomHeader();
      this.createHostRoleToggle();
      this.renderPlayerSlots();
      this.renderExtraPlayersRoster();
      this.createActionButtons();
    });
  }

  shutdown() {
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }
    if (this.unsubscribeKicked) {
      this.unsubscribeKicked();
      this.unsubscribeKicked = null;
    }
  }

  showJoinToast(text) {
    if (this.toastContainer) this.toastContainer.destroy();
    const cx = this.cameras.main.width / 2;
    this.toastContainer = this.add.container(cx, 25);
    const bg = this.add.graphics();
    bg.fillStyle(0x065f46, 0.95);
    bg.fillRoundedRect(-240, -18, 480, 36, 12);
    bg.lineStyle(1.5, 0x34d399, 1);
    bg.strokeRoundedRect(-240, -18, 480, 36, 12);
    this.toastContainer.add(bg);

    const msg = this.add.text(0, 0, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.toastContainer.add(msg);

    this.tweens.add({
      targets: this.toastContainer,
      alpha: 0,
      y: 10,
      delay: 3000,
      duration: 600,
      onComplete: () => {
        if (this.toastContainer) this.toastContainer.destroy();
      }
    });
  }

  createBackground() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const cx = w / 2;
    const cy = h / 2;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x18181b, 0x18181b, 0x09090b, 0x09090b, 1);
    bg.fillRect(0, 0, w, h);

    const radial = this.add.graphics();
    radial.fillStyle(0x0284c7, 0.05);
    radial.fillCircle(cx, cy, 420);
  }

  createTopHUD() {
    // Leave Room / Back Button
    createButton(this, 100, 42, '← LOBBY', {
      width: 110,
      height: 38,
      fontSize: '14px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => {
        multiplayerManager.leaveRoom();
        this.scene.start('MultiplayerLobbyScene');
      }
    });

    this.createNetworkBadge();
  }

  createNetworkBadge() {
    if (this.networkBadge) this.networkBadge.destroy();

    const room = multiplayerManager.room;
    if (!room) return;

    const status = multiplayerManager.getNetworkStatus();
    const statusMap = {
      connected: { text: `🟢 ${localizationManager.t('mp.networkLive')}`, color: '#4ade80', border: 0x22c55e },
      connecting: { text: `🟡 ${localizationManager.t('mp.networkConnecting')}`, color: '#facc15', border: 0xeab308 },
      'waiting-host': { text: `🟡 ${localizationManager.t('mp.networkFindingHost')}`, color: '#facc15', border: 0xeab308 },
      'room-not-found': { text: `🔴 ${localizationManager.t('mp.networkRoomNotFound')}`, color: '#fca5a5', border: 0xef4444 },
      'host-left': { text: `🔴 ${localizationManager.t('mp.networkHostLeft')}`, color: '#fca5a5', border: 0xef4444 },
      error: { text: `🔴 ${localizationManager.t('mp.networkError')}`, color: '#fca5a5', border: 0xef4444 },
      closed: { text: `⚪ ${localizationManager.t('mp.networkOffline')}`, color: '#cbd5e1', border: 0x64748b },
      idle: { text: `⚪ ${localizationManager.t('mp.networkReady')}`, color: '#cbd5e1', border: 0x64748b },
      local: { text: `📱 ${localizationManager.t('mp.networkLocal')}`, color: '#7dd3fc', border: 0x0284c7 }
    };
    const display = statusMap[status] || statusMap.local;
    const x = this.cameras.main.width - 112;
    const y = 42;

    this.networkBadge = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.92);
    bg.fillRoundedRect(-92, -18, 184, 36, 18);
    bg.lineStyle(1.5, display.border, 0.9);
    bg.strokeRoundedRect(-92, -18, 184, 36, 18);
    this.networkBadge.add(bg);
    this.networkBadge.add(this.add.text(0, 0, display.text, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: display.color,
      fontStyle: 'bold'
    }).setOrigin(0.5));
  }

  createRoomHeader() {
    const room = multiplayerManager.room;
    if (!room) return;

    if (this.headerContainer) {
      this.headerContainer.destroy();
    }
    const isPort = this.isPortrait();
    const isMs = localizationManager.getLanguage() === 'ms';
    const cx = this.cameras.main.width / 2;
    const headerY = isPort ? 130 : 72;

    this.headerContainer = this.add.container(cx, headerY);

    const banner = this.add.graphics();
    banner.fillStyle(0x0f172a, 0.95);
    const boxW = isPort ? 660 : 780;
    const boxH = isPort ? 105 : 80;
    banner.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
    banner.lineStyle(2, THEME.primary, 0.85);
    banner.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
    this.headerContainer.add(banner);

    const chInfo = (room.targetChapter !== undefined && room.targetChapter !== null)
      ? (room.targetChapter === 0
        ? (isMs ? 'Semua Bab' : 'All Chapters (Mixed)')
        : `${isMs ? 'Bab' : 'Chapter'} ${room.targetChapter}`)
      : '';
    const modeKey = room.gameMode === MULTIPLAYER_MODES.CLASSROOM ? 'mp.modeClass' : 'mp.mode2p';
    const modeTitle = chInfo ? `${localizationManager.t(modeKey)} • 📚 ${chInfo}` : localizationManager.t(modeKey);
    const titleY = isPort ? -30 : -22;
    const title = this.add.text(0, titleY, modeTitle, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '16px' : '17px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.headerContainer.add(title);

    // Prominent 4-digit Room Code Display
    const displayCode = room.classCode || room.roomId;
    const codeLabel = isMs ? `KOD BILIK: ${displayCode}` : `ROOM CODE: ${displayCode}`;
    const codeY = isPort ? 2 : 4;
    const codeText = this.add.text(0, codeY, codeLabel, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '26px' : '25px',
      color: '#38bdf8',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.headerContainer.add(codeText);

    // Live Connected Players Status
    const isHostObservant = (room.hostRoleMode === 'observant');
    const activePlayers = room.players.filter(p => !p.isObservant && p.id !== room.hostId);
    const totalCount = room.players.length;

    let statusText = '';
    let statusColor = '#facc15';

    if (isHostObservant) {
      if (activePlayers.length >= 2) {
        statusText = isMs ? '🟢 2/2 TELEFON BERSEDIA • 👁️ PEMERHATI' : '🟢 2/2 PHONES READY • 👁️ HOST OBSERVANT';
        statusColor = '#4ade80';
      } else {
        statusText = isMs ? `⏳ ${activePlayers.length}/2 TELEFON MENYERTAI • 👁️ PEMERHATI` : `⏳ ${activePlayers.length}/2 PHONES JOINED • 👁️ OBSERVANT`;
      }
    } else {
      const partners = room.players.filter(p => !p.isHost);
      if (partners.length >= 1) {
        statusText = isMs ? `🟢 ${room.players.length} PEMAIN DALAM BILIK` : `🟢 ${room.players.length} PLAYERS IN ROOM (READY TO COOK!)`;
        statusColor = '#4ade80';
      } else {
        statusText = isMs ? `⏳ 1/2 PEMAIN (Menunggu rakan sertai kod ${displayCode}...)` : `⏳ 1/2 PLAYERS (Waiting for a partner to join code ${displayCode}...)`;
      }
    }

    const pillY = isPort ? 32 : 26;
    const statusPill = this.add.text(0, pillY, statusText, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '13px' : '12px',
      color: statusColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.headerContainer.add(statusPill);
  }

  createHostRoleToggle() {
    if (this.hostToggleContainer) {
      this.hostToggleContainer.destroy();
    }

    const room = multiplayerManager.room;
    if (!room) return;

    const isPort = this.isPortrait();
    const isMs = localizationManager.getLanguage() === 'ms';
    const cx = this.cameras.main.width / 2;
    const toggleY = isPort ? 215 : 132;

    this.hostToggleContainer = this.add.container(cx, toggleY);

    if (multiplayerManager.isHost()) {
      const bg = this.add.graphics();
      bg.fillStyle(0x1e293b, 0.9);
      const boxW = isPort ? 660 : 640;
      const boxH = isPort ? 44 : 36;
      bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 18);
      bg.lineStyle(1.5, 0x0284c7, 0.6);
      bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 18);
      this.hostToggleContainer.add(bg);

      const labelX = isPort ? -310 : -300;
      const label = this.add.text(labelX, 0, localizationManager.t('mp.hostModeLabel') || 'HOST ROLE:', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '13px' : '13px',
        color: '#f59e0b',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      this.hostToggleContainer.add(label);

      const isObservant = (room.hostRoleMode === 'observant');

      // Play Together Button
      const playBtnX = isPort ? -75 : -30;
      const btnPlay = createButton(this, playBtnX, 0, localizationManager.t('mp.hostModePlay') || '🎮 PLAY TOGETHER', {
        width: isPort ? 170 : 170,
        height: isPort ? 32 : 28,
        fontSize: '12px',
        bgColor: !isObservant ? 0x059669 : 0x334155,
        bgDarkColor: !isObservant ? 0x047857 : 0x1e293b,
        onClick: () => {
          multiplayerManager.setHostRoleMode('play');
        }
      });
      this.hostToggleContainer.add(btnPlay.container);

      // Observant Button
      const obsBtnX = isPort ? 125 : 170;
      const btnObs = createButton(this, obsBtnX, 0, localizationManager.t('mp.hostModeObservant') || '👁️ OBSERVANT (TEACHER)', {
        width: isPort ? 210 : 200,
        height: isPort ? 32 : 28,
        fontSize: '12px',
        bgColor: isObservant ? 0x7c3aed : 0x334155,
        bgDarkColor: isObservant ? 0x6d28d9 : 0x1e293b,
        onClick: () => {
          multiplayerManager.setHostRoleMode('observant');
        }
      });
      this.hostToggleContainer.add(btnObs.container);
    } else {
      const hostP = room.players.find(p => p.isHost);
      const isObservant = (room.hostRoleMode === 'observant');
      const hostName = hostP ? hostP.name : 'Host';
      const hostRoleDesc = isObservant ? '👁️ OBSERVANT / TEACHER' : '🍳 CO-CHEF';

      const tagText = this.add.text(0, 0, `${isMs ? '👑 TUAN RUMAH' : '👑 HOST'}: ${hostName} (${hostRoleDesc})`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '13px' : '13px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.hostToggleContainer.add(tagText);
    }
  }

  renderPlayerSlots() {
    if (this.slotsContainer) {
      this.slotsContainer.destroy();
    }

    const room = multiplayerManager.room;
    if (!room) return;

    const isPort = this.isPortrait();
    const isMs = localizationManager.getLanguage() === 'ms';
    const cx = this.cameras.main.width / 2;
    const isHostObservant = (room.hostRoleMode === 'observant');

    let slot0Player = null;
    let slot1Player = null;
    let slot0Header = '';
    let slot1Header = '';

    if (isHostObservant) {
      const nonHostPlayers = room.players.filter(p => !p.isObservant && p.id !== room.hostId);
      slot0Player = nonHostPlayers[0] || null;
      slot1Player = nonHostPlayers[1] || null;
      slot0Header = '👨‍🍳 CHEF 1 (TELEFON 1)';
      slot1Header = '📐 CHEF 2 / MATH (TELEFON 2)';
    } else {
      const hostPlayer = room.players.find(p => p.id === room.hostId);
      const partnerPlayer = room.players.find(p => p.id !== room.hostId);
      slot0Player = hostPlayer || null;
      slot1Player = partnerPlayer || null;
      slot0Header = isMs ? '👑 TUAN RUMAH (HOST / CHEF)' : '👑 HOST (CHEF)';
      slot1Header = isMs ? '🤝 RAKAN (PARTNER / TELEFON)' : '🤝 PARTNER';
    }

    if (isPort) {
      this.slotsContainer = this.add.container(cx, 270);
      this.renderSingleSlot(0, 100, 660, slot0Player, 0, slot0Header);
      this.renderSingleSlot(0, 365, 660, slot1Player, 1, slot1Header);
    } else {
      this.slotsContainer = this.add.container(640, 310);
      const slotW = 380;
      const totalW = 2 * slotW;
      const startX = -totalW / 2 + slotW / 2;
      this.renderSingleSlot(startX, 0, slotW - 20, slot0Player, 0, slot0Header);
      this.renderSingleSlot(startX + slotW, 0, slotW - 20, slot1Player, 1, slot1Header);
    }
  }

  renderSingleSlot(x, y, width, player, slotIndex, headerLabel) {
    const isPort = this.isPortrait();
    const isMs = localizationManager.getLanguage() === 'ms';
    const slot = this.add.container(x, y);

    const slotH = isPort ? 230 : 240;
    const bg = this.add.graphics();
    bg.fillStyle(player ? 0x1e293b : 0x0f172a, 0.95);
    bg.fillRoundedRect(-width / 2, -slotH / 2, width, slotH, 16);
    bg.lineStyle(2, player ? (player.isReady ? 0x10b981 : THEME.primary) : 0x334155, 0.8);
    bg.strokeRoundedRect(-width / 2, -slotH / 2, width, slotH, 16);
    slot.add(bg);

    if (player) {
      const roleBadge = this.add.text(0, isPort ? -94 : -98, headerLabel, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '13px' : '12px',
        color: player.isHost ? '#f59e0b' : '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      slot.add(roleBadge);

      const roleObj = Object.values(ROLES).find(r => r.id === player.role) || ROLES.CHEF;
      const icon = this.add.text(0, isPort ? -64 : -66, roleObj.icon, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '36px' : '36px'
      }).setOrigin(0.5);
      slot.add(icon);

      const name = this.add.text(0, isPort ? -22 : -24, player.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '21px' : '19px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      slot.add(name);

      const roleText = this.add.text(0, isPort ? 5 : 3, localizationManager.t(roleObj.nameKey), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '15px' : '14px',
        color: '#facc15'
      }).setOrigin(0.5);
      slot.add(roleText);

      if (player.id === multiplayerManager.localPlayerId) {
        const btnRole = createButton(this, 0, isPort ? 40 : 42, localizationManager.t('mp.switchRole'), {
          width: isPort ? 160 : 140,
          height: 32,
          fontSize: '12px',
          bgColor: 0x0284c7,
          onClick: () => {
            const nextRole = player.role === ROLES.CHEF.id ? ROLES.MATH.id : ROLES.CHEF.id;
            multiplayerManager.setRole(nextRole);
          }
        });
        slot.add(btnRole.container);
      } else if (multiplayerManager.isHost()) {
        const btnKick = createButton(this, 0, isPort ? 40 : 42, localizationManager.t('mp.kickPlayer'), {
          width: isPort ? 160 : 150,
          height: 32,
          fontSize: '12px',
          bgColor: 0xdc2626,
          bgDarkColor: 0x991b1b,
          onClick: () => {
            const confirmMsg = localizationManager.t('mp.kickConfirm', { name: player.name });
            if (confirm(confirmMsg)) {
              multiplayerManager.kickPlayer(player.id);
            }
          }
        });
        slot.add(btnKick.container);
      }

      const readyBg = this.add.graphics();
      readyBg.fillStyle(player.isReady ? 0x065f46 : 0x7f1d1d, 1);
      readyBg.fillRoundedRect(-width / 2 + 16, isPort ? 74 : 75, width - 32, 30, 8);
      slot.add(readyBg);

      const readyText = this.add.text(0, isPort ? 89 : 91,
        player.isReady ? (isMs ? '✓ BERSEDIA' : '✓ READY') : (isMs ? '⏳ BELUM BERSEDIA' : '⏳ NOT READY'), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: player.isReady ? '#6ee7b7' : '#fca5a5',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      slot.add(readyText);

    } else {
      const waitingIcon = this.add.text(0, -68, '⏳', { fontSize: '32px' }).setOrigin(0.5);
      slot.add(waitingIcon);

      const waitingText = this.add.text(0, -22, isMs ? 'MENUNGGU RAKAN...' : 'WAITING FOR PARTNER', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#facc15',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      slot.add(waitingText);

      const room = multiplayerManager.room;
      const lanUrl = (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') ? window.location.host : '192.168.0.122:3000';
      const displayCode = room ? (room.classCode || room.roomId) : '4829';
      const tipText = this.add.text(0, 38, isMs
        ? `Buka di telefon rakan:\nhttp://${lanUrl}\nKod Bilik: ${displayCode}`
        : `Open on your partner's phone:\nhttp://${lanUrl}\nRoom Code: ${displayCode}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: width - 30 }
      }).setOrigin(0.5);
      slot.add(tipText);
    }

    this.slotsContainer.add(slot);
  }

  renderExtraPlayersRoster() {
    if (this.rosterContainer) {
      this.rosterContainer.destroy();
    }

    const room = multiplayerManager.room;
    if (!room) return;

    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const rosterY = isPort ? 760 : 480;

    this.rosterContainer = this.add.container(cx, rosterY);

    const isHostObservant = (room.hostRoleMode === 'observant');
    const activePlayers = isHostObservant
      ? room.players.filter(p => !p.isObservant && p.id !== room.hostId)
      : room.players.filter(p => !p.isHost);

    const extraPlayers = activePlayers.slice(isHostObservant ? 2 : 1);
    if (extraPlayers.length === 0) return;

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    const boxW = isPort ? 660 : 760;
    bg.fillRoundedRect(-boxW / 2, -20, boxW, 42, 10);
    bg.lineStyle(1.5, 0x0284c7, 0.5);
    bg.strokeRoundedRect(-boxW / 2, -20, boxW, 42, 10);
    this.rosterContainer.add(bg);

    const title = this.add.text(isPort ? -310 : -360, 0, '👥 PEMAIN LAIN:', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.rosterContainer.add(title);

    let curX = isPort ? -200 : -250;
    for (const ep of extraPlayers) {
      const chip = this.add.container(curX, 0);
      const chipBg = this.add.graphics();
      chipBg.fillStyle(0x1e293b, 1);
      chipBg.fillRoundedRect(0, -14, 150, 28, 6);
      chipBg.lineStyle(1, 0x334155, 1);
      chipBg.strokeRoundedRect(0, -14, 150, 28, 6);
      chip.add(chipBg);

      const nameText = this.add.text(10, 0, `📱 ${ep.name}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      chip.add(nameText);

      if (multiplayerManager.isHost()) {
        const kickZone = this.add.text(130, 0, '✕', {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '13px',
          color: '#ef4444',
          fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        kickZone.on('pointerdown', () => {
          if (confirm(localizationManager.t('mp.kickConfirm', { name: ep.name }))) {
            multiplayerManager.kickPlayer(ep.id);
          }
        });
        chip.add(kickZone);
      }

      this.rosterContainer.add(chip);
      curX += 160;
    }
  }

  createActionButtons() {
    if (this.actionContainer) {
      this.actionContainer.destroy();
    }

    const room = multiplayerManager.room;
    if (!room) return;

    const isPort = this.isPortrait();
    const isMs = localizationManager.getLanguage() === 'ms';
    const cx = this.cameras.main.width / 2;
    const actionY = isPort ? 850 : 565;

    this.actionContainer = this.add.container(cx, actionY);

    if (room.gameMode === MULTIPLAYER_MODES.CLASSROOM &&
        (room.status === ROOM_STATUS.PLAYING || room.status === ROOM_STATUS.RESULT)) {
      const localPlayer = multiplayerManager.getLocalPlayer();
      if (multiplayerManager.isObservant()) {
        const ended = room.status === ROOM_STATUS.RESULT;
        const title = this.add.text(0, -135, ended ? localizationManager.t('mp.classEnded') : localizationManager.t('mp.classLiveStandings'), {
          fontFamily: 'Fredoka, sans-serif', fontSize: isPort ? '19px' : '17px',
          color: '#facc15', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.actionContainer.add(title);
        const ranked = [...room.players]
          .filter(player => !player.isObservant)
          .sort((a, b) => (b.challengePoints || 0) - (a.challengePoints || 0));
        const rows = ranked.length ? ranked : [{ name: localizationManager.t('mp.classWaitingStudents'), challengePoints: 0 }];
        const visibleRows = rows.slice(0, 30);
        const rowsPerColumn = Math.ceil(visibleRows.length / 3);
        visibleRows.forEach((player, index) => {
          const column = Math.floor(index / rowsPerColumn);
          const rowIndex = index % rowsPerColumn;
          const status = player.challengeCompleted ? ` • ${localizationManager.t('mp.classComplete')}` : '';
          const row = this.add.text((column - 1) * (isPort ? 205 : 250), -105 + rowIndex * 22,
            `${index + 1}. ${player.name} — ${player.challengePoints || 0} PTS${status}`, {
              fontFamily: 'Nunito, sans-serif', fontSize: isPort ? '13px' : '12px',
              color: player.challengeCompleted ? '#6ee7b7' : '#fff7e6', fontStyle: 'bold'
            }).setOrigin(0.5);
          this.actionContainer.add(row);
        });
        if (!ended) {
          const endButton = createButton(this, isPort ? 0 : 400, isPort ? 215 : -135, localizationManager.t('mp.classEndChallenge'), {
            width: isPort ? 420 : 250, height: isPort ? 58 : 48,
            fontSize: isPort ? '18px' : '16px', bgColor: 0xdc2626, bgDarkColor: 0xb91c1c,
            onClick: () => multiplayerManager.endClassroomChallenge('host-ended')
          });
          this.actionContainer.add(endButton.container);
        }
      } else if (localPlayer?.challengeCompleted) {
        const done = this.add.text(0, 0,
          ended
            ? `${localizationManager.t('mp.classEnded')}\n${localizationManager.t('mp.classYourComplete', { points: localPlayer.challengePoints || 0 })}`
            : localizationManager.t('mp.classYourComplete', { points: localPlayer.challengePoints || 0 }), {
            fontFamily: 'Fredoka, sans-serif', fontSize: isPort ? '18px' : '16px',
            color: '#6ee7b7', fontStyle: 'bold'
          }).setOrigin(0.5);
        this.actionContainer.add(done);
      } else {
        const waiting = this.add.text(0, 0, localizationManager.t('mp.classReadyHere'), {
          fontFamily: 'Nunito, sans-serif', fontSize: isPort ? '16px' : '14px', color: '#fff7e6'
        }).setOrigin(0.5);
        this.actionContainer.add(waiting);
      }
      return;
    }

    const isHost = multiplayerManager.isHost();
    const isHostObservant = (room.hostRoleMode === 'observant');
    const activePlayers = isHostObservant
      ? room.players.filter(p => !p.isObservant && p.id !== room.hostId)
      : room.players.filter(p => !p.isHost);

    const hasEnoughPlayers = isHostObservant ? (activePlayers.length >= 2) : (room.players.length >= 2);

    if (isHost) {
      const btnColor = hasEnoughPlayers ? 0x059669 : THEME.secondary;
      const btnDark = hasEnoughPlayers ? 0x047857 : THEME.secondaryDark;

      let btnTitle = '';
      if (isHostObservant) {
        btnTitle = hasEnoughPlayers
          ? (isMs ? '🚀 MULAKAN CABARAN KELAS (2/2 TELEFON BERSEDIA!)' : '🚀 START CLASS CHALLENGE (2/2 PHONES READY!)')
          : (isMs ? '🚀 MULAKAN KELAS (MOD PEMERHATI)' : '🚀 START CLASS (OBSERVANT MODE)');
      } else {
        btnTitle = hasEnoughPlayers
          ? '🚀 ' + localizationManager.t('mp.startMission') + ' (2/2 READY!)'
          : '🚀 ' + localizationManager.t('mp.startMission') + ' (SOLO / TEST)';
      }

      const btnW = isPort ? 640 : 380;
      const btnH = isPort ? 58 : 52;
      const fontSz = isPort ? '18px' : '17px';

      const btnStart = createButton(this, 0, 0, btnTitle, {
        width: btnW,
        height: btnH,
        fontSize: fontSz,
        bgColor: btnColor,
        bgDarkColor: btnDark,
        onClick: () => {
          const room = multiplayerManager.room;
          const missionId = room?.missionId || 'M01-01';
          gameManager.startMission(missionId);
          multiplayerManager.startCoopGame(missionId);
          if (room?.gameMode === MULTIPLAYER_MODES.CLASSROOM) {
            if (!multiplayerManager.isObservant()) this.startIndividualClassChallenge();
            else this.createActionButtons();
          } else {
            this.scene.start('CoopCookingScene');
          }
        }
      });
      this.actionContainer.add(btnStart.container);

      const hintText = hasEnoughPlayers
        ? (isMs ? 'Pemain bersedia! Tuan Rumah boleh memulakan permainan sekarang.' : 'Players are ready! The host can start now.')
        : (isHostObservant
          ? (isMs ? 'Minta 2 murid masukkan Kod Bilik di telefon untuk bermain!' : 'Ask 2 students to enter the room code on their phones!')
          : (isMs ? 'Tip: Tunggu rakan masuk bilik atau buka tab ke-2 untuk Co-op sebenar!' : 'Tip: Wait for a partner or open a second tab for true co-op!'));

      const hint = this.add.text(0, isPort ? 48 : 42, hintText, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: isPort ? '14px' : '13px',
        color: hasEnoughPlayers ? '#34d399' : '#94a3b8'
      }).setOrigin(0.5);
      this.actionContainer.add(hint);
    } else {
      // Non-host (partner) waiting prompt
      const waitBg = this.add.graphics();
      waitBg.fillStyle(0x1e293b, 0.9);
      const boxW = isPort ? 640 : 440;
      waitBg.fillRoundedRect(-boxW / 2, -25, boxW, 50, 12);
      waitBg.lineStyle(1.5, 0x0284c7, 0.8);
      waitBg.strokeRoundedRect(-boxW / 2, -25, boxW, 50, 12);
      this.actionContainer.add(waitBg);

      const waitMsg = this.add.text(0, 0, isMs ? '⏳ MENUNGGU TUAN RUMAH MEMULAKAN PERMAINAN...' : '⏳ WAITING FOR THE HOST TO START...', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '16px' : '14px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.actionContainer.add(waitMsg);

      const sub = this.add.text(0, 36, 'Waiting for Host to click Start Mission...', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#94a3b8'
      }).setOrigin(0.5);
      this.actionContainer.add(sub);
    }
  }

  startIndividualClassChallenge() {
    const room = multiplayerManager.room;
    if (!room || room.gameMode !== MULTIPLAYER_MODES.CLASSROOM) return;
    this.scene.start('MathChallengeScene', {
      isIndividualClassroom: true,
      chapter: room.targetChapter ?? 1,
      difficulty: room.difficulty || 'medium',
      questionCount: room.questionCount || 10,
      timeLimitMinutes: room.timeLimitMinutes || 10,
      challengeDeadline: room.challengeDeadline
    });
  }
}

export default MultiplayerRoomScene;
