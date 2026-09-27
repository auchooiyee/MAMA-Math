class PlayerManager {
  constructor() {
    this.player = null;
    this.equipment = [];
    this.completedMissions = {};
    this.stats = null;
  }

  init(saveData) {
    this.player = saveData.player;
    this.equipment = saveData.equipment || [];
    this.completedMissions = saveData.completedMissions || {};
    this.stats = saveData.stats || {
      totalDishesServed: 0,
      mathQuestionsAnswered: 0,
      mathAccuracySum: 0,
      totalProfitRM: 0
    };
    if (!this.player.stage) {
      this.player.stage = this.getRestaurantStage();
    }
  }

  addXP(amount) {
    this.player.xp += amount;
    let leveledUp = false;
    while (this.player.level < 100 && this.player.xp >= this.getXPForLevel(this.player.level + 1)) {
      this.player.level += 1;
      leveledUp = true;
    }
    return { leveledUp, currentLevel: this.player.level, xp: this.player.xp };
  }

  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  getRestaurantStage() {
    const dishes = this.stats?.totalDishesServed || 0;
    const level = this.player?.level || 1;
    if (level >= 7 || dishes >= 25) return 7;
    if (level >= 6 || dishes >= 20) return 6;
    if (level >= 5 || dishes >= 15) return 5;
    if (level >= 4 || dishes >= 10) return 4;
    if (level >= 3 || dishes >= 6) return 3;
    if (level >= 2 || dishes >= 3) return 2;
    return 1;
  }

  getAllStages() {
    return [
      {
        stage: 1,
        reqDishes: 0,
        nextDishes: 3,
        reqLevel: 1,
        ms: 'Peringkat 1: Gerai Tepi Jalan',
        en: 'Stage 1: Roadside Stall',
        stallMs: 'Gerai Tepi Jalan Mak Cik Salmah',
        stallEn: "Mak Cik Salmah's Roadside Stall",
        descMs: 'Sebuah warung payung sederhana di pinggir jalan menjual Nasi Lemak Sambal.',
        descEn: 'A cozy humble roadside stall serving warm Sambal Nasi Lemak under an umbrella.',
        perkMs: 'Pelanggan Asas: Pak Ali & Uncle Muthu',
        perkEn: 'Basic Customers: Pak Ali & Uncle Muthu',
        rewardCoins: 0,
        rewardStars: 0,
        icon: '⛺'
      },
      {
        stage: 2,
        reqDishes: 3,
        nextDishes: 6,
        reqLevel: 2,
        ms: 'Peringkat 2: Kedai Makan',
        en: 'Stage 2: Local Eatery',
        stallMs: 'Kedai Makan Selera Salmah',
        stallEn: "Salmah's Local Eatery",
        descMs: 'Gerai beratap zink dengan meja makan selesa dan menu Roti Canai Crispy.',
        descEn: 'A covered wooden eatery with dining tables and crispy Roti Canai.',
        perkMs: 'Buka Menu Roti Canai + Pelanggan: Kak Siti (+10% Tips)',
        perkEn: 'Unlock Roti Canai + Customer: Kak Siti (+10% Tips)',
        rewardCoins: 25,
        rewardStars: 5,
        icon: '🍜'
      },
      {
        stage: 3,
        reqDishes: 6,
        nextDishes: 10,
        reqLevel: 3,
        ms: 'Peringkat 3: Kopitiam Klasik',
        en: 'Stage 3: Classic Kopitiam',
        stallMs: 'Kopitiam Tradisi Mak Cik Salmah',
        stallEn: "Salmah's Classic Kopitiam",
        descMs: 'Kopitiam gaya retro dengan cawan marmar, aroma kopi & Mee Goreng Mamak panas.',
        descEn: 'A retro marble-table kopitiam rich in kopi aroma and sizzling Mee Goreng.',
        perkMs: 'Buka Menu Mee Goreng + Pelanggan: Ah Ming (+15% Tips)',
        perkEn: 'Unlock Mee Goreng + Customer: Ah Ming (+15% Tips)',
        rewardCoins: 50,
        rewardStars: 10,
        icon: '☕'
      },
      {
        stage: 4,
        reqDishes: 10,
        nextDishes: 15,
        reqLevel: 4,
        ms: 'Peringkat 4: Medan Selera',
        en: 'Stage 4: Food Court',
        stallMs: 'Medan Selera Rasa Salmah',
        stallEn: "Salmah's Food Court Outlet",
        descMs: 'Kios moden di medan selera berhawa dingin dengan barisan pelanggan yang panjang.',
        descEn: 'A bustling air-conditioned food court outlet attracting nonstop crowds.',
        perkMs: 'Buka Menu Teh Tarik Buih + Pelanggan: Kak Ros (+20% Tips)',
        perkEn: 'Unlock Frothy Teh Tarik + Customer: Kak Ros (+20% Tips)',
        rewardCoins: 80,
        rewardStars: 15,
        icon: '🍱'
      },
      {
        stage: 5,
        reqDishes: 15,
        nextDishes: 20,
        reqLevel: 5,
        ms: 'Peringkat 5: Kafe Moden',
        en: 'Stage 5: Modern Café',
        stallMs: 'Kafe Moden Salmah',
        stallEn: "Salmah's Modern Café",
        descMs: 'Kafe bergaya hipster fusion dengan hiasan neon & Satay Ayam panggang istimewa.',
        descEn: 'An aesthetic fusion cafe featuring warm neon lights and aromatic grilled Satay.',
        perkMs: 'Buka Satay Ayam Bakar + Pengganda XP x1.25',
        perkEn: 'Unlock Charcoal Satay + XP Multiplier x1.25',
        rewardCoins: 120,
        rewardStars: 20,
        icon: '🍰'
      },
      {
        stage: 6,
        reqDishes: 20,
        nextDishes: 25,
        reqLevel: 6,
        ms: 'Peringkat 6: Restoran Warisan',
        en: 'Stage 6: Heritage Restaurant',
        stallMs: 'Restoran Warisan Salmah',
        stallEn: "Salmah's Heritage Restaurant",
        descMs: 'Restoran bertaraf antarabangsa menyajikan warisan kulinari Malaysia autentik.',
        descEn: 'A premier heritage establishment celebrated for authentic Malaysian culinary arts.',
        perkMs: 'Buka Pelanggan VIP & Pengkritik Makanan (+30% Tips)',
        perkEn: 'Unlock VIP Food Critics & Celebrities (+30% Tips)',
        rewardCoins: 180,
        rewardStars: 25,
        icon: '🍲'
      },
      {
        stage: 7,
        reqDishes: 25,
        nextDishes: 999,
        reqLevel: 7,
        ms: 'Peringkat 7: Empayar Makanan',
        en: 'Stage 7: Food Empire',
        stallMs: 'Empayar Makanan Salmah & Mama',
        stallEn: "Salmah's Food Empire",
        descMs: 'Kemuncak kejayaan! Rangkaian empayar makanan tersohor seluruh negara!',
        descEn: 'The ultimate pinnacle! A nationwide franchise culinary empire across Malaysia!',
        perkMs: 'Gelaran Master Chef MAMA + Mahkota Emas (+50% Tips)',
        perkEn: 'Master Chef MAMA Title + Golden Crown (+50% Tips)',
        rewardCoins: 250,
        rewardStars: 50,
        icon: '👑'
      }
    ];
  }

  getStageInfo() {
    const stageNum = this.getRestaurantStage();
    const dishes = this.stats?.totalDishesServed || 0;
    const stageDefs = this.getAllStages();

    const current = stageDefs[stageNum - 1];
    const isMax = stageNum >= 7;
    const next = isMax ? null : stageDefs[stageNum];
    const dishesNeeded = next ? Math.max(0, next.reqDishes - dishes) : 0;
    const progressInStage = next ? Math.min(1, Math.max(0, (dishes - current.reqDishes) / (next.reqDishes - current.reqDishes))) : 1;

    return {
      stage: stageNum,
      titleMs: current.ms,
      titleEn: current.en,
      stallMs: current.stallMs,
      stallEn: current.stallEn,
      descMs: current.descMs,
      descEn: current.descEn,
      perkMs: current.perkMs,
      perkEn: current.perkEn,
      rewardCoins: current.rewardCoins,
      rewardStars: current.rewardStars,
      icon: current.icon,
      currentDishes: dishes,
      nextDishes: next ? next.reqDishes : dishes,
      dishesNeeded,
      progressInStage,
      isMax
    };
  }

  checkStageUpgrade() {
    const currentStage = this.getRestaurantStage();
    const prevStage = this.player?.stage || 1;
    if (currentStage > prevStage) {
      this.player.stage = currentStage;
      const info = this.getStageInfo();
      // Grant reward bonus
      if (info.rewardCoins > 0) {
        this.addCoins(info.rewardCoins);
      }
      if (info.rewardStars > 0) {
        this.player.stars = (this.player.stars || 0) + info.rewardStars;
      }
      this.save();
      return { upgraded: true, oldStage: prevStage, newStage: currentStage, info };
    }
    return { upgraded: false, stage: currentStage, info: this.getStageInfo() };
  }

  addCoins(amount) {
    this.player.coins += amount;
    return this.player.coins;
  }

  spendCoins(amount) {
    if (this.player.coins >= amount) {
      this.player.coins -= amount;
      return true;
    }
    return false;
  }

  hasEquipment(equipmentId) {
    return this.equipment.includes(equipmentId);
  }

  unlockEquipment(equipmentId) {
    if (!this.equipment.includes(equipmentId)) {
      this.equipment.push(equipmentId);
    }
  }

  recordMissionCompleted(missionId, stars, accuracy) {
    const prevStars = this.completedMissions[missionId]?.stars || 0;
    if (stars > prevStars) {
      this.player.stars += (stars - prevStars);
    }
    this.completedMissions[missionId] = {
      stars: Math.max(stars, prevStars),
      accuracy,
      timestamp: Date.now()
    };
    this.stats.totalDishesServed += 1;
  }

  toJSON() {
    return {
      player: this.player,
      equipment: this.equipment,
      completedMissions: this.completedMissions,
      stats: this.stats
    };
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('math_mama_player_data', JSON.stringify(this.toJSON()));
      }
    } catch (e) {
      // safe fallback
    }
  }
}

export const playerManager = new PlayerManager();
export default playerManager;
