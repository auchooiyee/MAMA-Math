import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import playerManager from '../managers/PlayerManager.js';
import gameManager from '../managers/GameManager.js';
import audioManager from '../managers/AudioManager.js';
import equipmentData from '../data/equipment.json' with { type: 'json' };
import recipeManager from '../managers/RecipeManager.js';
import cookingManager from '../managers/CookingManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

const DEFAULT_CUSTOMERS = [
  { id: 'pak_ali', name: 'Pak Ali', avatarKey: 'customer_pak_ali', recipeId: 'nasi_lemak', dialogueKey: 'restaurant.customerDialogue1', tagColor: 0x059669 },
  { id: 'uncle_muthu', name: 'Uncle Muthu', avatarKey: 'customer_uncle_muthu', recipeId: 'roti_canai', dialogueKey: 'restaurant.customerDialogueRoti', tagColor: 0xd97706 },
  { id: 'kak_siti', name: 'Kak Siti', avatarKey: 'customer_kak_siti', recipeId: 'mee_goreng', dialogueKey: 'restaurant.customerDialogueMee', tagColor: 0xe11d48 },
  { id: 'ah_ming', name: 'Ah Ming', avatarKey: 'customer_ah_ming', recipeId: 'satay_ayam', dialogueKey: 'restaurant.customerDialogueSatay', tagColor: 0x0284c7 },
  { id: 'kak_ros', name: 'Kak Ros', avatarKey: 'customer_kak_ros', recipeId: 'teh_tarik', dialogueKey: 'restaurant.customerDialogueTeh', tagColor: 0x8b5cf6 }
];

let persistentCustomerQueue = [...DEFAULT_CUSTOMERS];

export class RestaurantScene extends Phaser.Scene {
  constructor() {
    super('RestaurantScene');
    this.shopModal = null;
    this.recipeModal = null;
    this.currentDishIndex = 0;
    this.customerList = DEFAULT_CUSTOMERS;
    this.activeQueue = persistentCustomerQueue;
    this.receivedData = {};
  }

  init(data) {
    this.receivedData = data || {};
  }

  create() {
    this.availableRecipes = recipeManager.getAllRecipes();
    this.activeQueue = persistentCustomerQueue;

    const servedCust = this.receivedData?.servedCustomer || cookingManager.lastServedCustomer;

    this.createWarungBackground();
    this.createTopHUD();
    this.createCustomerArea();
    this.createActionPanel();

    this.refreshTexts();
    this.updateStageAndHUD();

    const upgradeCheck = playerManager.checkStageUpgrade();
    if (upgradeCheck.upgraded) {
      this.time.delayedCall(450, () => {
        this.showStageUpgradeCelebration(upgradeCheck.oldStage, upgradeCheck.info);
      });
    }

    if (servedCust) {
      this.handleServedCustomerFlow(servedCust);
    } else {
      const frontCust = this.activeQueue[0];
      if (frontCust) {
        const dIdx = this.availableRecipes.findIndex(r => r.id === frontCust.recipeId);
        if (dIdx !== -1) this.currentDishIndex = dIdx;
      }
      this.updateDishDisplay();
    }

    this.unsubscribeLoc = localizationManager.onChange(() => {
      this.refreshTexts();
    });
  }

  createWarungBackground() {
    const bg = this.add.graphics();
    // 1. Bright Sunny Morning Sky (Pastel Sky Blue to Soft Cream Gradient)
    bg.fillGradientStyle(0x7dd3fc, 0x7dd3fc, 0xe0f2fe, 0xfffbeb, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Fluffy Soft White Cartoon Clouds drifting in the sky
    const drawCloud = (cx, cy, scale = 1) => {
      bg.fillStyle(0xffffff, 0.92);
      bg.fillCircle(cx - 30 * scale, cy + 5 * scale, 24 * scale);
      bg.fillCircle(cx, cy - 10 * scale, 34 * scale);
      bg.fillCircle(cx + 32 * scale, cy + 2 * scale, 26 * scale);
      bg.fillCircle(cx + 12 * scale, cy + 12 * scale, 22 * scale);
      bg.fillCircle(cx - 15 * scale, cy + 12 * scale, 20 * scale);
    };
    drawCloud(180, 130, 0.9);
    drawCloud(480, 95, 1.2);
    drawCloud(920, 115, 1.0);
    drawCloud(1180, 145, 0.85);

    // Warm Morning Sun Rays
    const sunRays = this.add.graphics();
    sunRays.fillStyle(0xfef08a, 0.12);
    sunRays.fillTriangle(640, 0, 0, 500, 400, 500);
    sunRays.fillTriangle(640, 0, 880, 500, 1280, 500);

    // 2. Playful Striped Stall Awning (Strawberry Coral & Warm Cream)
    const awning = this.add.graphics();
    const stripeW = 52;
    const awningH = 68;
    for (let i = 0; i < Math.ceil(1280 / stripeW); i++) {
      const isCoral = (i % 2 === 0);
      awning.fillStyle(isCoral ? 0xfb7185 : 0xfffdf5, 1);
      awning.fillRect(i * stripeW, 0, stripeW, awningH);

      // Scalloped Cute Ruffle Wave
      awning.fillCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);

      // Stitch line detail
      awning.fillStyle(isCoral ? 0xe11d48 : 0xfde68a, 0.5);
      awning.fillRect(i * stripeW + 2, awningH - 6, stripeW - 4, 2.5);
    }

    // Clean Cartoon Cocoa Outline on Awning Ruffles
    awning.lineStyle(2.5, 0x331f12, 1);
    for (let i = 0; i < Math.ceil(1280 / stripeW); i++) {
      awning.strokeCircle(i * stripeW + stripeW / 2, awningH, stripeW / 2);
    }
    awning.lineBetween(0, 0, 1280, 0);

    // Awning Soft Drop Shadow onto back wall
    awning.fillStyle(0x000000, 0.12);
    awning.fillRect(0, awningH + 20, 1280, 14);

    // 3. Colorful Festive Pennant Bunting Flags Fluttering
    const buntingG = this.add.graphics();
    const buntingColors = [0xfb7185, 0x6ee7b7, 0xfde047, 0x38bdf8, 0xc084fc];
    // String wire
    buntingG.lineStyle(1.8, 0x78350f, 0.8);
    const flagW = 38;
    for (let bx = 10; bx < 1280; bx += flagW + 8) {
      const color = buntingColors[Math.floor(bx / 46) % buntingColors.length];
      const stringY = awningH + 22;

      // Small triangle flag
      buntingG.fillStyle(color, 1);
      buntingG.fillTriangle(bx, stringY, bx + flagW, stringY, bx + flagW / 2, stringY + 30);
      buntingG.lineStyle(1.5, 0x331f12, 0.85);
      buntingG.strokeTriangle(bx, stringY, bx + flagW, stringY, bx + flagW / 2, stringY + 30);
      // Golden bead on top
      buntingG.fillStyle(0xfde047, 1);
      buntingG.fillCircle(bx + flagW / 2, stringY - 1, 2.5);
    }

    // 4. Hanging Cheerful Paper Lanterns with Tassels
    this.stringLights = [];
    const lanternX = [120, 360, 920, 1160];
    for (const lx of lanternX) {
      const lantern = this.add.graphics();
      // Black cord
      lantern.lineStyle(1.5, 0x331f12, 1);
      lantern.lineBetween(lx, awningH + 10, lx, awningH + 42);

      // Cute Oval Red/Gold Paper Lantern
      lantern.fillStyle(0x000000, 0.15);
      lantern.fillEllipse(lx, awningH + 68, 28, 36);
      lantern.fillStyle(0xf43f5e, 1);
      lantern.fillEllipse(lx, awningH + 65, 26, 34);
      // Gold bands
      lantern.fillStyle(0xfde047, 1);
      lantern.fillRect(lx - 16, awningH + 54, 32, 5);
      lantern.fillRect(lx - 16, awningH + 72, 32, 5);
      // Cartoon outline
      lantern.lineStyle(2, 0x331f12, 1);
      lantern.strokeEllipse(lx, awningH + 65, 26, 34);
      // Golden Tassel
      lantern.fillStyle(0xf59e0b, 1);
      lantern.fillRect(lx - 4, awningH + 82, 8, 14);
      this.stringLights.push(lantern);
    }

    // Gentle lantern sway animation
    this.tweens.add({
      targets: this.stringLights,
      y: 4,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 5. Cute Hand-Drawn Wooden Signboard ("★ WARUNG MATEMATIK MAMA ★")
    const signChain = this.add.graphics();
    signChain.lineStyle(2.5, 0x78350f, 0.9);
    signChain.lineBetween(510, awningH + 10, 510, awningH + 44);
    signChain.lineBetween(770, awningH + 10, 770, awningH + 44);

    const signBoard = this.add.graphics();
    // Drop shadow
    signBoard.fillStyle(0x000000, 0.2);
    signBoard.fillRoundedRect(478, awningH + 46, 324, 52, 14);
    // Warm honey pine wood
    signBoard.fillStyle(0xfef3c7, 1);
    signBoard.fillRoundedRect(480, awningH + 42, 320, 50, 12);
    signBoard.fillStyle(0xfde047, 0.6);
    signBoard.fillRect(484, awningH + 44, 312, 18);
    // Thick Cartoon outline
    signBoard.lineStyle(3, 0x331f12, 1);
    signBoard.strokeRoundedRect(480, awningH + 42, 320, 50, 12);
    // Washi-tape corners on sign
    signBoard.fillStyle(0xfb7185, 0.9);
    signBoard.fillRect(490, awningH + 38, 24, 10);
    signBoard.fillRect(766, awningH + 38, 24, 10);

    this.add.text(640, awningH + 67, '🍳 WARUNG MATEMATIK MAMA 🥞', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#331f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 6. Warm Light Honey Pine Stall Counter
    const counter = this.add.graphics();
    // Drop shadow
    counter.fillStyle(0x000000, 0.18);
    counter.fillRect(0, 450, 1280, 270);
    // Counter body (warm honey teak)
    counter.fillStyle(0xfcd34d, 1);
    counter.fillRect(0, 455, 1280, 265);
    // Ledge (light butter pine)
    counter.fillStyle(0xfef08a, 1);
    counter.fillRect(0, 455, 1280, 28);
    // Clean Cartoon Border on Counter Ledge
    counter.lineStyle(3, 0x331f12, 1);
    counter.lineBetween(0, 455, 1280, 455);
    counter.lineBetween(0, 483, 1280, 483);
    // Wood grain lines
    counter.lineStyle(1.5, 0xd97706, 0.4);
    for (let wy = 505; wy < 715; wy += 32) {
      counter.lineBetween(0, wy, 1280, wy);
    }

    // 7. Counter Props: Potted Pandan Plant, Steaming Pot, Condiments
    // Potted Pandan Plant on far right
    const plant = this.add.graphics();
    // Terracotta clay pot
    plant.fillStyle(0xe07a5f, 1);
    plant.fillRoundedRect(1140, 410, 48, 45, 6);
    plant.fillStyle(0xf4a261, 1);
    plant.fillRoundedRect(1136, 404, 56, 12, 4);
    plant.lineStyle(2.5, 0x331f12, 1);
    plant.strokeRoundedRect(1136, 404, 56, 12, 4);
    plant.strokeRoundedRect(1140, 410, 48, 45, 6);
    // Pandan leaves
    plant.fillStyle(0x16a34a, 1);
    plant.fillTriangle(1150, 404, 1162, 350, 1170, 404);
    plant.fillTriangle(1160, 404, 1175, 345, 1184, 404);
    plant.fillTriangle(1138, 404, 1145, 360, 1155, 404);
    plant.lineStyle(2, 0x14532d, 1);
    plant.strokeTriangle(1150, 404, 1162, 350, 1170, 404);
    plant.strokeTriangle(1160, 404, 1175, 345, 1184, 404);

    // Steaming Stainless Cauldron on the counter left
    const pot = this.add.graphics();
    pot.fillStyle(0x000000, 0.2);
    pot.fillEllipse(280, 458, 42, 12);
    // Stainless pot body with cartoon outline
    pot.fillStyle(0x94a3b8, 1);
    pot.fillRoundedRect(252, 416, 56, 42, 8);
    pot.fillStyle(0xe2e8f0, 1);
    pot.fillRoundedRect(254, 418, 52, 38, 6);
    pot.lineStyle(2.5, 0x331f12, 1);
    pot.strokeRoundedRect(252, 416, 56, 42, 8);
    // Handles
    pot.lineStyle(2.5, 0x331f12, 1);
    pot.strokeCircle(249, 432, 6);
    pot.strokeCircle(311, 432, 6);
    // Cauldron Rim & Tilted Lid
    pot.fillStyle(0x64748b, 1);
    pot.fillEllipse(280, 416, 32, 8);
    pot.fillStyle(0xcbd5e1, 1);
    pot.fillEllipse(280, 414, 28, 6);
    pot.strokeEllipse(280, 414, 28, 6);

    // Cute Animated Rising Steam Clouds
    for (let s = 0; s < 4; s++) {
      const steam = this.add.graphics();
      steam.fillStyle(0xffffff, 0.7);
      steam.fillCircle(276 + (s * 3), 410, 6 + s);
      this.tweens.add({
        targets: steam,
        y: -42,
        x: (s % 2 === 0 ? 10 : -10),
        alpha: 0,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: 1500 + (s * 250),
        repeat: -1,
        delay: s * 350,
        ease: 'Sine.easeOut'
      });
    }

    // Condiments on Counter: Sambal Jar & Kicap Bottle
    const condiments = this.add.graphics();
    // Glass Sambal Jar (red contents with yellow label)
    condiments.fillStyle(0xef4444, 0.95);
    condiments.fillRoundedRect(318, 428, 22, 28, 4);
    condiments.fillStyle(0xfef08a, 1);
    condiments.fillRect(321, 436, 16, 12);
    condiments.fillStyle(0x78350f, 1); // wooden lid
    condiments.fillRoundedRect(316, 424, 26, 6, 2);
    condiments.lineStyle(2, 0x331f12, 1);
    condiments.strokeRoundedRect(318, 428, 22, 28, 4);

    // Kicap Bottle
    condiments.fillStyle(0x1e293b, 0.95);
    condiments.fillRect(346, 422, 14, 34);
    condiments.fillStyle(0x22c55e, 1); // green cap
    condiments.fillRect(348, 417, 10, 6);
    condiments.lineStyle(2, 0x331f12, 1);
    condiments.strokeRect(346, 422, 14, 34);

    // Cohesive illustrated backdrop. Interactive Phaser elements remain layered above it.
    if (this.textures.exists('bg_warung_morning')) {
      this.add.image(640, 360, 'bg_warung_morning').setDisplaySize(1280, 720);

      const readabilityWash = this.add.graphics();
      readabilityWash.fillGradientStyle(0xffffff, 0xffffff, 0x0f172a, 0x0f172a, 0.02, 0.02, 0.16, 0.16);
      readabilityWash.fillRect(0, 0, 1280, 720);
    }

    // Chef Math Mama Avatar behind the counter on the left!
    const mamaTex = this.textures.exists('chef_math_mama') ? 'chef_math_mama' : 'customer_avatar';
    const mamaScale = this.getAvatarScale(mamaTex, 1.05);
    this.mamaChef = this.add.image(140, 335, mamaTex).setScale(mamaScale);

    // Interactive tap on Chef Mama
    this.mamaChef.setInteractive({ cursor: 'pointer' });
    this.mamaChef.on('pointerdown', () => {
      try { audioManager.playCorrect(); } catch (e) {}
      this.tweens.add({
        targets: this.mamaChef,
        scaleX: mamaScale * 1.15,
        scaleY: mamaScale * 0.88,
        duration: 120,
        yoyo: true
      });
      this.showMamaTipPopup();
    });

    // Mama gentle bobbing & breathing animation
    this.tweens.add({
      targets: this.mamaChef,
      y: 327,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Mama Nametag Badge (Cute pastel pink chip)
    const mamaBadge = this.add.graphics();
    mamaBadge.fillStyle(0x000000, 0.15);
    mamaBadge.fillRoundedRect(72, 437, 136, 26, 12);
    mamaBadge.fillStyle(0xfb7185, 1);
    mamaBadge.fillRoundedRect(72, 435, 136, 26, 12);
    mamaBadge.fillStyle(0xffffff, 0.35);
    mamaBadge.fillRoundedRect(74, 436, 132, 10, 8);
    mamaBadge.lineStyle(2, 0x331f12, 1);
    mamaBadge.strokeRoundedRect(72, 435, 136, 26, 12);

    this.add.text(140, 448, '👩‍🍳 MATH MAMA', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createTopHUD() {
    this.hudContainer = this.add.container(0, 0);

    // 1. Colorful Candy Game Navigation Buttons
    // Back to menu button (Coral Pink)
    this.btnBack = createButton(this, 70, 38, '🏠 MENU', {
      width: 100,
      height: 40,
      fontSize: '13px',
      bgColor: 0xfb7185,
      bgDarkColor: 0xe11d48,
      onClick: () => {
        this.scene.start('MainMenuScene');
      }
    });
    this.hudContainer.add(this.btnBack.container);

    // World Map button (Sky Blue)
    this.btnMap = createButton(this, 178, 38, '🗺️ ' + localizationManager.t('restaurant.worldMap'), {
      width: 104,
      height: 40,
      fontSize: '13px',
      bgColor: 0x38bdf8,
      bgDarkColor: 0x0284c7,
      onClick: () => {
        this.scene.start('WorldMapScene');
      }
    });
    this.hudContainer.add(this.btnMap.container);

    // Shop / Upgrades button (Honey Butter Yellow)
    this.btnShop = createButton(this, 292, 38, '🏪 ' + localizationManager.t('restaurant.shop'), {
      width: 114,
      height: 40,
      fontSize: '13px',
      bgColor: 0xf59e0b,
      bgDarkColor: 0xd97706,
      onClick: () => {
        this.openShopModal();
      }
    });
    this.hudContainer.add(this.btnShop.container);

    // Recipes button (Pandan Mint Green)
    this.btnRecipes = createButton(this, 412, 38, '📖 ' + (localizationManager.t('restaurant.recipeBook') || 'RESIPI'), {
      width: 114,
      height: 40,
      fontSize: '13px',
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      onClick: () => {
        this.openRecipeBookModal();
      }
    });
    this.hudContainer.add(this.btnRecipes.container);

    // Center Stall Title Badge
    this.stallNameText = this.add.text(640, 24, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#331f12',
      stroke: '#ffffff',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.hudContainer.add(this.stallNameText);

    // Interactive Stage Subtitle & Progress Indicator
    this.stageSubtitle = this.add.text(640, 50, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#78350f',
      backgroundColor: '#fef3c7',
      padding: { x: 10, y: 3 },
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.hudContainer.add(this.stageSubtitle);

    // Interactive click to view stage roadmap modal
    this.stageSubtitle.setInteractive({ cursor: 'pointer' });
    this.stageSubtitle.on('pointerdown', () => this.openStageRoadmapModal());
    this.stageSubtitle.on('pointerover', () => this.stageSubtitle.setScale(1.05));
    this.stageSubtitle.on('pointerout', () => this.stageSubtitle.setScale(1.0));

    // Right Stats Bar: Warm Cream Capsule with Level, Kawaii Coins & Stars
    const player = playerManager.player;
    this.statsContainer = this.add.container(1055, 38);

    const statsBg = this.add.graphics();
    // Drop shadow
    statsBg.fillStyle(0x000000, 0.15);
    statsBg.fillRoundedRect(-180, -20, 370, 44, 22);
    // Cream body
    statsBg.fillStyle(0xfffdf5, 1);
    statsBg.fillRoundedRect(-180, -22, 370, 44, 22);
    // Inner butter sheen
    statsBg.fillStyle(0xfef08a, 0.4);
    statsBg.fillRoundedRect(-178, -20, 366, 18, 16);
    // Cartoon Cocoa Outline
    statsBg.lineStyle(2.5, 0x331f12, 1);
    statsBg.strokeRoundedRect(-180, -22, 370, 44, 22);
    this.statsContainer.add(statsBg);

    // Player Level Chip
    const lvlChip = this.add.graphics();
    lvlChip.fillStyle(0xfde047, 1);
    lvlChip.fillRoundedRect(-168, -14, 58, 28, 8);
    lvlChip.lineStyle(1.5, 0x331f12, 1);
    lvlChip.strokeRoundedRect(-168, -14, 58, 28, 8);
    this.statsContainer.add(lvlChip);

    const isMs = localizationManager.getLanguage() === 'ms';
    this.levelBadgeText = this.add.text(-139, 0, isMs ? `Tahap ${player.level}` : `Lvl ${player.level}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      color: '#78350f',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.statsContainer.add(this.levelBadgeText);

    // Kawaii Smiling Coin & Value
    const coinImg = this.add.image(-92, 0, 'icon_coin').setScale(0.55);
    this.statsContainer.add(coinImg);
    this.coinsValText = this.add.text(-74, 0, `RM ${player.coins.toFixed(2)}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#b45309',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.statsContainer.add(this.coinsValText);

    // Kawaii Sparkling Star & Value
    const starImg = this.add.image(22, 0, 'icon_star').setScale(0.55);
    this.statsContainer.add(starImg);
    this.starsValText = this.add.text(42, 0, `${player.stars} ★`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#d97706',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.statsContainer.add(this.starsValText);

    // Quick Language Toggle (Periwinkle Blue)
    const currentLang = localizationManager.getLanguage().toUpperCase();
    this.btnQuickLang = createButton(this, 144, 0, currentLang, {
      width: 52,
      height: 28,
      fontSize: '12px',
      bgColor: 0x818cf8,
      bgDarkColor: 0x6366f1,
      onClick: () => {
        const next = localizationManager.toggleLanguage();
        this.btnQuickLang.setText(next.toUpperCase());
        gameManager.saveCurrentState();
        this.refreshTexts();
      }
    });
    this.statsContainer.add(this.btnQuickLang.container);
  }

  createCustomerArea() {
    this.queueContainer = this.add.container(0, 0);

    this.slotPositions = [
      { x: 450, y: 310, scale: 1.05 },
      { x: 670, y: 300, scale: 0.88 },
      { x: 880, y: 290, scale: 0.78 },
      { x: 1080, y: 280, scale: 0.70 }
    ];

    this.queueSlotContainers = [];

    // Create 4 queue slots for waiting customers
    for (let i = 0; i < 4; i++) {
      const pos = this.slotPositions[i];
      const slotContainer = this.add.container(pos.x, pos.y);
      this.queueContainer.add(slotContainer);

      // Wooden stool & customer counter shadow for 2.5D depth
      const stool = this.add.graphics();
      stool.fillStyle(0x000000, 0.2);
      stool.fillEllipse(0, 106 * pos.scale, 76 * pos.scale, 18 * pos.scale);
      // Stool cushion (warm terracotta)
      stool.fillStyle(0xe07a5f, 1);
      stool.fillRoundedRect(-40 * pos.scale, 96 * pos.scale, 80 * pos.scale, 16 * pos.scale, 6);
      stool.fillStyle(0xf4a261, 1);
      stool.fillRect(-38 * pos.scale, 96 * pos.scale, 76 * pos.scale, 3);
      stool.lineStyle(2, 0x331f12, 1);
      stool.strokeRoundedRect(-40 * pos.scale, 96 * pos.scale, 80 * pos.scale, 16 * pos.scale, 6);
      slotContainer.add(stool);

      // Customer avatar sprite with dynamic badge scaling
      const cust = this.activeQueue[i] || DEFAULT_CUSTOMERS[i] || DEFAULT_CUSTOMERS[0];
      const avScale = this.getAvatarScale(cust.avatarKey, pos.scale);
      const sprite = this.add.image(0, 0, cust.avatarKey).setScale(avScale);
      slotContainer.add(sprite);

      // Gentle idle breathing tween
      this.tweens.add({
        targets: sprite,
        y: -6,
        duration: 1100 + i * 140,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Floating Order Thought Bubble with hand-drawn kawaii cloud shape
      const bubbleContainer = this.add.container(0, -118 * pos.scale);
      slotContainer.add(bubbleContainer);

      const thoughtG = this.add.graphics();
      // Drop shadow
      thoughtG.fillStyle(0x000000, 0.15);
      thoughtG.fillCircle(0, 28, 4);
      thoughtG.fillCircle(0, 16, 6);
      thoughtG.fillRoundedRect(-65, -20, 130, 42, 14);
      // Cream bubble body
      thoughtG.fillStyle(0xfffdf5, 1);
      thoughtG.fillCircle(0, 26, 4);
      thoughtG.fillCircle(0, 14, 6);
      thoughtG.fillRoundedRect(-65, -23, 130, 42, 14);
      // Cartoon Outline
      thoughtG.lineStyle(2.5, 0x331f12, 1);
      thoughtG.strokeRoundedRect(-65, -23, 130, 42, 14);
      bubbleContainer.add(thoughtG);

      // Mini dish icon inside thought bubble
      const dishIcon = this.add.image(-38, -2, 'dish_nasi_lemak').setScale(0.19);
      bubbleContainer.add(dishIcon);

      // Order name text
      const orderTxt = this.add.text(15, -2, 'Nasi Lemak', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '11px',
        color: '#331f12',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      bubbleContainer.add(orderTxt);

      // Interactive hit zone for selecting this customer
      const hitZone = this.add.zone(0, -25, 140 * pos.scale, 190 * pos.scale)
        .setInteractive({ cursor: 'pointer' });
      hitZone.on('pointerdown', () => this.selectQueueSlot(i));
      slotContainer.add(hitZone);

      this.queueSlotContainers.push({
        container: slotContainer,
        sprite: sprite,
        bubble: bubbleContainer,
        dishIcon: dishIcon,
        orderText: orderTxt,
        hitZone: hitZone
      });
    }

    // Active Customer Main Dialogue Speech Bubble above Slot 0
    this.mainDialogueContainer = this.add.container(450, 140);
    this.queueContainer.add(this.mainDialogueContainer);

    const speechBg = this.add.graphics();
    // Soft shadow
    speechBg.fillStyle(0x000000, 0.15);
    speechBg.fillRoundedRect(-182, -35, 364, 76, 18);
    speechBg.fillTriangle(-15, 41, 15, 41, 0, 55);

    // Warm cream chat bubble
    speechBg.fillStyle(0xfffdf5, 1);
    speechBg.fillRoundedRect(-180, -38, 360, 76, 16);
    speechBg.fillTriangle(-15, 38, 15, 38, 0, 52);

    // Cartoon Outline
    speechBg.lineStyle(2.5, 0x331f12, 1);
    speechBg.strokeRoundedRect(-180, -38, 360, 76, 16);
    this.mainDialogueContainer.add(speechBg);

    // Customer Name Badge (Mint Chip)
    const nameChip = this.add.graphics();
    nameChip.fillStyle(0x6ee7b7, 1);
    nameChip.fillRoundedRect(-70, -35, 140, 22, 10);
    nameChip.lineStyle(2, 0x331f12, 1);
    nameChip.strokeRoundedRect(-70, -35, 140, 22, 10);
    this.mainDialogueContainer.add(nameChip);

    this.customerBadgeText = this.add.text(0, -24, '👑 Pak Ali', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#065f46',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.mainDialogueContainer.add(this.customerBadgeText);

    // Speech text in warm dark cocoa typography
    this.speechText = this.add.text(0, 10, localizationManager.t('restaurant.customerDialogue1'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#331f12',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 330 }
    }).setOrigin(0.5);
    this.mainDialogueContainer.add(this.speechText);

    this.refreshCustomerQueueUI();
  }

  getAvatarScale(avatarKey, posScale) {
    if (!this.textures.exists(avatarKey)) return posScale;
    const tex = this.textures.get(avatarKey);
    const src = tex.getSourceImage();
    const w = (src && src.width) ? src.width : 200;
    const factor = w >= 400 ? (195 / w) : 1.0;
    return posScale * factor;
  }

  showMamaTipPopup() {
    if (this.mamaTipBubble) {
      this.mamaTipBubble.destroy();
      this.mamaTipBubble = null;
    }

    const isMs = localizationManager.getLanguage() === 'ms';
    const tips = isMs ? [
      'Jom kira & masak bersama Mama! 🍳✨',
      'Matematik itu mudah bila kita faham! 🥞',
      'Nasi lemak sambal sotong sedap sekali! 🌶️',
      'Setiap pesanan bantu warung kita maju! 👑'
    ] : [
      "Let's count & cook with Mama! 🍳✨",
      'Math is delicious when we practice! 🥞',
      'Fragrant coconut rice with spicy sambal! 🌶️',
      'Every dish grows our Warung Empire! 👑'
    ];
    const tipText = tips[Phaser.Math.Between(0, tips.length - 1)];

    this.mamaTipBubble = this.add.container(140, 225);
    this.mamaTipBubble.setDepth(50);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(-112, -22, 224, 48, 14);
    bg.fillStyle(0xfffdf5, 1);
    bg.fillRoundedRect(-110, -25, 220, 48, 12);
    bg.fillTriangle(-10, 23, 10, 23, 0, 32);
    bg.lineStyle(2.5, 0x331f12, 1);
    bg.strokeRoundedRect(-110, -25, 220, 48, 12);
    bg.strokeTriangle(-10, 23, 10, 23, 0, 32);
    this.mamaTipBubble.add(bg);

    const txt = this.add.text(0, -2, tipText, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      color: '#78350f',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 200 }
    }).setOrigin(0.5);
    this.mamaTipBubble.add(txt);

    this.mamaTipBubble.setScale(0.7);
    this.tweens.add({
      targets: this.mamaTipBubble,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(2400, () => {
      if (this.mamaTipBubble) {
        this.tweens.add({
          targets: this.mamaTipBubble,
          alpha: 0,
          y: 210,
          duration: 300,
          onComplete: () => {
            if (this.mamaTipBubble) {
              this.mamaTipBubble.destroy();
              this.mamaTipBubble = null;
            }
          }
        });
      }
    });
  }

  refreshCustomerQueueUI() {
    if (!this.queueSlotContainers || this.queueSlotContainers.length === 0) return;

    const texMap = {
      'nasi_lemak': 'dish_nasi_lemak',
      'roti_canai': 'dish_roti_canai',
      'mee_goreng': 'dish_mee_goreng',
      'teh_tarik': 'dish_teh_tarik',
      'satay_ayam': 'dish_satay'
    };

    for (let i = 0; i < 4; i++) {
      const slot = this.queueSlotContainers[i];
      const cust = this.activeQueue[i];
      if (!cust || !slot) continue;

      // Update avatar texture and dynamic scale
      if (this.textures.exists(cust.avatarKey)) {
        slot.sprite.setTexture(cust.avatarKey);
        const avScale = this.getAvatarScale(cust.avatarKey, this.slotPositions[i].scale);
        slot.sprite.setScale(avScale);
      }

      // Update dish icon & text in thought bubble
      const dishTex = texMap[cust.recipeId] || 'dish_nasi_lemak';
      if (this.textures.exists(dishTex)) {
        slot.dishIcon.setTexture(dishTex);
      }

      const recipe = this.availableRecipes.find(r => r.id === cust.recipeId);
      const recipeName = recipe ? localizationManager.t(recipe.nameKey) : cust.recipeId;
      const shortName = recipeName.length > 13 ? recipeName.substring(0, 11) + '..' : recipeName;
      slot.orderText.setText(shortName);

      // Hide slot 0's mini thought bubble because slot 0 has the main dialogue bubble
      slot.bubble.setVisible(i > 0);
    }

    // Update active main dialogue for Slot 0 customer
    const activeCust = this.activeQueue[0];
    if (activeCust) {
      this.customerBadgeText.setText(`👑 ${activeCust.name}`);
      this.speechText.setText(localizationManager.t(activeCust.dialogueKey));
    }
  }

  selectQueueSlot(slotIndex) {
    if (slotIndex <= 0 || slotIndex >= this.activeQueue.length) return;

    // Move clicked customer to front of queue
    const selected = this.activeQueue.splice(slotIndex, 1)[0];
    this.activeQueue.unshift(selected);

    // Sync recipe
    const dIdx = this.availableRecipes.findIndex(r => r.id === selected.recipeId);
    if (dIdx !== -1) {
      this.currentDishIndex = dIdx;
    }

    audioManager.playChop();
    this.refreshCustomerQueueUI();
    this.updateDishDisplay();

    // Cheerful bounce tween on slot 0
    if (this.queueSlotContainers[0]) {
      this.tweens.add({
        targets: this.queueSlotContainers[0].container,
        y: this.slotPositions[0].y - 20,
        duration: 140,
        yoyo: true,
        repeat: 1
      });
    }

    // Little bounce on main speech bubble
    this.tweens.add({
      targets: this.mainDialogueContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 120,
      yoyo: true
    });
  }

  handleServedCustomerFlow(servedCust) {
    cookingManager.lastServedCustomer = null;
    this.receivedData = {};

    if (!this.activeQueue || this.activeQueue.length === 0) return;

    // Find the served customer in the queue (usually slot 0)
    const servedIndex = this.activeQueue.findIndex(c => c.id === servedCust.id);
    const targetSlot = (servedIndex >= 0 && servedIndex < 4) ? servedIndex : 0;
    const slot0 = this.queueSlotContainers[targetSlot];

    if (slot0) {
      const texMap = {
        'nasi_lemak': 'dish_nasi_lemak',
        'roti_canai': 'dish_roti_canai',
        'mee_goreng': 'dish_mee_goreng',
        'teh_tarik': 'dish_teh_tarik',
        'satay_ayam': 'dish_satay'
      };
      const recId = servedCust.recipeId || 'nasi_lemak';
      const dishTex = texMap[recId] || 'dish_nasi_lemak';

      // Steaming finished dish plate floating above customer
      const dishPlate = this.add.image(slot0.container.x, slot0.container.y - 75, dishTex).setScale(0.55);
      
      // Floating Thank-You badge
      const thankBubble = this.add.text(slot0.container.x, slot0.container.y - 130, 'TERIMA KASIH MAMA! ❤️', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#e11d48',
        padding: { x: 10, y: 5 },
        fontStyle: 'bold'
      }).setOrigin(0.5);

      try { audioManager.playCoin(); } catch (e) {}

      // Floating celebratory rise
      this.tweens.add({
        targets: [thankBubble, dishPlate],
        y: '-=20',
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 900,
        ease: 'Sine.easeOut'
      });

      // Customer joyful bob / bow
      this.tweens.add({
        targets: slot0.container,
        y: slot0.container.y - 14,
        duration: 220,
        yoyo: true,
        repeat: 2
      });

      // After 1.2s: customer slides off to the left, queue advances forward!
      this.time.delayedCall(1250, () => {
        thankBubble.destroy();
        dishPlate.destroy();

        this.tweens.add({
          targets: slot0.container,
          x: -120,
          alpha: 0,
          duration: 380,
          ease: 'Power2',
          onComplete: () => {
            // Rotate served customer to the back of the queue
            if (servedIndex !== -1) {
              const [served] = this.activeQueue.splice(servedIndex, 1);
              this.activeQueue.push(served);
            } else {
              const served = this.activeQueue.shift();
              this.activeQueue.push(served);
            }

            // Sync stall recipe to the NEW front customer!
            const newFront = this.activeQueue[0];
            if (newFront) {
              const dIdx = this.availableRecipes.findIndex(r => r.id === newFront.recipeId);
              if (dIdx !== -1) this.currentDishIndex = dIdx;
            }

            // Reset slot container transform
            slot0.container.setPosition(this.slotPositions[targetSlot].x, this.slotPositions[targetSlot].y);
            slot0.container.setAlpha(1);

            this.refreshCustomerQueueUI();
            this.updateDishDisplay();
            this.updateStageAndHUD();
            this.btnStartOrder.container.setInteractive(
              new Phaser.Geom.Rectangle(-95, -30, 190, 60),
              Phaser.Geom.Rectangle.Contains
            );
            this.actionContainer.bringToTop(this.btnStartOrder.container);

            const upgradeCheck = playerManager.checkStageUpgrade();
            if (upgradeCheck.upgraded) {
              this.time.delayedCall(450, () => {
                this.showStageUpgradeCelebration(upgradeCheck.oldStage, upgradeCheck.info);
              });
            }

            // Smooth forward slide animation on the remaining slots
            for (let i = 0; i < 4; i++) {
              const sc = this.queueSlotContainers[i];
              if (sc) {
                sc.container.setAlpha(0);
                sc.container.x += 45;
                this.tweens.add({
                  targets: sc.container,
                  x: this.slotPositions[i].x,
                  alpha: 1,
                  duration: 320,
                  delay: i * 70,
                  ease: 'Back.easeOut'
                });
              }
            }

            // Pop in dialogue for the new front customer
            if (this.mainDialogueContainer) {
              this.mainDialogueContainer.setScale(0.8);
              this.tweens.add({
                targets: this.mainDialogueContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 250,
                ease: 'Back.easeOut'
              });
            }
          }
        });
      });
    } else {
      const served = this.activeQueue.shift();
      this.activeQueue.push(served);
      const newFront = this.activeQueue[0];
      if (newFront) {
        const dIdx = this.availableRecipes.findIndex(r => r.id === newFront.recipeId);
        if (dIdx !== -1) this.currentDishIndex = dIdx;
      }
      this.refreshCustomerQueueUI();
      this.updateDishDisplay();
      this.updateStageAndHUD();
      const upgradeCheck = playerManager.checkStageUpgrade();
      if (upgradeCheck.upgraded) {
        this.time.delayedCall(450, () => {
          this.showStageUpgradeCelebration(upgradeCheck.oldStage, upgradeCheck.info);
        });
      }
    }
  }

  createActionPanel() {
    this.actionContainer = this.add.container(640, 580);

    // 1. Dish Showcase Plinth (Rattan Tray Pedestal)
    const plinthG = this.add.graphics();
    plinthG.fillStyle(0x000000, 0.2);
    plinthG.fillEllipse(-260, 48, 140, 32);
    // Woven rattan tray rim
    plinthG.fillStyle(0xd97706, 1);
    plinthG.fillEllipse(-260, 4, 138, 76);
    plinthG.fillStyle(0xfef3c7, 1);
    plinthG.fillEllipse(-260, 0, 134, 72);
    plinthG.lineStyle(2.5, 0x331f12, 1);
    plinthG.strokeEllipse(-260, 0, 134, 72);
    this.actionContainer.add(plinthG);

    // Prev Dish Candy Button (Coral Pink)
    this.btnPrevDish = createButton(this, -378, 0, '◀', {
      width: 46,
      height: 50,
      fontSize: '20px',
      bgColor: 0xfb7185,
      bgDarkColor: 0xe11d48,
      onClick: () => {
        this.changeDish(-1);
      }
    });
    this.actionContainer.add(this.btnPrevDish.container);

    // Plate Preview Image
    this.plateImg = this.add.image(-260, -4, 'dish_nasi_lemak').setScale(0.74);
    this.actionContainer.add(this.plateImg);

    // Next Dish Candy Button (Sky Blue)
    this.btnNextDish = createButton(this, -142, 0, '▶', {
      width: 46,
      height: 50,
      fontSize: '20px',
      bgColor: 0x38bdf8,
      bgDarkColor: 0x0284c7,
      onClick: () => {
        this.changeDish(1);
      }
    });
    this.actionContainer.add(this.btnNextDish.container);

    // 2. Cute Cooking-Game Recipe Card / Clipboard
    const cardBg = this.add.graphics();
    // Drop shadow
    cardBg.fillStyle(0x000000, 0.18);
    cardBg.fillRoundedRect(-108, -71, 544, 150, 18);
    // Warm Cream Parchment Body
    cardBg.fillStyle(0xfffdf5, 1);
    cardBg.fillRoundedRect(-110, -75, 540, 150, 16);
    // Butter Gold Inner Accent Frame
    cardBg.lineStyle(1.8, 0xfcd34d, 1);
    cardBg.strokeRoundedRect(-106, -71, 532, 142, 13);
    // Thick Cartoon Cocoa Outline
    cardBg.lineStyle(3, 0x331f12, 1);
    cardBg.strokeRoundedRect(-110, -75, 540, 150, 16);

    // Wooden Clipboard Top Clip
    cardBg.fillStyle(0xd97706, 1);
    cardBg.fillRoundedRect(-30, -84, 60, 16, 5);
    cardBg.fillStyle(0xfef08a, 1);
    cardBg.fillCircle(0, -76, 4);
    cardBg.lineStyle(2, 0x331f12, 1);
    cardBg.strokeRoundedRect(-30, -84, 60, 16, 5);
    this.actionContainer.add(cardBg);

    // Dish Title
    this.dishNameText = this.add.text(-85, -52, localizationManager.t('recipe.nasiLemak'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#331f12',
      fontStyle: 'bold'
    });
    this.actionContainer.add(this.dishNameText);

    // Dish Description
    this.dishDescText = this.add.text(-85, -22, localizationManager.t('recipe.descNasiLemak'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#78350f',
      wordWrap: { width: 310 }
    });
    this.actionContainer.add(this.dishDescText);

    // Cost & Prep Info Badges (Pastel Pills)
    this.costPrepText = this.add.text(-85, 20, '⏱️ Masa: 60s  |  💰 Kos: RM 4.50', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#331f12',
      fontStyle: 'bold'
    });
    this.actionContainer.add(this.costPrepText);

    // Selling Price Tag (Bright Green Mint Pill)
    this.priceText = this.add.text(-85, 42, '💵 Harga Jualan: RM 8.00  |  ⭐ Sukar: ★★☆', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#047857',
      fontStyle: 'bold'
    });
    this.actionContainer.add(this.priceText);

    // Huge Playful "🍳 AMBIL PESANAN!" Button
    this.btnStartOrder = createButton(this, 335, 14, '🍳 ' + localizationManager.t('restaurant.startOrder'), {
      width: 190,
      height: 54,
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      fontSize: '17px',
      onClick: () => {
        if (this.missionBriefing) {
          this.missionBriefing.destroy(true);
          this.missionBriefing = null;
        }
        let recipe = null;
        let currentCustomer = null;
        let matchingMission = null;
        try {
          gameManager.init();
          recipe = this.availableRecipes[this.currentDishIndex] || recipeManager.getRecipe('nasi_lemak');
          currentCustomer = (this.activeQueue && this.activeQueue[0]) || null;
          matchingMission = recipe
            ? Array.from(gameManager.missions.values()).find(m => m.recipeId === recipe.id)
            : null;
        } catch (err) {
          console.warn('Mission start warning:', err);
        }
        if (recipe) this.openMissionBriefing(recipe, currentCustomer, matchingMission);
      }
    });
    // Explicit hit area is required when the button is nested in the order-card container.
    this.btnStartOrder.container.setInteractive(
      new Phaser.Geom.Rectangle(-95, -30, 190, 60),
      Phaser.Geom.Rectangle.Contains
    );
    this.btnStartOrder.container.setData('action', 'take-order');
    this.actionContainer.add(this.btnStartOrder.container);
    this.actionContainer.bringToTop(this.btnStartOrder.container);

    // Gentle joyful breathing animation on the start order button!
    this.tweens.add({
      targets: this.btnStartOrder.container,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  openMissionBriefing(recipe, customer, mission) {
    if (this.missionBriefing) return;

    const isMs = localizationManager.getLanguage() === 'ms';
    this.missionBriefing = this.add.container(640, 360).setDepth(2000);

    const dim = this.add.graphics();
    dim.fillStyle(0x07111f, 0.78);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.missionBriefing.add(dim);

    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.3);
    card.fillRoundedRect(-364, -264, 728, 536, 28);
    card.fillStyle(0xfffbeb, 1);
    card.fillRoundedRect(-364, -272, 728, 536, 26);
    card.lineStyle(4, 0x713f12, 1);
    card.strokeRoundedRect(-364, -272, 728, 536, 26);
    card.lineStyle(2, 0xfbbf24, 1);
    card.strokeRoundedRect(-354, -262, 708, 516, 20);
    this.missionBriefing.add(card);

    const missionCode = mission?.code || 'ORDER';
    const customerName = customer?.name || (isMs ? 'Pelanggan' : 'Customer');
    const title = this.add.text(0, -225, `${missionCode} • ${localizationManager.t('missions.briefingTitle')}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#713f12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.missionBriefing.add(title);

    const order = this.add.text(0, -180,
      localizationManager.t('missions.customerOrder', {
        customer: customerName,
        dish: localizationManager.t(recipe.nameKey)
      }), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '18px',
        color: '#065f46',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 630 }
      }).setOrigin(0.5);
    this.missionBriefing.add(order);

    const mathSteps = recipe.steps.filter(step => step.type === 'math').length;
    const cookingSteps = recipe.steps.filter(step => step.type === 'minigame').length;
    const objectiveLines = [
      localizationManager.t('missions.objectiveMath', { count: mathSteps }),
      localizationManager.t('missions.objectiveCooking', { count: cookingSteps }),
      localizationManager.t('missions.objectiveProfit', {
        cost: recipe.baseCost.toFixed(2),
        price: recipe.sellingPrice.toFixed(2)
      }),
      localizationManager.t('missions.objectiveStars')
    ];

    const objectivePanel = this.add.graphics();
    objectivePanel.fillStyle(0xecfdf5, 1);
    objectivePanel.fillRoundedRect(-305, -125, 610, 220, 18);
    objectivePanel.lineStyle(2, 0x34d399, 1);
    objectivePanel.strokeRoundedRect(-305, -125, 610, 220, 18);
    this.missionBriefing.add(objectivePanel);

    this.missionBriefing.add(this.add.text(-275, -98, localizationManager.t('missions.objectives'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#047857',
      fontStyle: 'bold'
    }));

    objectiveLines.forEach((line, index) => {
      this.missionBriefing.add(this.add.text(-270, -58 + index * 35, `✓  ${line}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '15px',
        color: '#334155',
        fontStyle: index === 3 ? 'bold' : 'normal'
      }));
    });

    const cancel = createButton(this, -145, 180, localizationManager.t('missions.notYet'), {
      width: 230,
      height: 52,
      fontSize: '16px',
      bgColor: 0x64748b,
      bgDarkColor: 0x475569,
      onClick: () => {
        this.missionBriefing.destroy();
        this.missionBriefing = null;
      }
    });
    this.missionBriefing.add(cancel.container);

    const start = createButton(this, 145, 180, localizationManager.t('missions.enterKitchen'), {
      width: 280,
      height: 52,
      fontSize: '16px',
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      onClick: () => {
        cookingManager.startRecipe(recipe, customer);
        if (mission) gameManager.currentMission = mission;
        this.scene.start('CookingScene');
      }
    });
    this.missionBriefing.add(start.container);

    this.missionBriefing.setScale(0.86);
    this.tweens.add({
      targets: this.missionBriefing,
      scaleX: 1,
      scaleY: 1,
      duration: 260,
      ease: 'Back.easeOut'
    });
  }

  changeDish(dir) {
    if (!this.availableRecipes || this.availableRecipes.length === 0) return;
    this.currentDishIndex = (this.currentDishIndex + dir + this.availableRecipes.length) % this.availableRecipes.length;
    const recipe = this.availableRecipes[this.currentDishIndex];

    if (recipe && this.activeQueue) {
      const qIdx = this.activeQueue.findIndex(c => c.recipeId === recipe.id);
      if (qIdx > 0) {
        const cust = this.activeQueue.splice(qIdx, 1)[0];
        this.activeQueue.unshift(cust);
      }
    }

    this.refreshCustomerQueueUI();
    this.updateDishDisplay();
    audioManager.playChop();

    this.tweens.add({
      targets: this.plateImg,
      scaleX: 0.65,
      scaleY: 0.65,
      duration: 100,
      yoyo: true
    });
  }

  updateDishDisplay() {
    if (!this.availableRecipes || this.availableRecipes.length === 0) return;
    const recipe = this.availableRecipes[this.currentDishIndex];
    if (!recipe) return;

    const texMap = {
      'nasi_lemak': 'dish_nasi_lemak',
      'roti_canai': 'dish_roti_canai',
      'mee_goreng': 'dish_mee_goreng',
      'teh_tarik': 'dish_teh_tarik',
      'satay_ayam': 'dish_satay'
    };
    const texKey = texMap[recipe.id] || 'dish_nasi_lemak';
    if (this.textures.exists(texKey)) {
      this.plateImg.setTexture(texKey);
    }

    this.dishNameText.setText(localizationManager.t(recipe.nameKey));
    this.dishDescText.setText(localizationManager.t(recipe.descKey));
    this.costPrepText.setText(`Kos: RM ${recipe.baseCost.toFixed(2)}  |  Masa: ${recipe.prepTimeSeconds}s`);
    this.priceText.setText(`Harga Jualan: RM ${recipe.sellingPrice.toFixed(2)}`);

    const dialogueMap = {
      'nasi_lemak': 'restaurant.customerDialogue1',
      'roti_canai': 'restaurant.customerDialogueRoti',
      'mee_goreng': 'restaurant.customerDialogueMee',
      'teh_tarik': 'restaurant.customerDialogueTeh',
      'satay_ayam': 'restaurant.customerDialogueSatay'
    };
    const dKey = dialogueMap[recipe.id] || 'restaurant.customerDialogue1';
    this.speechText.setText(localizationManager.t(dKey));
  }

  openShopModal() {
    if (this.shopModal) return;

    this.shopModal = this.add.container(640, 360);

    // Dim backdrop
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.7);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.shopModal.add(dim);

    // Modal Panel
    const panel = createPanel(this, 0, 0, 700, 480);
    this.shopModal.add(panel.container);

    // Title
    const title = this.add.text(0, -200, localizationManager.t('shop.title'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopModal.add(title);

    // Equipment items list
    let itemY = -120;
    equipmentData.forEach(item => {
      const isOwned = playerManager.hasEquipment(item.id);
      const row = this.add.container(0, itemY);

      const rowBg = this.add.graphics();
      rowBg.fillStyle(THEME.panelLight, 0.98);
      rowBg.fillRoundedRect(-310, -35, 620, 70, 12);
      rowBg.lineStyle(1.5, THEME.panelBorder, 0.9);
      rowBg.strokeRoundedRect(-310, -35, 620, 70, 12);
      row.add(rowBg);

      const itemName = this.add.text(-290, -18, localizationManager.t(item.nameKey), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: THEME.textDark,
        fontStyle: 'bold'
      });
      row.add(itemName);

      const itemDesc = this.add.text(-290, 8, localizationManager.t(item.descKey), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: THEME.textMuted
      });
      row.add(itemDesc);

      if (isOwned) {
        const ownedLabel = this.add.text(230, 0, localizationManager.t('shop.owned'), {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '16px',
          color: '#4ade80',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        row.add(ownedLabel);
      } else {
        const buyBtn = createButton(this, 230, 0, `RM ${item.price}`, {
          width: 120,
          height: 38,
          fontSize: '15px',
          bgColor: playerManager.player.coins >= item.price ? THEME.primary : 0x475569,
          onClick: () => {
            if (playerManager.spendCoins(item.price)) {
              playerManager.unlockEquipment(item.id);
              audioManager.playCoin();
              gameManager.saveCurrentState();
              this.closeShopModal();
              this.openShopModal();
              this.refreshHUD();
            } else {
              audioManager.playWrong();
            }
          }
        });
        row.add(buyBtn.container);
      }

      this.shopModal.add(row);
      itemY += 85;
    });

    // Close button
    const closeBtn = createButton(this, 0, 190, localizationManager.t('shop.close'), {
      width: 160,
      height: 44,
      bgColor: 0xef4444,
      bgDarkColor: 0xdc2626,
      fontSize: '17px',
      onClick: () => {
        this.closeShopModal();
      }
    });
    this.shopModal.add(closeBtn.container);
  }

  closeShopModal() {
    if (this.shopModal) {
      this.shopModal.destroy();
      this.shopModal = null;
    }
  }

  openRecipeBookModal() {
    if (this.recipeModal) return;

    this.recipeModal = this.add.container(640, 360);

    // Dim backdrop
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.75);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.recipeModal.add(dim);

    // Modal Panel
    const panel = createPanel(this, 0, 0, 820, 520);
    this.recipeModal.add(panel.container);

    // Title
    const title = this.add.text(0, -225, '📖 ' + (localizationManager.t('recipe.selectRecipe') || 'MENU & BUKU RESEPI'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.recipeModal.add(title);

    // Subtitle
    const sub = this.add.text(0, -195, 'Pilih hidangan untuk dimasak di Warung anda:', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    this.recipeModal.add(sub);

    // List of recipes
    let cardY = -140;
    this.availableRecipes.forEach((recipe, idx) => {
      const isSelected = this.currentDishIndex === idx;
      const row = this.add.container(0, cardY);

      const rowBg = this.add.graphics();
      rowBg.fillStyle(isSelected ? 0xd8f2e8 : THEME.panelLight, 0.98);
      rowBg.fillRoundedRect(-370, -30, 740, 60, 12);
      rowBg.lineStyle(isSelected ? 2 : 1.5, isSelected ? THEME.secondaryDark : THEME.panelBorder, 0.95);
      rowBg.strokeRoundedRect(-370, -30, 740, 60, 12);
      row.add(rowBg);

      // Recipe Name
      const nameTxt = this.add.text(-350, -18, localizationManager.t(recipe.nameKey), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: isSelected ? '#047857' : THEME.textDark,
        fontStyle: 'bold'
      });
      row.add(nameTxt);

      // Category & Price
      const infoTxt = this.add.text(-350, 6, `Harga: RM ${recipe.sellingPrice.toFixed(2)}  |  Kos: RM ${recipe.baseCost.toFixed(2)}  |  Masa: ${recipe.prepTimeSeconds}s`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: THEME.textMuted
      });
      row.add(infoTxt);

      // Select / Cook button
      const btnTxt = isSelected ? 'DIPILIH ✓' : (localizationManager.t('recipe.cookNow') || 'PILIH MASAK');
      const selectBtn = createButton(this, 280, 0, btnTxt, {
        width: 140,
        height: 38,
        bgColor: isSelected ? 0x059669 : THEME.secondary,
        bgDarkColor: isSelected ? 0x047857 : THEME.secondaryDark,
        fontSize: '14px',
        onClick: () => {
          this.currentDishIndex = idx;
          const rec = this.availableRecipes[this.currentDishIndex];
          if (rec && this.activeQueue) {
            const qIdx = this.activeQueue.findIndex(c => c.recipeId === rec.id);
            if (qIdx > 0) {
              const cust = this.activeQueue.splice(qIdx, 1)[0];
              this.activeQueue.unshift(cust);
            }
          }
          this.refreshCustomerQueueUI();
          this.updateDishDisplay();
          audioManager.playChop();
          this.closeRecipeBookModal();
        }
      });
      row.add(selectBtn.container);

      this.recipeModal.add(row);
      cardY += 68;
    });

    // Close button
    const closeBtn = createButton(this, 0, 225, localizationManager.t('shop.close') || 'TUTUP', {
      width: 150,
      height: 42,
      bgColor: 0xef4444,
      bgDarkColor: 0xdc2626,
      fontSize: '16px',
      onClick: () => {
        this.closeRecipeBookModal();
      }
    });
    this.recipeModal.add(closeBtn.container);
  }

  closeRecipeBookModal() {
    if (this.recipeModal) {
      this.recipeModal.destroy();
      this.recipeModal = null;
    }
  }

  updateStageAndHUD() {
    const isMs = localizationManager.getLanguage() === 'ms';
    const player = playerManager.player;
    const stageInfo = playerManager.getStageInfo();

    // 1. Update coins, stars, and level chip
    if (this.coinsValText) {
      this.coinsValText.setText(`RM ${(player?.coins || 0).toFixed(2)}`);
    }
    if (this.starsValText) {
      this.starsValText.setText(`${player?.stars || 0} ★`);
    }
    if (this.levelBadgeText) {
      this.levelBadgeText.setText(isMs ? `Tahap ${player?.level || 1}` : `Lvl ${player?.level || 1}`);
    }

    // 2. Update stall name
    const stallName = isMs ? stageInfo.stallMs : stageInfo.stallEn;
    if (this.stallNameText) {
      this.stallNameText.setText(stallName);
    }

    // 3. Update stage subtitle & progress
    const stageTitle = isMs ? stageInfo.titleMs : stageInfo.titleEn;
    let subtitleStr = '';
    if (stageInfo.isMax) {
      subtitleStr = `${stageInfo.icon} ${stageTitle} • ★ MAX LEVEL ★ 📋`;
    } else {
      const remaining = stageInfo.dishesNeeded;
      const countText = isMs 
        ? `${remaining} hidangan lagi ke Peringkat ${stageInfo.stage + 1}` 
        : `${remaining} more dishes to Stage ${stageInfo.stage + 1}`;
      subtitleStr = `${stageInfo.icon} ${stageTitle} • ${countText} 📋`;
    }

    if (this.stageSubtitle) {
      this.stageSubtitle.setText(subtitleStr);
    }
  }

  refreshHUD() {
    this.updateStageAndHUD();
  }

  refreshTexts() {
    this.btnStartOrder.setText('🍳 ' + localizationManager.t('restaurant.startOrder'));
    this.btnShop.setText('🏪 ' + localizationManager.t('restaurant.shop'));
    if (this.btnRecipes) {
      this.btnRecipes.setText('📖 ' + (localizationManager.t('restaurant.recipeBook') || 'RESIPI'));
    }
    this.btnMap.setText('🗺️ ' + localizationManager.t('restaurant.worldMap'));
    this.btnQuickLang.setText(localizationManager.getLanguage().toUpperCase());
    this.updateDishDisplay();
    this.updateStageAndHUD();
  }

  openStageRoadmapModal() {
    if (this.roadmapModal) {
      this.closeStageRoadmapModal();
    }

    const isMs = localizationManager.getLanguage() === 'ms';
    const stageInfo = playerManager.getStageInfo();
    const allStages = playerManager.getAllStages();
    const currentDishes = stageInfo.currentDishes;

    this.roadmapModal = this.add.container(640, 360);
    this.roadmapModal.setDepth(100);

    // Dim background
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.72);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    dim.on('pointerdown', () => this.closeStageRoadmapModal());
    this.roadmapModal.add(dim);

    // Modal Panel (Cute pastel cream card with cartoon outline)
    const modalBox = this.add.graphics();
    modalBox.fillStyle(0x000000, 0.25);
    modalBox.fillRoundedRect(-456, -306, 912, 612, 22);
    modalBox.fillStyle(0xfffdf5, 1);
    modalBox.fillRoundedRect(-450, -300, 900, 600, 20);
    modalBox.lineStyle(3.5, 0x331f12, 1);
    modalBox.strokeRoundedRect(-450, -300, 900, 600, 20);
    this.roadmapModal.add(modalBox);

    // Header Ribbon Banner
    const ribbon = this.add.graphics();
    ribbon.fillStyle(0xf59e0b, 1);
    ribbon.fillRoundedRect(-360, -285, 720, 48, 14);
    ribbon.lineStyle(2.5, 0x331f12, 1);
    ribbon.strokeRoundedRect(-360, -285, 720, 48, 14);
    this.roadmapModal.add(ribbon);

    const titleText = this.add.text(0, -261, isMs ? '🏆 RANGKAIAN RESTORAN MAMA (7 PERINGKAT)' : "🏆 MAMA'S RESTAURANT ROADMAP (7 STAGES)", {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.roadmapModal.add(titleText);

    // Progress Subtitle Card
    const progBox = this.add.graphics();
    progBox.fillStyle(0xfef3c7, 1);
    progBox.fillRoundedRect(-410, -225, 820, 36, 10);
    progBox.lineStyle(1.5, 0xd97706, 0.8);
    progBox.strokeRoundedRect(-410, -225, 820, 36, 10);
    this.roadmapModal.add(progBox);

    const progStr = isMs 
      ? `🍽️ Jumlah Hidangan Disediakan: ${currentDishes}  |  Peringkat Semasa: ${stageInfo.stage}/7 (${stageInfo.titleMs})`
      : `🍽️ Total Dishes Served: ${currentDishes}  |  Current Stage: ${stageInfo.stage}/7 (${stageInfo.titleEn})`;
    const progText = this.add.text(0, -207, progStr, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#78350f',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.roadmapModal.add(progText);

    // 7 Stage Cards
    let startY = -160;
    const rowH = 54;
    allStages.forEach((s) => {
      const isCurrent = s.stage === stageInfo.stage;
      const isUnlocked = s.stage < stageInfo.stage;

      const row = this.add.container(0, startY);

      const rowG = this.add.graphics();
      if (isCurrent) {
        // Glowing gold highlight
        rowG.fillStyle(0xfef08a, 1);
        rowG.fillRoundedRect(-410, -22, 820, rowH - 6, 10);
        rowG.lineStyle(2.5, 0xd97706, 1);
        rowG.strokeRoundedRect(-410, -22, 820, rowH - 6, 10);
      } else if (isUnlocked) {
        // Soft mint for completed
        rowG.fillStyle(0xecfdf5, 1);
        rowG.fillRoundedRect(-410, -22, 820, rowH - 6, 10);
        rowG.lineStyle(1.5, 0x10b981, 0.8);
        rowG.strokeRoundedRect(-410, -22, 820, rowH - 6, 10);
      } else {
        // Muted pastel gray/white for locked
        rowG.fillStyle(0xf8fafc, 1);
        rowG.fillRoundedRect(-410, -22, 820, rowH - 6, 10);
        rowG.lineStyle(1.5, 0xcbd5e1, 0.8);
        rowG.strokeRoundedRect(-410, -22, 820, rowH - 6, 10);
      }
      row.add(rowG);

      // Icon & Stage Title
      const iconTxt = this.add.text(-395, 2, s.icon, {
        fontSize: '22px'
      }).setOrigin(0, 0.5);
      row.add(iconTxt);

      const titleName = isMs ? s.ms : s.en;
      const nameTxt = this.add.text(-360, -8, titleName, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: isCurrent ? '#92400e' : (isUnlocked ? '#065f46' : '#64748b'),
        fontStyle: 'bold'
      });
      row.add(nameTxt);

      // Requirements and perks
      const reqStr = s.reqDishes === 0 
        ? (isMs ? 'Bermula (0 hidangan)' : 'Starting (0 dishes)')
        : (isMs ? `Perlu: ${s.reqDishes} hidangan / Lvl ${s.reqLevel}` : `Req: ${s.reqDishes} dishes / Lvl ${s.reqLevel}`);
      const perkStr = isMs ? s.perkMs : s.perkEn;
      const detailTxt = this.add.text(-360, 10, `${reqStr}  •  ${perkStr}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        color: isCurrent ? '#78350f' : (isUnlocked ? '#047857' : '#94a3b8'),
        fontStyle: 'bold'
      });
      row.add(detailTxt);

      // Status Badge
      let badgeLabel = '';
      let badgeBg = 0x94a3b8;
      if (isCurrent) {
        badgeLabel = isMs ? '★ AKTIF' : '★ ACTIVE';
        badgeBg = 0xf59e0b;
      } else if (isUnlocked) {
        badgeLabel = isMs ? '✓ DIBUKA' : '✓ UNLOCKED';
        badgeBg = 0x10b981;
      } else {
        const remaining = Math.max(0, s.reqDishes - currentDishes);
        badgeLabel = isMs ? `🔒 KUNCI (-${remaining})` : `🔒 LOCKED (-${remaining})`;
        badgeBg = 0x94a3b8;
      }

      const badgeG = this.add.graphics();
      badgeG.fillStyle(badgeBg, 1);
      badgeG.fillRoundedRect(280, -14, 115, 26, 8);
      badgeG.lineStyle(1.5, 0x331f12, 0.8);
      badgeG.strokeRoundedRect(280, -14, 115, 26, 8);
      row.add(badgeG);

      const badgeText = this.add.text(337, -1, badgeLabel, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      row.add(badgeText);

      this.roadmapModal.add(row);
      startY += rowH;
    });

    // Close Button (Coral Pink)
    const closeBtn = createButton(this, 0, 255, isMs ? '✓ FAHAM & TUTUP' : '✓ GOT IT & CLOSE', {
      width: 220,
      height: 44,
      bgColor: 0xfb7185,
      bgDarkColor: 0xe11d48,
      fontSize: '15px',
      onClick: () => {
        this.closeStageRoadmapModal();
      }
    });
    this.roadmapModal.add(closeBtn.container);

    // Top Right Quick Close 'X'
    const xBtn = createButton(this, 415, -270, '✕', {
      width: 36,
      height: 36,
      bgColor: 0xef4444,
      bgDarkColor: 0xdc2626,
      fontSize: '16px',
      onClick: () => {
        this.closeStageRoadmapModal();
      }
    });
    this.roadmapModal.add(xBtn.container);

    // Pop-in bounce
    this.roadmapModal.setScale(0.85);
    this.tweens.add({
      targets: this.roadmapModal,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: 'Back.easeOut'
    });
  }

  closeStageRoadmapModal() {
    if (this.roadmapModal) {
      this.roadmapModal.destroy();
      this.roadmapModal = null;
    }
  }

  showStageUpgradeCelebration(oldStage, stageInfo) {
    if (this.celebrationModal) {
      this.celebrationModal.destroy();
      this.celebrationModal = null;
    }

    try {
      audioManager.playLevelUp();
    } catch (e) {}

    const isMs = localizationManager.getLanguage() === 'ms';

    // Celebration modal container
    this.celebrationModal = this.add.container(640, 360);
    this.celebrationModal.setDepth(150);

    // Dim background
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.78);
    dim.fillRect(-640, -360, 1280, 720);
    dim.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.celebrationModal.add(dim);

    // Confetti particles burst
    const colors = [0xfb7185, 0xfde047, 0x38bdf8, 0x4ade80, 0xc084fc, 0xf97316];
    for (let i = 0; i < 45; i++) {
      const conf = this.add.graphics();
      const col = colors[i % colors.length];
      conf.fillStyle(col, 1);
      if (i % 2 === 0) {
        conf.fillRect(-6, -6, 12, 12);
      } else {
        conf.fillCircle(0, 0, 7);
      }
      const startX = Phaser.Math.Between(-300, 300);
      const startY = Phaser.Math.Between(-280, -100);
      conf.setPosition(startX, startY);
      this.celebrationModal.add(conf);

      this.tweens.add({
        targets: conf,
        x: startX + Phaser.Math.Between(-160, 160),
        y: startY + Phaser.Math.Between(260, 520),
        angle: Phaser.Math.Between(-360, 360),
        alpha: 0,
        duration: Phaser.Math.Between(1500, 2400),
        ease: 'Cubic.easeOut'
      });
    }

    // Modal Box (Warm Cream with Thick Cocoa border)
    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.25);
    box.fillRoundedRect(-316, -236, 632, 472, 22);
    box.fillStyle(0xfffdf5, 1);
    box.fillRoundedRect(-310, -230, 620, 460, 20);
    box.lineStyle(3.5, 0x331f12, 1);
    box.strokeRoundedRect(-310, -230, 620, 460, 20);
    this.celebrationModal.add(box);

    // Golden Celebration Banner Ribbon
    const banner = this.add.graphics();
    banner.fillStyle(0xf59e0b, 1);
    banner.fillRoundedRect(-260, -220, 520, 48, 14);
    banner.lineStyle(2.5, 0x331f12, 1);
    banner.strokeRoundedRect(-260, -220, 520, 48, 14);
    this.celebrationModal.add(banner);

    const bannerTitle = this.add.text(0, -196, isMs ? '🎉 TAHNIAH! NAIK PERINGKAT! 🎉' : '🎉 CONGRATULATIONS! STAGE UPGRADE! 🎉', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(bannerTitle);

    // Big Stage Icon with pulsing tween
    const iconTxt = this.add.text(0, -135, stageInfo.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.celebrationModal.add(iconTxt);
    this.tweens.add({
      targets: iconTxt,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // New Stage Name & Stall Name
    const newStageName = isMs ? stageInfo.titleMs : stageInfo.titleEn;
    const stageNameText = this.add.text(0, -90, newStageName, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#b45309',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(stageNameText);

    const stallName = isMs ? stageInfo.stallMs : stageInfo.stallEn;
    const stallNameText = this.add.text(0, -62, `"${stallName}"`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#78350f',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(stallNameText);

    // Rewards & Perks Card
    const cardG = this.add.graphics();
    cardG.fillStyle(0xfef3c7, 1);
    cardG.fillRoundedRect(-270, -40, 540, 185, 14);
    cardG.lineStyle(2, 0xd97706, 0.8);
    cardG.strokeRoundedRect(-270, -40, 540, 185, 14);
    this.celebrationModal.add(cardG);

    const perkHeader = this.add.text(0, -22, isMs ? '🎁 GANJARAN NAIK PERINGKAT' : '🎁 STAGE UNLOCK REWARDS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#92400e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(perkHeader);

    // Cash Bonus
    const coinRow = this.add.text(0, 10, isMs ? `💰 Bonus Wang Tunai: +RM ${stageInfo.rewardCoins.toFixed(2)}` : `💰 Cash Bonus: +RM ${stageInfo.rewardCoins.toFixed(2)}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#059669',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(coinRow);

    // Star Bonus
    const starRow = this.add.text(0, 40, isMs ? `⭐ Bonus Bintang: +${stageInfo.rewardStars} ★` : `⭐ Star Bonus: +${stageInfo.rewardStars} ★`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#d97706',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.celebrationModal.add(starRow);

    // Special Perk description
    const perkDesc = isMs ? stageInfo.perkMs : stageInfo.perkEn;
    const perkText = this.add.text(0, 76, `✨ ${perkDesc}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#331f12',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);
    this.celebrationModal.add(perkText);

    const descText = this.add.text(0, 110, isMs ? stageInfo.descMs : stageInfo.descEn, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#78350f',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);
    this.celebrationModal.add(descText);

    // Keep Cooking Button
    const btnContinue = createButton(this, 0, 185, isMs ? '🍳 TERUSKAN MEMASAK!' : '🍳 KEEP COOKING!', {
      width: 250,
      height: 48,
      bgColor: 0x10b981,
      bgDarkColor: 0x059669,
      fontSize: '16px',
      onClick: () => {
        if (this.celebrationModal) {
          this.celebrationModal.destroy();
          this.celebrationModal = null;
        }
        this.updateStageAndHUD();
      }
    });
    this.celebrationModal.add(btnContinue.container);

    // Pop-in bounce
    this.celebrationModal.setScale(0.8);
    this.tweens.add({
      targets: this.celebrationModal,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.updateStageAndHUD();
  }

  shutdown() {
    if (this.unsubscribeLoc) {
      this.unsubscribeLoc();
      this.unsubscribeLoc = null;
    }
  }
}

export default RestaurantScene;
