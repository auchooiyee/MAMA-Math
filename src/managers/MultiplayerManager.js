import realtimeRoomService from '../services/RealtimeRoomService.js';

export function normalizeRoomId(id) {
  if (!id) return '';
  return String(id).trim().toUpperCase().replace(/^WM-/, '');
}

export const MULTIPLAYER_MODES = {
  COOP2: 'coop2',         // 2-Player Co-op (Chef + Math Specialist)
  COOP4: 'coop4',         // 4-Player Co-op (Chef + Cashier + Ingredient + Delivery)
  CLASSROOM: 'classroom', // Whole-Class Challenge (e.g. AMC-F4-2026)
  LOCAL: 'local'          // Local Shared Screen / Pass & Play
};

export const ROLES = {
  CHEF: { id: 'chef', nameKey: 'mp.roleChef', icon: '🍳', descKey: 'mp.roleChefDesc' },
  MATH: { id: 'math', nameKey: 'mp.roleMath', icon: '📐', descKey: 'mp.roleMathDesc' },
  CASHIER: { id: 'cashier', nameKey: 'mp.roleCashier', icon: '💰', descKey: 'mp.roleCashierDesc' },
  INGREDIENTS: { id: 'ingredients', nameKey: 'mp.roleIngredients', icon: '🥬', descKey: 'mp.roleIngredientsDesc' },
  DELIVERY: { id: 'delivery', nameKey: 'mp.roleDelivery', icon: '🛵', descKey: 'mp.roleDeliveryDesc' },
  OBSERVANT: { id: 'observant', nameKey: 'mp.roleObservant', icon: '👁️', descKey: 'mp.roleObservantDesc' }
};

export const ROOM_STATUS = {
  WAITING: 'WAITING',
  READY: 'READY',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT',
  CLOSED: 'CLOSED'
};

class MultiplayerManager {
  constructor() {
    this.localPlayerId = 'player_' + Math.floor(Math.random() * 10000);
    const savedName = (typeof window !== 'undefined' && window.localStorage)
      ? window.localStorage.getItem('math_mama_player_name')
      : null;
    this.localPlayerName = savedName || ('Chef ' + this.localPlayerId.slice(-4));
    this.room = null;
    this.channel = null;
    this.eventSource = null;
    this.pollTimer = null;
    this.hostDiscoveryTimer = null;
    this.stateListeners = new Set();
    this.kickedListeners = new Set();
    this.networkStatus = realtimeRoomService.isConfigured() ? 'idle' : 'local';
    this.initChannel();
  }

  setPlayerName(name) {
    if (!name || !name.trim()) return;
    const cleanName = name.trim().slice(0, 20);
    this.localPlayerName = cleanName;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('math_mama_player_name', cleanName);
      } catch (e) {}
    }
    const localP = this.getLocalPlayer();
    if (localP) {
      localP.name = cleanName;
      this.broadcast({
        type: 'PLAYER_UPDATE',
        player: { id: this.localPlayerId, name: cleanName }
      });
      realtimeRoomService.updatePresence(localP).catch(() => {});
      this.notifyStateListeners();
    }
  }

  getPlayerName() {
    return this.localPlayerName;
  }

  initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('math_mama_coop_bus');
        this.channel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported in this environment, using local fallback:', err);
      }
    }
  }

  connectNetwork(roomId) {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    const normRoomId = normalizeRoomId(roomId);

    // Pass-and-play stays entirely on the current device. Hosted Realtime is
    // reserved for classroom and cross-device co-op sessions.
    if (!this.isOnlineRoom()) {
      this.networkStatus = 'local';
      return;
    }

    // Production path: ephemeral Supabase Broadcast + Presence. No scores or
    // permanent leaderboard records are written. Without configuration, the
    // existing LAN SSE/polling transport remains available for local testing.
    if (realtimeRoomService.isConfigured()) {
      const localPlayer = this.getLocalPlayer();
      realtimeRoomService.connect(normRoomId, localPlayer, {
        onMessage: (message) => this.handleBroadcastMessage(message),
        onStatus: (status) => {
          if (status === 'connected') {
            if (this.isHost()) {
              this.networkStatus = 'connected';
              this.broadcastSync();
            } else if (this.room?.hostId && this.room.hostId !== 'host_unknown') {
              this.confirmHostConnection();
            } else {
              this.networkStatus = 'waiting-host';
              this.armHostDiscoveryTimeout();
            }
          } else {
            this.networkStatus = status;
          }
          this.notifyStateListeners();
        }
      }).catch((error) => {
        this.networkStatus = 'error';
        console.warn('Realtime connection error:', error);
        this.notifyStateListeners();
      });
      return;
    }

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        const sseUrl = `/api/multiplayer/events?roomId=${encodeURIComponent(normRoomId)}&playerId=${encodeURIComponent(this.localPlayerId)}`;
        this.eventSource = new EventSource(sseUrl);
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type) {
              this.handleBroadcastMessage(data);
            }
          } catch (err) {}
        };
        this.eventSource.onerror = () => {
          // Reconnection is handled automatically by EventSource
        };
      } catch (err) {
        console.warn('EventSource network sync unavailable:', err);
      }
    }

    // Polling fallback: auto-fetches room state every 1.5s so mobile Safari/Chrome never miss players
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      this.pollTimer = setInterval(async () => {
        if (!this.room || normalizeRoomId(this.room.roomId) !== normRoomId) {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
          return;
        }
        try {
          const res = await fetch(`/api/multiplayer/room?roomId=${encodeURIComponent(normRoomId)}`);
          if (res.ok) {
            const json = await res.json();
            if (json && json.room && json.room.players) {
              this.handleSyncFromPolling(json.room);
            }
          }
        } catch (e) {}
      }, 1500);
    }
  }

  handleSyncFromPolling(serverRoom) {
    if (!this.room || normalizeRoomId(this.room.roomId) !== normalizeRoomId(serverRoom.roomId)) return;
    const localP = this.getLocalPlayer();
    const serverPlayers = serverRoom.players || [];

    // If local player is not in server's list yet, re-announce join
    if (localP && !localP.isHost && !serverPlayers.some(p => p.id === localP.id)) {
      this.broadcast({
        type: 'PLAYER_JOINED',
        player: localP
      });
    }

    const currentIds = this.room.players.map(p => p.id).sort().join(',');
    const newIds = serverPlayers.map(p => p.id).sort().join(',');

    if (currentIds !== newIds || this.room.status !== serverRoom.status || this.room.hostRoleMode !== serverRoom.hostRoleMode) {
      const merged = [...serverPlayers];
      if (localP && !merged.some(p => p.id === localP.id)) {
        merged.push(localP);
      }
      this.room = {
        ...this.room,
        ...serverRoom,
        players: merged,
        hostRoleMode: serverRoom.hostRoleMode || this.room.hostRoleMode
      };
      this.notifyStateListeners();
    }
  }

  handleBroadcastMessage(msg) {
    if (!msg || !this.room) return;
    if (msg.roomId && normalizeRoomId(msg.roomId) !== normalizeRoomId(this.room.roomId)) return;

    switch (msg.type) {
      case 'SYNC_STATE':
        if (msg.room) {
          const localP = this.getLocalPlayer();
          const incomingPlayers = msg.room.players || [];
          const mergedPlayers = [...incomingPlayers];
          if (localP && !mergedPlayers.some(p => p.id === localP.id)) {
            mergedPlayers.push(localP);
          }
          this.room = { ...this.room, ...msg.room, players: mergedPlayers };
          this.confirmHostConnection();
          this.notifyStateListeners();
        }
        break;

      case 'PLAYER_JOINED':
        if (msg.player) {
          const existingIndex = this.room.players.findIndex(p => p.id === msg.player.id);
          if (existingIndex >= 0) {
            this.room.players[existingIndex] = { ...this.room.players[existingIndex], ...msg.player };
          } else {
            this.room.players.push(msg.player);
          }
          this.notifyStateListeners();
          if (this.isHost()) {
            this.broadcastSync();
          }
        }
        break;

      case 'PLAYER_UPDATE':
        const idx = this.room.players.findIndex(p => p.id === msg.player.id);
        if (idx >= 0) {
          this.room.players[idx] = { ...this.room.players[idx], ...msg.player };
          this.notifyStateListeners();
        }
        break;

      case 'PLAYER_LEFT':
        if (msg.playerId === this.room.hostId && msg.playerId !== this.localPlayerId) {
          this.room.status = ROOM_STATUS.CLOSED;
          this.networkStatus = 'host-left';
        }
        this.room.players = this.room.players.filter(p => p.id !== msg.playerId);
        this.notifyStateListeners();
        break;

      case 'ROOM_CLOSED':
        if (!this.isHost()) {
          this.room.status = ROOM_STATUS.CLOSED;
          this.networkStatus = 'host-left';
          this.notifyStateListeners();
        }
        break;

      case 'KICK_PLAYER':
        if (msg.playerId === this.localPlayerId) {
          // Local player was kicked by host
          this.leaveRoom();
          this.notifyKickedListeners();
          return;
        }
        if (this.room) {
          this.room.players = this.room.players.filter(p => p.id !== msg.playerId);
          this.notifyStateListeners();
        }
        break;

      case 'START_GAME':
        this.room.status = ROOM_STATUS.PLAYING;
        this.room.missionId = msg.missionId || this.room.missionId;
        if (msg.targetChapter !== undefined) this.room.targetChapter = msg.targetChapter;
        if (msg.difficulty) this.room.difficulty = msg.difficulty;
        if (msg.questionCount) this.room.questionCount = msg.questionCount;
        if (msg.timeLimitMinutes) this.room.timeLimitMinutes = msg.timeLimitMinutes;
        if (msg.questionIds) this.room.questionIds = msg.questionIds;
        if (msg.challengeDeadline) this.room.challengeDeadline = msg.challengeDeadline;
        if (msg.isIndividualCompetition !== undefined) this.room.isIndividualCompetition = msg.isIndividualCompetition;
        this.room.challengeScore = 0;
        this.room.players.forEach(player => {
          player.challengePoints = 0;
          player.challengeCorrect = 0;
          player.challengeMisses = 0;
          player.challengeCompleted = false;
        });
        this.notifyStateListeners();
        break;

      case 'CHALLENGE_SCORE': {
        const scorer = this.room.players.find(player => player.id === msg.playerId);
        if (scorer) {
          scorer.challengePoints = Math.max(0, Number(msg.points) || 0);
          scorer.challengeCorrect = Math.max(0, Number(msg.correct) || 0);
          scorer.challengeMisses = Math.max(0, Number(msg.misses) || 0);
          this.room.challengeScore = this.room.players.reduce((sum, player) => sum + (player.challengePoints || 0), 0);
          this.notifyStateListeners();
        }
        break;
      }

      case 'CLASSROOM_PLAYER_SCORE': {
        const scorer = this.room.players.find(player => player.id === msg.playerId);
        if (scorer) {
          scorer.challengePoints = Math.max(0, Number(msg.points) || 0);
          scorer.challengeCorrect = Math.max(0, Number(msg.correct) || 0);
          scorer.challengeMisses = Math.max(0, Number(msg.misses) || 0);
          scorer.challengeCompleted = Boolean(msg.completed);
          this.notifyStateListeners();
        }
        break;
      }

      case 'STEP_UNLOCKED':
      case 'CHEF_STEP_DONE':
        this.room.unlockedSteps = this.room.unlockedSteps || [];
        if (!this.room.unlockedSteps.includes(msg.stepIndex)) {
          this.room.unlockedSteps.push(msg.stepIndex);
        }
        if (msg.accuracy !== undefined) {
          if (msg.type === 'STEP_UNLOCKED') this.room.mathAccuracy = msg.accuracy;
          else this.room.cookingAccuracy = msg.accuracy;
        }
        this.notifyStateListeners();
        break;

      case 'COOP_FINISHED':
        this.room.status = ROOM_STATUS.RESULT;
        this.room.resultMetrics = msg.metrics;
        this.notifyStateListeners();
        break;
    }
  }

  broadcast(message) {
    if (!this.room) return;
    const payload = {
      roomId: normalizeRoomId(this.room.roomId),
      ...message
    };

    // 1. Same-device / tab broadcast
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('Broadcast postMessage failed:', e);
      }
    }

    // 2. Hosted cross-device transport (Supabase Realtime)
    if (this.isOnlineRoom() && realtimeRoomService.isConfigured()) {
      realtimeRoomService.send(payload).catch(() => {});
      return;
    }

    // 3. Local-development LAN fallback over HTTP / SSE
    if (this.isOnlineRoom() && typeof fetch !== 'undefined') {
      try {
        fetch('/api/multiplayer/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }
  }

  broadcastSync() {
    this.broadcast({
      type: 'SYNC_STATE',
      room: this.room
    });
  }

  createRoom(mode = MULTIPLAYER_MODES.COOP2, options = {}) {
    let roomId = options.roomId;
    if (!roomId) {
      if (mode === MULTIPLAYER_MODES.CLASSROOM && options.classCode) {
        roomId = options.classCode;
      } else {
        // Random 4-digit code (e.g. 4829)
        roomId = String(Math.floor(1000 + Math.random() * 9000));
      }
    }
    roomId = normalizeRoomId(roomId);
    const classCode = (mode === MULTIPLAYER_MODES.CLASSROOM || options.classCode) ? roomId : null;

    const hostRoleMode = options.hostRoleMode || 'play';
    const initialRole = hostRoleMode === 'observant' ? ROLES.OBSERVANT.id : ROLES.CHEF.id;

    this.room = {
      roomId,
      classCode,
      gameMode: mode,
      hostId: this.localPlayerId,
      hostRoleMode, // 'play' | 'observant'
      status: ROOM_STATUS.WAITING,
      missionId: options.missionId || 'M01-01',
      recipeId: options.recipeId || 'nasi_lemak',
      targetChapter: (options.targetChapter !== undefined) ? options.targetChapter : (options.chapter ?? 1),
      difficulty: options.difficulty || 'medium',
      questionCount: Math.max(1, Number(options.questionCount) || 10),
      timeLimitMinutes: Math.max(1, Number(options.timeLimitMinutes) || 10),
      questionIds: Array.isArray(options.questionIds) ? options.questionIds : [],
      players: [
        {
          id: this.localPlayerId,
          name: options.nickname || this.localPlayerName,
          role: initialRole,
          isObservant: hostRoleMode === 'observant',
          isReady: true,
          isHost: true,
          challengePoints: 0,
          challengeCorrect: 0,
          challengeMisses: 0
        }
      ],
      currentStep: 0,
      unlockedSteps: [0], // Step 0 unlocked by default
      challengeScore: 0,
      mathAccuracy: 1.0,
      cookingAccuracy: 1.0
    };

    // If local 2-player or 4-player shared screen, seed player 2/3/4 locally
    if (mode === MULTIPLAYER_MODES.LOCAL) {
      this.room.players.push({
        id: 'local_partner',
        name: 'Partner (Math Specialist)',
        role: ROLES.MATH.id,
        isReady: true,
        isHost: false,
        challengePoints: 0,
        challengeCorrect: 0,
        challengeMisses: 0
      });
    }

    this.connectNetwork(roomId);
    this.broadcastSync();
    this.notifyStateListeners();
    return this.room;
  }

  joinRoom(roomIdOrClassCode, nickname = '') {
    const code = normalizeRoomId(roomIdOrClassCode);
    const isClassCode = code.startsWith('AMC');

    // Create joined room state
    this.room = {
      roomId: code,
      classCode: isClassCode ? code : null,
      gameMode: isClassCode ? MULTIPLAYER_MODES.CLASSROOM : MULTIPLAYER_MODES.COOP2,
      hostId: 'host_unknown',
      status: ROOM_STATUS.WAITING,
      missionId: 'M01-01',
      recipeId: 'nasi_lemak',
      targetChapter: 1,
      difficulty: 'medium',
      questionCount: 10,
      timeLimitMinutes: 10,
      players: [
        {
          id: this.localPlayerId,
          name: nickname || this.localPlayerName,
          role: ROLES.MATH.id, // default second role
          isReady: true,
          isHost: false,
          challengePoints: 0,
          challengeCorrect: 0,
          challengeMisses: 0
        }
      ],
      currentStep: 0,
      unlockedSteps: [0],
      challengeScore: 0,
      mathAccuracy: 1.0,
      cookingAccuracy: 1.0
    };

    this.connectNetwork(code);

    // Broadcast join request to other tabs & network
    this.broadcast({
      type: 'PLAYER_JOINED',
      player: this.room.players[0]
    });

    this.notifyStateListeners();
    return this.room;
  }

  setRole(roleId) {
    if (!this.room) return;
    const player = this.getLocalPlayer();
    if (player) {
      player.role = roleId;
      this.broadcast({
        type: 'PLAYER_UPDATE',
        player: { id: this.localPlayerId, role: roleId }
      });
      realtimeRoomService.updatePresence(player).catch(() => {});
      this.notifyStateListeners();
    }
  }

  setReady(isReady) {
    if (!this.room) return;
    const player = this.getLocalPlayer();
    if (player) {
      player.isReady = isReady;
      this.broadcast({
        type: 'PLAYER_UPDATE',
        player: { id: this.localPlayerId, isReady }
      });
      realtimeRoomService.updatePresence(player).catch(() => {});
      this.notifyStateListeners();
    }
  }

  startCoopGame(missionId = null) {
    if (!this.room) return;
    if (missionId) {
      this.room.missionId = missionId;
    }
    this.room.status = ROOM_STATUS.PLAYING;
    this.room.currentStep = 0;
    this.room.unlockedSteps = [0];
    this.room.challengeScore = 0;
    if (this.room.gameMode === MULTIPLAYER_MODES.CLASSROOM) {
      this.room.challengeDeadline = Date.now() + (this.room.timeLimitMinutes || 10) * 60 * 1000;
    }
    this.room.players.forEach(player => {
      player.challengePoints = 0;
      player.challengeCorrect = 0;
      player.challengeMisses = 0;
      player.challengeCompleted = false;
    });

    this.broadcast({
      type: 'START_GAME',
      missionId: this.room.missionId,
      targetChapter: this.room.targetChapter,
      difficulty: this.room.difficulty,
      questionCount: this.room.questionCount,
      timeLimitMinutes: this.room.timeLimitMinutes,
      questionIds: this.room.questionIds,
      challengeDeadline: this.room.challengeDeadline,
      isIndividualCompetition: this.room.gameMode === MULTIPLAYER_MODES.CLASSROOM
    });

    this.notifyStateListeners();
  }

  recordChallengeAnswer(isCorrect, attempts = 1) {
    if (!this.room) return { points: 0, total: 0 };
    const player = this.getLocalPlayer();
    if (!player) return { points: 0, total: this.room.challengeScore || 0 };
    const safeAttempts = Math.max(1, Number(attempts) || 1);
    const points = isCorrect ? Math.max(25, 100 - (safeAttempts - 1) * 25) : 0;
    player.challengePoints = (player.challengePoints || 0) + points;
    player.challengeCorrect = (player.challengeCorrect || 0) + (isCorrect ? 1 : 0);
    player.challengeMisses = (player.challengeMisses || 0) + (isCorrect ? 0 : 1);
    this.room.challengeScore = this.room.players.reduce((sum, participant) => sum + (participant.challengePoints || 0), 0);
    this.broadcast({
      type: 'CHALLENGE_SCORE',
      playerId: player.id,
      points: player.challengePoints,
      correct: player.challengeCorrect,
      misses: player.challengeMisses
    });
    this.notifyStateListeners();
    return { points, total: this.room.challengeScore };
  }

  recordClassroomChallengeAnswer(isCorrect, attempts = 1) {
    if (!this.room || this.room.gameMode !== MULTIPLAYER_MODES.CLASSROOM) return { points: 0, total: 0 };
    const player = this.getLocalPlayer();
    if (!player || player.isObservant) return { points: 0, total: 0 };
    const safeAttempts = Math.max(1, Number(attempts) || 1);
    const points = isCorrect ? Math.max(25, 100 - (safeAttempts - 1) * 25) : 0;
    player.challengePoints = (player.challengePoints || 0) + points;
    player.challengeCorrect = (player.challengeCorrect || 0) + (isCorrect ? 1 : 0);
    player.challengeMisses = (player.challengeMisses || 0) + (isCorrect ? 0 : 1);
    this.broadcast({
      type: 'CLASSROOM_PLAYER_SCORE',
      playerId: player.id,
      points: player.challengePoints,
      correct: player.challengeCorrect,
      misses: player.challengeMisses,
      completed: Boolean(player.challengeCompleted)
    });
    this.notifyStateListeners();
    return { points, total: player.challengePoints };
  }

  completeClassroomChallenge() {
    const player = this.getLocalPlayer();
    if (!player || !this.room || this.room.gameMode !== MULTIPLAYER_MODES.CLASSROOM || player.isObservant) return;
    player.challengeCompleted = true;
    this.broadcast({
      type: 'CLASSROOM_PLAYER_SCORE',
      playerId: player.id,
      points: player.challengePoints || 0,
      correct: player.challengeCorrect || 0,
      misses: player.challengeMisses || 0,
      completed: true
    });
    this.notifyStateListeners();
  }

  unlockStepByMath(stepIndex, accuracy = 1.0) {
    if (!this.room) return;
    this.room.unlockedSteps = this.room.unlockedSteps || [];
    if (!this.room.unlockedSteps.includes(stepIndex)) {
      this.room.unlockedSteps.push(stepIndex);
    }
    this.room.mathAccuracy = accuracy;

    this.broadcast({
      type: 'STEP_UNLOCKED',
      stepIndex,
      accuracy
    });

    this.notifyStateListeners();
  }

  completeChefStep(stepIndex, accuracy = 1.0) {
    if (!this.room) return;
    this.room.unlockedSteps = this.room.unlockedSteps || [];
    if (!this.room.unlockedSteps.includes(stepIndex)) {
      this.room.unlockedSteps.push(stepIndex);
    }
    this.room.cookingAccuracy = accuracy;

    this.broadcast({
      type: 'CHEF_STEP_DONE',
      stepIndex,
      accuracy
    });

    this.notifyStateListeners();
  }

  finishCoopGame(metrics) {
    if (!this.room) return;
    this.room.status = ROOM_STATUS.RESULT;
    this.room.resultMetrics = metrics;

    this.broadcast({
      type: 'COOP_FINISHED',
      metrics
    });

    this.notifyStateListeners();
  }

  leaveRoom() {
    if (this.room) {
      if (this.isHost() && this.isOnlineRoom()) {
        this.broadcast({ type: 'ROOM_CLOSED' });
      }
      this.broadcast({
        type: 'PLAYER_LEFT',
        playerId: this.localPlayerId
      });
      if (this.eventSource) {
        try {
          this.eventSource.close();
        } catch (e) {}
        this.eventSource = null;
      }
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      this.clearHostDiscoveryTimeout();
      this.room = null;
      realtimeRoomService.disconnect().catch(() => {});
      this.networkStatus = realtimeRoomService.isConfigured() ? 'idle' : 'local';
      this.notifyStateListeners();
    }
  }

  setHostRoleMode(mode) {
    if (!this.room || !this.isHost()) return;
    this.room.hostRoleMode = mode;
    const hostPlayer = this.getLocalPlayer();
    if (hostPlayer) {
      hostPlayer.isObservant = (mode === 'observant');
      hostPlayer.role = mode === 'observant' ? ROLES.OBSERVANT.id : ROLES.CHEF.id;
    }
    this.broadcastSync();
    realtimeRoomService.updatePresence(hostPlayer).catch(() => {});
    this.notifyStateListeners();
  }

  isObservant() {
    const local = this.getLocalPlayer();
    return !!(local && local.isObservant);
  }

  isHost() {
    return this.room && this.room.hostId === this.localPlayerId;
  }

  getLocalPlayer() {
    if (!this.room) return null;
    return this.room.players.find(p => p.id === this.localPlayerId) || null;
  }

  getPlayers() {
    return this.room ? this.room.players : [];
  }

  getNetworkStatus() {
    return this.networkStatus;
  }

  isOnlineRoom() {
    return !!this.room && this.room.gameMode !== MULTIPLAYER_MODES.LOCAL;
  }

  armHostDiscoveryTimeout() {
    this.clearHostDiscoveryTimeout();
    this.hostDiscoveryTimer = setTimeout(() => {
      this.hostDiscoveryTimer = null;
      if (this.room && !this.isHost() && this.room.hostId === 'host_unknown') {
        this.networkStatus = 'room-not-found';
        this.notifyStateListeners();
      }
    }, 8000);
  }

  clearHostDiscoveryTimeout() {
    if (this.hostDiscoveryTimer) {
      clearTimeout(this.hostDiscoveryTimer);
      this.hostDiscoveryTimer = null;
    }
  }

  confirmHostConnection() {
    this.clearHostDiscoveryTimeout();
    this.networkStatus = 'connected';
  }

  isStepUnlocked(stepIndex) {
    if (!this.room) return true;
    return this.room.unlockedSteps && this.room.unlockedSteps.includes(stepIndex);
  }

  kickPlayer(playerId) {
    if (!this.room || !this.isHost() || !playerId) return;
    this.room.players = this.room.players.filter(p => p.id !== playerId);
    this.broadcast({
      type: 'KICK_PLAYER',
      playerId
    });
    this.broadcastSync();
    this.notifyStateListeners();
  }

  onKicked(listener) {
    this.kickedListeners.add(listener);
    return () => this.kickedListeners.delete(listener);
  }

  notifyKickedListeners() {
    for (const l of this.kickedListeners) {
      try {
        l();
      } catch (e) {
        console.error('Error in kicked listener:', e);
      }
    }
  }

  onStateChange(listener) {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  notifyStateListeners() {
    for (const l of this.stateListeners) {
      try {
        l(this.room);
      } catch (e) {
        console.error('Error in multiplayer state listener:', e);
      }
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
export default multiplayerManager;
