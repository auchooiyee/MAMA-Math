import Phaser from 'phaser';
import cookingManager from '../managers/CookingManager.js';
import economyManager from '../managers/EconomyManager.js';
import playerManager from '../managers/PlayerManager.js';
import gameManager from '../managers/GameManager.js';
import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import badgeManager from '../managers/BadgeManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME, XP_REWARDS, COIN_REWARDS } from '../config/constants.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create() {
    try {
      const metrics = cookingManager.getPerformanceMetrics();
      const recipe = cookingManager.currentRecipe || { id: 'nasi_lemak', baseCost: 4.50, sellingPrice: 8.00 };
      const economics = economyManager.calculateDishEconomics(recipe, metrics.mathAccuracy, metrics.cookingAccuracy);

      // Calculate XP & Coins
      let xpGain = XP_REWARDS.EASY;
      let coinGain = Math.max(10, Math.round((economics.netProfit || 3.50) * 10) + COIN_REWARDS.EASY);
      if (metrics.isPerfect) {
        xpGain += XP_REWARDS.PERFECT_BONUS;
        coinGain += COIN_REWARDS.PERFECT_BONUS;
      }

      // Apply to player progression
      const levelResult = playerManager.addXP(xpGain);
      playerManager.addCoins(coinGain);
      const missionId = gameManager.currentMission?.id || 'M01-01';
      playerManager.recordMissionCompleted(missionId, metrics.stars, metrics.mathAccuracy);
      badgeManager.checkProgress();
      gameManager.saveCurrentState();

      // Play sounds
      audioManager.playCoin();

      // Scene visuals
      this.createBackground();
      this.createScoreboard(metrics, economics, xpGain, coinGain, levelResult);
    } catch (err) {
      console.error('Error in ResultScene.create():', err);
      this.createBackground();
      const errText = this.add.text(640, 320, 'Order complete! Returning to Warung...', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px',
        color: '#f59e0b'
      }).setOrigin(0.5);
      createButton(this, 640, 400, 'BACK TO WARUNG', {
        onClick: () => this.scene.start('RestaurantScene')
      });
    }
  }

  createBackground() {
    const bg = this.add.graphics();
    // Bright Sunny Morning Pastel Sky
    bg.fillGradientStyle(0x7dd3fc, 0x7dd3fc, 0xe0f2fe, 0xfffbeb, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Fluffy clouds
    const drawCloud = (cx, cy, scale = 1) => {
      bg.fillStyle(0xffffff, 0.9);
      bg.fillCircle(cx - 25 * scale, cy + 5 * scale, 20 * scale);
      bg.fillCircle(cx, cy - 8 * scale, 28 * scale);
      bg.fillCircle(cx + 28 * scale, cy + 2 * scale, 22 * scale);
    };
    drawCloud(200, 70, 0.9);
    drawCloud(640, 50, 1.1);
    drawCloud(1060, 65, 0.85);

    // Scalloped Cute Stall Awning at top
    const stripeW = 48;
    const awningH = 45;
    for (let i = 0; i < Math.ceil(1280 / stripeW); i++) {
      const isCoral = (i % 2 === 0);
      bg.fillStyle(isCoral ? 0xfb7185 : 0xfffdf5, 1);
      bg.fillRect(i * stripeW, 0, stripeW, awningH);
      bg.fillCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);
    }
    bg.lineStyle(2, 0x331f12, 1);
    for (let i = 0; i < Math.ceil(1280 / stripeW); i++) {
      bg.strokeCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);
    }
    bg.lineBetween(0, 0, 1280, 0);
  }

  createScoreboard(metrics, economics, xpGain, coinGain, levelResult) {
    const container = this.add.container(640, 375);
    const isMs = localizationManager.getLanguage() === 'ms';
    const customer = cookingManager.lastServedCustomer || cookingManager.currentCustomer || {
      id: 'pak_ali',
      name: 'Pak Ali',
      avatarKey: 'customer_pak_ali'
    };

    // 1. Cute Recipe Clipboard Panel (Warm Cream Parchment)
    const card = this.add.graphics();
    // Drop shadow
    card.fillStyle(0x000000, 0.2);
    card.fillRoundedRect(-440, -295, 880, 590, 24);
    // Cream body
    card.fillStyle(0xfffdf5, 1);
    card.fillRoundedRect(-440, -300, 880, 590, 22);
    // Butter accent frame
    card.lineStyle(2, 0xfcd34d, 1);
    card.strokeRoundedRect(-432, -292, 864, 574, 18);
    // Clean Cartoon Cocoa Outline
    card.lineStyle(3.5, 0x331f12, 1);
    card.strokeRoundedRect(-440, -300, 880, 590, 22);

    // Washi-tape stickers
    card.fillStyle(0xfb7185, 1);
    card.fillRect(-420, -308, 48, 14);
    card.fillStyle(0x34d399, 1);
    card.fillRect(372, -308, 48, 14);
    container.add(card);

    // Top Header Banner
    const title = this.add.text(0, -260, '🍽️ ' + (isMs ? 'PESANAN BERJAYA DIHIDANGKAN!' : 'ORDER SUCCESSFULLY SERVED!'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);

    // Star Rating
    this.renderStars(container, metrics.stars);

    // 2. Served Customer & Delighted Reaction Section
    const custContainer = this.add.container(0, -145);
    container.add(custContainer);

    // Customer Avatar with gentle bob
    const avatarKey = customer.avatarKey || 'customer_pak_ali';
    const custAvatar = this.add.image(-280, 0, avatarKey).setScale(0.8);
    custContainer.add(custAvatar);
    this.tweens.add({
      targets: custAvatar,
      y: -6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Finished Plated Dish beside customer
    const texMap = {
      'nasi_lemak': 'dish_nasi_lemak',
      'roti_canai': 'dish_roti_canai',
      'mee_goreng': 'dish_mee_goreng',
      'teh_tarik': 'dish_teh_tarik',
      'satay_ayam': 'dish_satay'
    };
    const recId = cookingManager.currentRecipe?.id || 'nasi_lemak';
    const dishTex = texMap[recId] || 'dish_nasi_lemak';
    const dishPlate = this.add.image(-195, 25, dishTex).setScale(0.52);
    if (metrics.stars === 1) dishPlate.setTint(0xd1d5db);
    custContainer.add(dishPlate);

    // Customer Speech Bubble
    const speechBg = this.add.graphics();
    speechBg.fillStyle(0x000000, 0.12);
    speechBg.fillRoundedRect(-140, -42, 430, 84, 14);
    speechBg.fillTriangle(-145, 0, -135, -12, -135, 12);

    speechBg.fillStyle(0xfffbeb, 1);
    speechBg.fillRoundedRect(-140, -44, 430, 84, 12);
    speechBg.fillTriangle(-152, 0, -137, -10, -137, 10);
    speechBg.lineStyle(2, 0x331f12, 1);
    speechBg.strokeRoundedRect(-140, -44, 430, 84, 12);
    custContainer.add(speechBg);

    // Customer Name Badge
    const reaction = metrics.stars >= 3
      ? localizationManager.t('result.reactionPerfect')
      : metrics.stars === 2
        ? localizationManager.t('result.reactionGood')
        : localizationManager.t('result.reactionLearning');
    const reactionIcon = metrics.stars >= 3 ? '💖' : metrics.stars === 2 ? '🙂' : '😕';
    const custNameBadge = this.add.text(-125, -34, `${reactionIcon} ${customer.name || 'Pelanggan'} • ${reaction}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: metrics.stars >= 3 ? '#059669' : metrics.stars === 2 ? '#b45309' : '#b91c1c',
      fontStyle: 'bold'
    });
    custContainer.add(custNameBadge);

    // Customer review quote
    const thanksDialogueMap = {
      'pak_ali': 'restaurant.customerThanksPakAli',
      'uncle_muthu': 'restaurant.customerThanksMuthu',
      'kak_siti': 'restaurant.customerThanksSiti',
      'ah_ming': 'restaurant.customerThanksAhMing',
      'kak_ros': 'restaurant.customerThanksKakRos'
    };
    const thanksKey = thanksDialogueMap[customer.id] || 'restaurant.customerThanksPakAli';
    const quoteText = metrics.stars >= 3
      ? localizationManager.t(thanksKey)
      : metrics.stars === 2
        ? localizationManager.t('result.reviewGood')
        : localizationManager.t('result.reviewLearning');
    const speechText = this.add.text(-125, -12, quoteText, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#331f12',
      fontStyle: 'bold',
      wordWrap: { width: 400 }
    });
    custContainer.add(speechText);

    // Floating heart from customer
    const heart = this.add.text(-240, -50, metrics.stars >= 3 ? '❤️' : metrics.stars === 2 ? '👍' : '💭', { fontSize: '24px' });
    custContainer.add(heart);
    this.tweens.add({
      targets: heart,
      y: -65,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 3. Performance Breakdown (Left Column)
    const leftX = -210;
    const perfPanel = this.add.graphics();
    perfPanel.fillStyle(THEME.panelLight, 0.94);
    perfPanel.fillRoundedRect(-380, 38, 340, 142, 14);
    perfPanel.lineStyle(2, THEME.panelBorder, 0.9);
    perfPanel.strokeRoundedRect(-380, 38, 340, 142, 14);
    container.add(perfPanel);
    const perfTitle = this.add.text(leftX, 55, '📊 ' + (isMs ? 'PRESTASI MASAKAN' : 'PERFORMANCE'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#0284c7',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(perfTitle);

    const perfData = [
      { label: localizationManager.t('result.mathScore'), val: `${Math.round(metrics.mathAccuracy * 100)}%` },
      { label: localizationManager.t('result.cookingScore'), val: `${Math.round(metrics.cookingAccuracy * 100)}%` },
      { label: localizationManager.t('result.speedBonus'), val: `${Math.round(metrics.speedScore * 100)}%` },
      { label: localizationManager.t('math.timeTaken'), val: `${metrics.durationSeconds}s` }
    ];

    perfData.forEach((item, i) => {
      const y = 82 + i * 24;
      const lbl = this.add.text(leftX - 160, y, item.label, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#78350f',
        fontStyle: 'bold'
      });
      const v = this.add.text(leftX + 150, y, item.val, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: '#331f12',
        fontStyle: 'bold'
      }).setOrigin(1, 0);
      container.add(lbl);
      container.add(v);
    });

    // 4. Warung Financial Ledger (Right Column)
    const rightX = 210;
    const econTitle = this.add.text(rightX, -50, '💰 ' + (isMs ? 'PENYATA KEWANGAN' : 'FINANCIAL LEDGER'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#059669',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(econTitle);

    const econData = [
      { label: localizationManager.t('result.revenue'), val: `+ RM ${economics.revenue.toFixed(2)}`, color: '#047857' },
      { label: localizationManager.t('result.ingredientCost'), val: `- RM ${(economics.ingredientCost - economics.wasteCost).toFixed(2)}`, color: '#dc2626' },
      ...(economics.wasteCost > 0
        ? [{ label: localizationManager.t('result.mathWaste'), val: `- RM ${economics.wasteCost.toFixed(2)}`, color: '#dc2626' }]
        : []),
      { label: localizationManager.t('result.netProfit'), val: `RM ${economics.netProfit.toFixed(2)}`, color: '#b45309' }
    ];

    econData.forEach((item, i) => {
      const y = -22 + i * 28;
      const lbl = this.add.text(rightX - 160, y, item.label, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#78350f',
        fontStyle: 'bold'
      });
      const v = this.add.text(rightX + 150, y, item.val, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: item.color,
        fontStyle: 'bold'
      }).setOrigin(1, 0);
      container.add(lbl);
      container.add(v);
    });

    // 5. Reward Banner (XP & Coins)
    const rewardBox = this.add.graphics();
    rewardBox.fillStyle(0xfef08a, 0.4);
    // Keep the reward strip below both score columns so it never covers the
    // fourth performance row on compact FIT viewports.
    rewardBox.fillRoundedRect(-360, 190, 720, 58, 14);
    rewardBox.lineStyle(2, 0xfcd34d, 1);
    rewardBox.strokeRoundedRect(-360, 190, 720, 58, 14);
    container.add(rewardBox);

    const xpText = this.add.text(-120, 219, `⭐ +${xpGain} XP`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#0284c7',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(xpText);

    const coinImg = this.add.image(90, 219, 'icon_coin').setScale(0.65);
    container.add(coinImg);
    const coinText = this.add.text(120, 219, `+RM ${(coinGain / 10).toFixed(2)}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#b45309',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    container.add(coinText);

    // Level up message
    if (levelResult && levelResult.leveledUp) {
      const levelUpText = this.add.text(0, 178, localizationManager.t('result.levelUp', { level: levelResult.currentLevel }), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: '#d97706',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(levelUpText);
    }

    // 6. Return & Serve Button
    const btnReturn = createButton(this, 0, 263, '🍽️ ' + (isMs ? 'SELESAI & KEMBALI KE WARUNG' : 'SERVE & RETURN TO WARUNG'), {
      width: 380,
      height: 52,
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      fontSize: '18px',
      onClick: () => {
        try { audioManager.playCoin(); } catch (e) {}
        this.scene.start('RestaurantScene', { servedCustomer: customer });
      }
    });
    container.add(btnReturn.container);
  }

  renderStars(container, starCount) {
    const starSpacing = 55;
    const startX = -((3 - 1) * starSpacing) / 2;

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(startX + i * starSpacing, -215, 'icon_star');
      star.setScale(i < starCount ? 1.05 : 0.65);
      star.setAlpha(i < starCount ? 1 : 0.3);
      container.add(star);

      if (i < starCount) {
        this.tweens.add({
          targets: star,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 350,
          delay: i * 180,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      }
    }
  }
}

export default ResultScene;
