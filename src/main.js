import Phaser from 'phaser';
import { getGameConfig } from './config/gameConfig.js';
import cookingManager from './managers/CookingManager.js';
import { STORAGE_KEYS } from './config/constants.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(getGameConfig());
  window.__MATH_MAMA_GAME__ = game;

  // Lightweight visual QA harness: append ?qa=result to preview the result
  // screen without replaying a full cooking session. It is intentionally
  // query-gated so normal gameplay and production routes are unchanged.
  if (new URLSearchParams(window.location.search).get('qa') === 'result') {
    game.events.once('ready', () => {
      setTimeout(() => {
        cookingManager.currentRecipe = {
          id: 'mee_goreng',
          baseCost: 3.80,
          sellingPrice: 7.50,
          prepTimeSeconds: 60
        };
        cookingManager.currentCustomer = {
          id: 'kak_siti',
          name: 'Kak Siti',
          avatarKey: 'customer_kak_siti'
        };
        cookingManager.lastServedCustomer = cookingManager.currentCustomer;
        cookingManager.mathScores = [1, 0.9, 1];
        cookingManager.cookingScores = [0.95, 0.9, 1];
        cookingManager.startTime = Date.now() - 17000;
        cookingManager.endTime = Date.now();
        game.scene.start('ResultScene');
      }, 900);
    });
  }

  const qaParams = new URLSearchParams(window.location.search);
  if (qaParams.get('qa') === 'minigame') {
    game.events.once('ready', () => {
      setTimeout(() => {
        const gameKey = qaParams.get('game') || 'chop';
        const gameSteps = {
          chop: { id: 'PREPARATION', type: 'minigame', game: 'chop', target: 4 },
          measure: { id: 'MEASURE', type: 'minigame', game: 'measure', target: 150 },
          mix: { id: 'MIX', type: 'minigame', game: 'mix', ratio1: 3, ratio2: 2 },
          temperature: { id: 'HEAT', type: 'minigame', game: 'temperature' },
          timing: { id: 'TIMING', type: 'minigame', game: 'timing', targetCycles: 3 },
          sort: { id: 'SORT', type: 'minigame', game: 'sort' },
          route: { id: 'ROUTE', type: 'minigame', game: 'route' },
          data: { id: 'DATA', type: 'minigame', game: 'data' },
          probability: { id: 'PROBABILITY', type: 'minigame', game: 'probability' },
          cashier: { id: 'CASHIER', type: 'minigame', game: 'cashier', total: 12, paid: 20 },
          satay: { id: 'SATAY', type: 'minigame', game: 'satay' },
          tehtarik: { id: 'TEH TARIK', type: 'minigame', game: 'tehtarik' },
          stirfry: { id: 'STIR FRY', type: 'minigame', game: 'stirfry' }
        };
        const step = gameSteps[gameKey] || gameSteps.chop;
        cookingManager.startRecipe({ id: 'nasi_lemak', steps: [step], prepTimeSeconds: 60 });
        game.scene.start('CookingScene');
      }, 900);
    });
  }

  if (qaParams.get('qa') === 'mission-select') {
    game.events.once('ready', () => {
      const worldId = Number(qaParams.get('world')) || 3;
      setTimeout(() => game.scene.start('MissionSelectScene', { worldId }), 900);
    });
  }

  // Phaser's FIT scale handles browser resizing. The game keeps one stable
  // landscape coordinate system so gameplay controls never shift between scenes.
  let resizeTimer = null;
  const handleResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (game && game.scale) {
        game.scale.refresh();
      }
    }, 100);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  const orientationPrompt = document.getElementById('orientation-prompt');
  const refreshOrientationPrompt = () => {
    if (!orientationPrompt) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    let language = 'en';
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVE_DATA) || '{}');
      language = saved.settings?.language === 'ms' ? 'ms' : 'en';
    } catch {
      language = 'en';
    }
    orientationPrompt.querySelectorAll('[data-orientation-language]').forEach((copy) => {
      copy.hidden = copy.dataset.orientationLanguage !== language;
    });
    orientationPrompt.classList.toggle('is-visible', isPortrait);
    orientationPrompt.setAttribute('aria-hidden', String(!isPortrait));
  };
  refreshOrientationPrompt();
  window.addEventListener('resize', refreshOrientationPrompt);
  window.addEventListener('orientationchange', refreshOrientationPrompt);

  // Fullscreen controller
  const fsBtn = document.getElementById('fullscreen-btn');
  const fsIcon = document.getElementById('fullscreen-icon');

  const updateFsState = () => {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    if (fsIcon) {
      fsIcon.textContent = isFullscreen ? '✕' : '⛶';
    }
    if (fsBtn) {
      fsBtn.title = isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)';
    }
    setTimeout(handleResize, 150);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  if (fsBtn) {
    fsBtn.addEventListener('click', toggleFullscreen);
    fsBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleFullscreen();
    });
  }

  document.addEventListener('fullscreenchange', updateFsState);
  document.addEventListener('webkitfullscreenchange', updateFsState);
  document.addEventListener('mozfullscreenchange', updateFsState);

  // Keyboard shortcut 'F' to toggle fullscreen
  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      toggleFullscreen();
    }
  });
});
