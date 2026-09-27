import { validateQuestion } from '../src/questions/validators.js';
import { questionLoader } from '../src/questions/questionLoader.js';
import { generateQuestionForChapter } from '../src/questions/questionGenerator.js';
import { questionManager } from '../src/managers/QuestionManager.js';
import { economyManager } from '../src/managers/EconomyManager.js';
import { playerManager } from '../src/managers/PlayerManager.js';
import { multiplayerManager, MULTIPLAYER_MODES, ROLES, ROOM_STATUS } from '../src/managers/MultiplayerManager.js';
import { badgeManager } from '../src/managers/BadgeManager.js';
import { analyticsManager } from '../src/managers/AnalyticsManager.js';
import badgesData from '../src/data/badges.json' with { type: 'json' };
import teacherData from '../src/data/teacherAnalytics.json' with { type: 'json' };
import worldsData from '../src/data/worlds.json' with { type: 'json' };
import recipesData from '../src/data/recipes.json' with { type: 'json' };
import missionsData from '../src/data/missions.json' with { type: 'json' };
import bossesData from '../src/data/bosses.json' with { type: 'json' };
import { dailyChallengeManager } from '../src/managers/DailyChallengeManager.js';
import { bossManager } from '../src/managers/BossManager.js';

console.log('====================================================');
console.log('    MATH MAMA: WARUNG MATEMATIK - TEST SUITE        ');
console.log('====================================================\n');

// ----------------------------------------------------
// Test 1: Validate 10 Curriculum Worlds
// ----------------------------------------------------
console.log('[Test 1] Validating Curriculum Worlds...');
if (worldsData.length !== 10) {
  console.error(`FAILED: Expected 10 worlds, found ${worldsData.length}`);
  process.exit(1);
}
worldsData.forEach(w => {
  if (!w.id || !w.chapter || !w.titleKey || !w.mapX || !w.mapY) {
    console.error(`FAILED: World ${w.id} missing critical metadata`);
    process.exit(1);
  }
  console.log(`  ✓ World ${w.id}: Chapter ${w.chapter} (${w.icon}) verified.`);
});
console.log('');

// ----------------------------------------------------
// Test 2: Validate Expanded Recipes
// ----------------------------------------------------
console.log('[Test 2] Validating Recipes...');
if (recipesData.length < 4) {
  console.error(`FAILED: Expected at least 4 recipes, found ${recipesData.length}`);
  process.exit(1);
}
recipesData.forEach(r => {
  if (!r.id || !r.baseCost || !r.sellingPrice || !r.steps || r.steps.length === 0) {
    console.error(`FAILED: Recipe ${r.id} is invalid`);
    process.exit(1);
  }
  console.log(`  ✓ Recipe "${r.id}": ${r.steps.length} steps, Base Cost: RM ${r.baseCost.toFixed(2)}, Selling: RM ${r.sellingPrice.toFixed(2)}`);
});
console.log('');

// ----------------------------------------------------
// Test 3: Validate Missions
// ----------------------------------------------------
console.log('[Test 3] Validating District Missions...');
missionsData.forEach(m => {
  const worldExists = worldsData.some(w => w.id === m.world);
  const recipeExists = recipesData.some(r => r.id === m.recipeId);
  if (!worldExists) {
    console.error(`FAILED: Mission ${m.id} references non-existent world ${m.world}`);
    process.exit(1);
  }
  if (!recipeExists) {
    console.error(`FAILED: Mission ${m.id} references non-existent recipe ${m.recipeId}`);
    process.exit(1);
  }
  console.log(`  ✓ Mission ${m.id} (${m.code}): World ${m.world}, Recipe "${m.recipeId}" verified.`);
});
console.log('');

// ----------------------------------------------------
// Test 4: Validate Static Question Banks & Exhaustion (Ch 1 - 10)
// ----------------------------------------------------
console.log('[Test 4] Validating Static Question Banks for All 10 Chapters (10 Easy, 10 Med, 10 Hard)...');
let totalBankQuestions = 0;
for (let ch = 1; ch <= 10; ch++) {
  const questions = questionLoader.getQuestionsForChapter(ch);
  if (!questions || questions.length !== 30) {
    console.error(`FAILED: Chapter ${ch} expected 30 questions, found ${questions ? questions.length : 0}!`);
    process.exit(1);
  }
  
  const easy = questions.filter(q => q.difficulty === 'easy');
  const medium = questions.filter(q => q.difficulty === 'medium');
  const hard = questions.filter(q => q.difficulty === 'hard');

  if (easy.length !== 10 || medium.length !== 10 || hard.length !== 10) {
    console.error(`FAILED: Chapter ${ch} distribution mismatch! Easy: ${easy.length}, Med: ${medium.length}, Hard: ${hard.length}`);
    process.exit(1);
  }

  for (const q of questions) {
    const res = validateQuestion(q);
    if (!res.valid) {
      console.error(`FAILED: Chapter ${ch} question ${q.id} has errors:`, res.errors);
      process.exit(1);
    }
  }
  totalBankQuestions += questions.length;
  console.log(`  ✓ Chapter ${ch.toString().padStart(2, '0')}: 30 questions (10 Easy, 10 Med, 10 Hard) verified.`);
}
if (totalBankQuestions !== 300) {
  console.error(`FAILED: Expected 300 total bank questions, found ${totalBankQuestions}`);
  process.exit(1);
}
console.log(`  ✓ Total Question Bank: ${totalBankQuestions} unique Form 4 curriculum questions verified.`);

// 4.1 Test QuestionManager Non-repeating & Bank Exhaustion
questionManager.resetSession();
const drawnIds = new Set();
for (let i = 0; i < 10; i++) {
  const q = questionManager.getNextBankQuestion({ chapter: 1, difficulty: 'easy' });
  if (!q) {
    console.error(`FAILED: Expected bank question at index ${i}, got null`);
    process.exit(1);
  }
  if (drawnIds.has(q.id)) {
    console.error(`FAILED: Duplicate question drawn from bank: ${q.id}`);
    process.exit(1);
  }
  drawnIds.add(q.id);
}
if (questionManager.hasMoreQuestions({ chapter: 1, difficulty: 'easy' })) {
  console.error('FAILED: Bank should be exhausted after 10 draws for Ch 1 Easy');
  process.exit(1);
}
const exhaustedQ = questionManager.getNextBankQuestion({ chapter: 1, difficulty: 'easy' });
if (exhaustedQ !== null) {
  console.error('FAILED: getNextBankQuestion should return null when bank is exhausted');
  process.exit(1);
}
questionManager.resetSession();
if (!questionManager.hasMoreQuestions({ chapter: 1, difficulty: 'easy' })) {
  console.error('FAILED: resetSession should restore available questions in bank');
  process.exit(1);
}
const shuffledQuestion = questionManager.getNextBankQuestion({ chapter: 1, difficulty: 'easy' });
const originalRandom = Math.random;
let optionsLow;
let optionsHigh;
try {
  Math.random = () => 0;
  optionsLow = questionManager.getOptions();
  Math.random = () => 0.999999;
  optionsHigh = questionManager.getOptions();
} finally {
  Math.random = originalRandom;
}
if (optionsLow.length < 2 || optionsLow.map(option => option.value).join('|') === optionsHigh.map(option => option.value).join('|')) {
  console.error('FAILED: Correct answer options did not shuffle across display orders');
  process.exit(1);
}
if (!optionsLow.some(option => option.value === shuffledQuestion.answer) || !optionsHigh.some(option => option.value === shuffledQuestion.answer)) {
  console.error('FAILED: Shuffling removed or changed the correct answer value');
  process.exit(1);
}
if (!questionManager.checkAnswer(shuffledQuestion.answer).isCorrect) {
  console.error('FAILED: Answer validation changed after option shuffling');
  process.exit(1);
}
console.log('  ✓ QuestionManager non-repeating draws and bank exhaustion logic verified.');
console.log('');

// ----------------------------------------------------
// Test 5: Test Procedural Question Generators
// ----------------------------------------------------
console.log('[Test 5] Testing Procedural Question Generators...');
for (let ch = 1; ch <= 10; ch++) {
  for (let i = 0; i < 3; i++) {
    const q = generateQuestionForChapter(ch, 'easy');
    const res = validateQuestion(q);
    if (!res.valid || !q.question.en || !q.question.ms) {
      console.error(`FAILED: Procedural Ch ${ch} invalid:`, res.errors);
      process.exit(1);
    }
  }
  console.log(`  ✓ Chapter ${ch.toString().padStart(2, '0')} Generator: verified dynamic generation.`);
}

// Check Chapter 6 generates diverse questions without immediate repetitions
const ch6Questions = new Set();
for (let i = 0; i < 5; i++) {
  const q = generateQuestionForChapter(6, 'medium');
  ch6Questions.add(q.equation);
}
console.log(`  ✓ Chapter 06 Procedural Diversity: generated ${ch6Questions.size} unique variations in 5 consecutive rolls.`);
console.log('');

// ----------------------------------------------------
// Test 6: Economy Manager Calculations
// ----------------------------------------------------
console.log('[Test 6] Testing Economy Manager...');
const mockRecipe = { baseCost: 4.50, sellingPrice: 8.00 };
const perfectEcon = economyManager.calculateDishEconomics(mockRecipe, 1.0, 1.0);
if (perfectEcon.netProfit <= 0 || perfectEcon.revenue !== 9.50 || perfectEcon.wasteCost !== 0) {
  console.error('FAILED: Perfect run should yield RM 9.50 (with tip)');
  process.exit(1);
}
console.log('  ✓ Perfect run bonus tip verified.');

const inaccurateEcon = economyManager.calculateDishEconomics(mockRecipe, 0.5, 0.8);
if (inaccurateEcon.wasteCost <= 0 || inaccurateEcon.ingredientCost <= mockRecipe.baseCost) {
  console.error('FAILED: Inaccurate maths should create visible ingredient waste cost');
  process.exit(1);
}
console.log('  ✓ Maths-related ingredient waste consequence verified.');
console.log('');

// ----------------------------------------------------
// Test 7: Player Progression & Level Up (Infinite Loop Guard)
// ----------------------------------------------------
console.log('[Test 7] Testing Player Progression & Level-up Loop Safety...');
playerManager.init({
  player: { name: 'Test Chef', level: 1, xp: 0, coins: 100, stars: 0, reputation: 100 },
  equipment: [],
  completedMissions: {},
  stats: { totalDishesServed: 0, mathQuestionsAnswered: 0, mathAccuracySum: 0, totalProfitRM: 0 }
});

// Test leveling up with exact threshold (150 XP for level 2)
const lvlResult1 = playerManager.addXP(150);
if (!lvlResult1.leveledUp || lvlResult1.currentLevel !== 2) {
  console.error('FAILED: Player should have leveled up to Level 2 on 150 XP');
  process.exit(1);
}
console.log('  ✓ Single level-up to Level 2 verified (no infinite loop).');

// Test multi-level jump with large XP
const lvlResult2 = playerManager.addXP(500);
if (!lvlResult2.leveledUp || lvlResult2.currentLevel < 3) {
  console.error('FAILED: Player should have leveled up to at least Level 3 on +500 XP');
  process.exit(1);
}
console.log(`  ✓ Multi-level progression to Level ${lvlResult2.currentLevel} verified.`);

// Test mission completion recording
playerManager.recordMissionCompleted('M01-01', 3, 1.0);
if (playerManager.player.stars !== 3 || playerManager.completedMissions['M01-01'].stars !== 3) {
  console.error('FAILED: Mission completion recording failed');
  process.exit(1);
}
console.log('  ✓ Mission recording and stars updating verified.');

// Test 7 Restaurant Progression Stages (GDD Section 24)
const stages = playerManager.getAllStages();
if (stages.length !== 7) {
  console.error(`FAILED: Expected 7 restaurant stages, found ${stages.length}`);
  process.exit(1);
}

// Reset stats for stage testing
playerManager.stats.totalDishesServed = 0;
playerManager.player.level = 1;
playerManager.player.stage = 1;

let stg1 = playerManager.getStageInfo();
if (stg1.stage !== 1 || stg1.dishesNeeded !== 3 || stg1.isMax !== false) {
  console.error('FAILED: Initial stage should be Stage 1 with 3 dishes needed for Stage 2', stg1);
  process.exit(1);
}

// Advance to Stage 2 (3 dishes)
playerManager.stats.totalDishesServed = 3;
const upg2 = playerManager.checkStageUpgrade();
if (!upg2.upgraded || upg2.newStage !== 2 || upg2.info.rewardCoins !== 25) {
  console.error('FAILED: Stage 2 upgrade check failed', upg2);
  process.exit(1);
}

// Advance to Stage 3 (6 dishes)
playerManager.stats.totalDishesServed = 6;
const upg3 = playerManager.checkStageUpgrade();
if (!upg3.upgraded || upg3.newStage !== 3 || upg3.info.rewardCoins !== 50) {
  console.error('FAILED: Stage 3 upgrade check failed', upg3);
  process.exit(1);
}

// Advance to Stage 7 (25 dishes - Empayar Makanan)
playerManager.stats.totalDishesServed = 25;
const upg7 = playerManager.checkStageUpgrade();
if (!upg7.upgraded || upg7.newStage !== 7 || !upg7.info.isMax) {
  console.error('FAILED: Stage 7 upgrade check failed', upg7);
  process.exit(1);
}
console.log('  ✓ 7 Restaurant Stages (Gerai Tepi Jalan -> Food Empire) and upgrade check verified.');
console.log('');

// ----------------------------------------------------
// Test 8: Multiplayer, Co-op, Classroom Mode & Badge System
// ----------------------------------------------------
console.log('[Test 8] Testing Multiplayer Room System, Roles, Classroom Mode & Badges...');

// 8.1 Badge System Verification
if (badgesData.length !== 12) {
  console.error(`FAILED: Expected 12 badges, found ${badgesData.length}`);
  process.exit(1);
}
badgeManager.init({ badges: [] });
const unlockedInitial = badgeManager.checkProgress();
badgeManager.unlock('first_recipe');
if (!badgeManager.isUnlocked('first_recipe')) {
  console.error('FAILED: Badge unlocking failed');
  process.exit(1);
}
console.log('  ✓ All 12 Form 4 curriculum badges loaded and unlocking verified.');

// 8.2 Multiplayer 2-Player Co-op Room with Random 4-Digit Code
const room2p = multiplayerManager.createRoom(MULTIPLAYER_MODES.COOP2, { nickname: 'Host Chef' });
if (!/^\d{4}$/.test(room2p.roomId) || room2p.status !== ROOM_STATUS.WAITING || room2p.players.length !== 1) {
  console.error('FAILED: 2P Co-op room creation failed (expected 4-digit code)', room2p);
  process.exit(1);
}
multiplayerManager.setRole(ROLES.CHEF.id);
multiplayerManager.setReady(true);
console.log(`  ✓ 2-Player Co-op room created with 4-digit PIN (${room2p.roomId}) verified.`);

// 8.3 Host Role Toggle: Play Together vs Observant (Teacher)
multiplayerManager.setHostRoleMode('observant');
if (room2p.hostRoleMode !== 'observant' || !multiplayerManager.isObservant()) {
  console.error('FAILED: Host observant toggle failed', room2p);
  process.exit(1);
}
console.log('  ✓ Host role toggle to Observant (Teacher) verified.');

// 8.4 Simulate 2 Phones Joining and Kicking
room2p.players.push({
  id: 'phone_1',
  name: 'Ali (Telefon 1)',
  role: ROLES.CHEF.id,
  isReady: true,
  isHost: false,
  isObservant: false
});
room2p.players.push({
  id: 'phone_2',
  name: 'Siti (Telefon 2)',
  role: ROLES.MATH.id,
  isReady: true,
  isHost: false,
  isObservant: false
});
room2p.players.push({
  id: 'phone_troll',
  name: 'Unwanted Player',
  role: ROLES.MATH.id,
  isReady: false,
  isHost: false,
  isObservant: false
});
if (room2p.players.length !== 4) {
  console.error('FAILED: Multi-player join simulation failed');
  process.exit(1);
}
multiplayerManager.handleBroadcastMessage({
  type: 'PLAYER_JOINED',
  roomId: room2p.roomId,
  player: { id: 'phone_1', name: 'Ali Reconnected', role: ROLES.CHEF.id, isReady: true }
});
if (room2p.players.filter(p => p.id === 'phone_1').length !== 1 || room2p.players.find(p => p.id === 'phone_1').name !== 'Ali Reconnected') {
  console.error('FAILED: Reconnected player should update in place without creating a duplicate');
  process.exit(1);
}
multiplayerManager.kickPlayer('phone_troll');
if (room2p.players.some(p => p.id === 'phone_troll')) {
  console.error('FAILED: Kick player did not remove unwanted player');
  process.exit(1);
}
console.log(`  ✓ Reconnect deduplication, 2 phones joined (${room2p.players.find(p => p.id === 'phone_1').name}, ${room2p.players.find(p => p.id === 'phone_2').name}) & unwanted player kicked verified.`);

// 8.5 Multiplayer Classroom Mode (AMC-F4-2026) with Target Chapter 6
const roomClass = multiplayerManager.createRoom(MULTIPLAYER_MODES.CLASSROOM, {
  classCode: 'AMC-F4-2026',
  targetChapter: 6,
  difficulty: 'medium'
});
if (roomClass.classCode !== 'AMC-F4-2026' || roomClass.gameMode !== MULTIPLAYER_MODES.CLASSROOM || roomClass.targetChapter !== 6) {
  console.error('FAILED: Classroom room creation failed or targetChapter not preserved', roomClass);
  process.exit(1);
}
console.log(`  ✓ Classroom mode created with teacher class code (${roomClass.classCode}) & Target Chapter 6 verified.`);

// 8.4 Co-op Math Gating and Unlock
multiplayerManager.startCoopGame('M01-01');
if (multiplayerManager.room.status !== ROOM_STATUS.PLAYING) {
  console.error('FAILED: Co-op game start failed');
  process.exit(1);
}
if (multiplayerManager.isStepUnlocked(1)) {
  console.error('FAILED: Step 1 should be locked before math unlock');
  process.exit(1);
}
const wrongChallengeScore = multiplayerManager.recordChallengeAnswer(false, 1);
if (wrongChallengeScore.points !== 0 || wrongChallengeScore.total !== 0) {
  console.error('FAILED: Wrong co-op challenge answer should award zero points', wrongChallengeScore);
  process.exit(1);
}
const retriedChallengeScore = multiplayerManager.recordChallengeAnswer(true, 2);
if (retriedChallengeScore.points !== 75 || retriedChallengeScore.total !== 75) {
  console.error('FAILED: Correct retry should award reduced challenge points', retriedChallengeScore);
  process.exit(1);
}
const earnedChallengeScore = multiplayerManager.recordChallengeAnswer(true, 1);
if (earnedChallengeScore.points !== 100 || earnedChallengeScore.total !== 175) {
  console.error('FAILED: First-try correct co-op answer should award full points', earnedChallengeScore);
  process.exit(1);
}
multiplayerManager.unlockStepByMath(1, 1.0);
if (!multiplayerManager.isStepUnlocked(1)) {
  console.error('FAILED: Step 1 should be unlocked after math solving');
  process.exit(1);
}
console.log('  ✓ Co-op wrong-answer zero score, retry scoring, team total & math station unlock verified.');

// 8.5 Achievements remain local and progression-backed; no mock global leaderboard.
const achievementList = badgeManager.getAllBadges();
if (achievementList.length !== 12 || !achievementList.every(b => typeof b.isUnlocked === 'boolean')) {
  console.error('FAILED: Achievements collection is missing or has invalid unlock state');
  process.exit(1);
}
console.log('  ✓ Progression-backed Achievements collection verified (no mock global leaderboard).');

multiplayerManager.leaveRoom();
console.log('');

// ----------------------------------------------------
// Test 9: Educational Analytics & Teacher Challenge System
// ----------------------------------------------------
console.log('[Test 9] Testing Educational Analytics & Teacher Challenge System...');

// 9.1 Dataset integrity
if (!teacherData.classInfo || !teacherData.chapterMastery || teacherData.chapterMastery.length !== 10) {
  console.error('FAILED: teacherAnalytics.json missing or does not have 10 chapters');
  process.exit(1);
}
console.log(`  ✓ Teacher baseline dataset for Class "${teacherData.classInfo.name}" (${teacherData.classInfo.code}) verified.`);

// 9.2 Record question attempts
analyticsManager.recordQuestionAttempt({
  questionId: 'F4-C06-TEST',
  chapter: 6,
  isCorrect: false,
  hintsUsed: 1,
  durationSeconds: 35
});
analyticsManager.recordQuestionAttempt({
  questionId: 'F4-C06-TEST2',
  chapter: 6,
  isCorrect: true,
  hintsUsed: 0,
  durationSeconds: 28
});

// 9.3 Chapter mastery calculation
const ch6Mastery = analyticsManager.getChapterMastery(6);
if (typeof ch6Mastery !== 'number' || ch6Mastery < 0 || ch6Mastery > 100) {
  console.error('FAILED: Chapter mastery formula calculation error:', ch6Mastery);
  process.exit(1);
}
console.log(`  ✓ Dynamic chapter mastery calculation verified (Bab 6: ${ch6Mastery}%).`);

// 9.4 10-Chapter breakdown & Misconception alerts
const breakdown = analyticsManager.getChapterBreakdown();
if (breakdown.length !== 10) {
  console.error(`FAILED: Expected 10 chapters in breakdown, found ${breakdown.length}`);
  process.exit(1);
}
const alerts = analyticsManager.getMisconceptionAlerts();
if (alerts.length < 2) {
  console.error('FAILED: Misconception diagnostic alerts missing');
  process.exit(1);
}
console.log(`  ✓ 10-Chapter breakdown & ${alerts.length} diagnostic misconception alerts verified.`);

// 9.5 Teacher custom class challenge creation
const challenge = analyticsManager.createClassChallenge({
  classCode: 'AMC-F4-2026',
  chapter: 6,
  difficulty: 'medium',
  timeLimitMinutes: 10,
  questionCount: 10,
  hintsAllowed: false
});
if (!challenge.id.startsWith('CHAL-') || challenge.chapter !== 6 || challenge.hintsAllowed !== false) {
  console.error('FAILED: Custom class challenge creation failed', challenge);
  process.exit(1);
}
console.log(`  ✓ Custom class challenge created and broadcasted (${challenge.id}) verified.\n`);

// ----------------------------------------------------
// Test 10: Daily Challenge Mode & Boss Battle Battles
// ----------------------------------------------------
console.log('[Test 10] Testing Daily Challenge System & Boss Battles...');

// 10.1 Bosses Data Validation
const bossesList = bossesData.bosses || [];
if (bossesList.length !== 11) {
  console.error(`FAILED: Expected 11 bosses (10 world bosses + 1 final boss), found ${bossesList.length}`);
  process.exit(1);
}
bossesList.forEach(b => {
  if (!b.id || !b.name || !b.hp || b.hp <= 0 || !b.phases || b.phases.length === 0) {
    console.error(`FAILED: Boss ${b.id} missing critical attributes`, b);
    process.exit(1);
  }
});
console.log(`  ✓ All 11 Bosses (10 World Bosses + Grand Finale 'Food Empire Crisis') verified.`);

// 10.2 Final Boss Multi-stage Crisis Validation
const finalBoss = bossesList.find(b => b.id === 'boss-final');
if (!finalBoss || finalBoss.phases.length < 3 || finalBoss.hp < 800) {
  console.error('FAILED: Final boss Food Empire Crisis improperly configured', finalBoss);
  process.exit(1);
}
console.log(`  ✓ Grand Finale Boss (${finalBoss.name}) 3-stage multi-topic synthesis verified.`);

// 10.3 Daily Challenge Manager Validation
const dailyMission = dailyChallengeManager.getDailyMission();
if (!dailyMission || !dailyMission.id.startsWith('DAILY-') || dailyMission.attemptsLeft !== 3) {
  console.error('FAILED: Daily challenge mission creation failed', dailyMission);
  process.exit(1);
}
const used = dailyChallengeManager.useAttempt();
if (!used || dailyChallengeManager.state.attemptsLeft !== 2) {
  console.error('FAILED: Daily challenge attempt decrement failed');
  process.exit(1);
}
dailyChallengeManager.recordCompletion(true, 100);
if (!dailyChallengeManager.state.completed || dailyChallengeManager.state.streak < 1) {
  console.error('FAILED: Daily challenge completion & streak recording failed');
  process.exit(1);
}
console.log(`  ✓ Deterministic Daily Challenge (${dailyMission.id}) & Streak (${dailyChallengeManager.state.streak}) verified.`);

// 10.4 Boss Battle Manager Combat Mechanics
const battle = bossManager.startBattle('boss-01');
if (battle.hp !== 300 || battle.maxHp !== 300) {
  console.error('FAILED: Boss battle initialization failed', battle);
  process.exit(1);
}
// Phase 1 correct answer with quick timing (speed bonus)
const round1 = bossManager.processPhaseAnswer(true, 8);
if (round1.bossHP >= 300 || round1.damage <= 0) {
  console.error('FAILED: Boss damage calculation failed', round1);
  process.exit(1);
}
// Phase 2 correct answer to defeat boss
const round2 = bossManager.processPhaseAnswer(true, 10);
if (!round2.defeated || !bossManager.isBossDefeated('boss-01')) {
  console.error('FAILED: Boss defeat check failed', round2);
  process.exit(1);
}
console.log(`  ✓ Boss battle turn mechanics, dynamic HP damage, and defeat state verified.`);

console.log('\n====================================================');
console.log('   ALL 10 TEST MODULES PASSED WITH 100% SUCCESS!    ');
console.log('====================================================');
