import Phaser from 'phaser';
import questionManager from '../managers/QuestionManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import audioManager from '../managers/AudioManager.js';
import analyticsManager from '../managers/AnalyticsManager.js';
import playerManager from '../managers/PlayerManager.js';
import gameManager from '../managers/GameManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';

// KSSM Form 4 Mathematics Formula Sheet by Chapter
const CHAPTER_FORMULAS = {
  1: {
    title: { en: 'Bab 1: Quadratic Functions & Equations', ms: 'Bab 1: Fungsi & Persamaan Kuadratik' },
    items: [
      { label: 'Bentuk Am / General Form', val: 'f(x) = ax² + bx + c  (a ≠ 0)' },
      { label: 'Paksi Simetri / Axis of Symmetry', val: 'x = -b / (2a)' },
      { label: 'Bentuk Graf / Graph Shape', val: 'a > 0: Bentuk U (Titik Minimum)\na < 0: Bentuk ∩ (Titik Maksimum)' },
      { label: 'Pintasan-y / y-intercept', val: 'y = c  (apabila x = 0)' }
    ]
  },
  2: {
    title: { en: 'Bab 2: Number Bases', ms: 'Bab 2: Asas Nombor' },
    items: [
      { label: 'Nilai Tempat / Place Value', val: 'Asas n: ... n³, n², n¹, n⁰' },
      { label: 'Nilai Digit / Digit Value', val: 'Digit × n^k  (cth: 4 dalam 423₅ = 4 × 5² = 100)' },
      { label: 'Asas 10 -> Asas n', val: 'Pembahagian berulang dengan n, ambil baki dari bawah ke atas.' },
      { label: 'Asas n -> Asas 10', val: 'Pencerakinan: darab setiap digit dengan nilai tempatnya.' }
    ]
  },
  3: {
    title: { en: 'Bab 3: Logical Reasoning', ms: 'Bab 3: Penaakulan Logik' },
    items: [
      { label: 'Penafian / Negation', val: '~p (Bukan p)' },
      { label: 'Implikasi / Implication', val: 'Asal: p ⇒ q | Akas (Converse): q ⇒ p\nSongsangan: ~p ⇒ ~q | Kontrapositif: ~q ⇒ ~p' },
      { label: 'Hujah Deduktif / Deductive Arguments', val: 'Bentuk I: Semua A ialah B; C ialah A; C ialah B.\nBentuk II: Jika p maka q; p benar; q benar.\nBentuk III: Jika p maka q; bukan q; bukan p.' }
    ]
  },
  4: {
    title: { en: 'Bab 4: Operations on Sets', ms: 'Bab 4: Operasi Set' },
    items: [
      { label: 'Persilangan / Intersection (∩)', val: 'Unsur sepunya bagi set A dan B' },
      { label: 'Kesatuan / Union (∪)', val: 'Semua unsur dalam set A atau B atau kedua-duanya' },
      { label: 'Pelengkap / Complement (\')', val: 'A\' = semua unsur dalam semesta ξ selain set A' },
      { label: 'Rumus Bilangan / Cardinality', val: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B)' },
      { label: 'Hukum De Morgan', val: '(A ∪ B)\' = A\' ∩ B\'  |  (A ∩ B)\' = A\' ∪ B\'' }
    ]
  },
  5: {
    title: { en: 'Bab 5: Network in Graph Theory', ms: 'Bab 5: Rangkaian dalam Teori Graf' },
    items: [
      { label: 'Hasil Tambah Darjah / Degree Sum', val: 'Σ d(v) = 2E  (Sentiasa nombor genap!)' },
      { label: 'Ciri Pokok / Tree Properties', val: 'E = V - 1, bersambung, tiada kitaran, tiada gelung' },
      { label: 'Gelung / Loop', val: 'Satu gelung menyumbang 2 darjah kepada bucu' },
      { label: 'Graf Lengkap / Complete Graph', val: 'Bilangan tepi maksimum = n(n - 1) / 2' }
    ]
  },
  6: {
    title: { en: 'Bab 6: Linear Inequalities in Two Variables', ms: 'Bab 6: Ketaksamaan Linear 2 Pemboleh Ubah' },
    items: [
      { label: 'Garis Sempadan / Boundary Line', val: 'Tegas (> atau <): Garis putus-putus\nTidak tegas (≥ atau ≤): Garis padu' },
      { label: 'Rantau Lorekan / Shaded Region', val: 'y > mx + c: Rantau di sebelah atas garis\ny < mx + c: Rantau di sebelah bawah garis' },
      { label: 'Garis Menegak / Vertical Line', val: 'x > k: sebelah kanan | x < k: sebelah kiri' }
    ]
  },
  7: {
    title: { en: 'Bab 7: Graphs of Motion', ms: 'Bab 7: Graf Gerakan' },
    items: [
      { label: 'Graf Jarak-Masa / Distance-Time', val: 'Kecerunan = Laju (Speed)\nGaris Mendatar = Pegun (Berhenti / Rehat)' },
      { label: 'Graf Laju-Masa / Speed-Time', val: 'Kecerunan = Pecutan (Acceleration)\nLuas di bawah graf = Jarak yang dilalui\nGaris Mendatar = Laju Seragam (Pecutan = 0)' },
      { label: 'Laju Purata / Average Speed', val: 'Laju Purata = Jumlah Jarak / Jumlah Masa' }
    ]
  },
  8: {
    title: { en: 'Bab 8: Measures of Dispersion for Ungrouped Data', ms: 'Bab 8: Sukatan Serakan Data Tak Terkumpul' },
    items: [
      { label: 'Julat / Range', val: 'Nilai Maksimum - Nilai Minimum' },
      { label: 'Julat Antara Kuartil / IQR', val: 'IQR = Q₃ - Q₁' },
      { label: 'Varians / Variance (σ²)', val: 'σ² = (Σx² / N) - (x̄)²' },
      { label: 'Sisihan Piawai / Standard Deviation', val: 'σ = √σ²  (Nilai lebih kecil = lebih konsisten)' },
      { label: 'Kesan Penambahan / Addition', val: 'x + k: Sukatan serakan (julat, IQR, σ) KEKAL SAMA!' }
    ]
  },
  9: {
    title: { en: 'Bab 9: Probability of Combined Events', ms: 'Bab 9: Kebarangkalian Peristiwa Bergabung' },
    items: [
      { label: 'Pelengkap / Complement', val: 'P(A\') = 1 - P(A)' },
      { label: 'Saling Eksklusif / Mutually Exclusive', val: 'P(A ∩ B) = 0 ⇒ P(A ∪ B) = P(A) + P(B)' },
      { label: 'Tidak Saling Eksklusif', val: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)' },
      { label: 'Peristiwa Tak Bersandar / Independent', val: 'P(A ∩ B) = P(A) × P(B)' }
    ]
  },
  10: {
    title: { en: 'Bab 10: Consumer Mathematics - Financial Management', ms: 'Bab 10: Pengurusan Kewangan' },
    items: [
      { label: 'Konsep SMART', val: 'S: Khusus | M: Boleh diukur | A: Boleh dicapai\nR: Realistik | T: Tempoh masa' },
      { label: 'Aliran Tunai / Cash Flow', val: 'Aliran Tunai Bersih = Jumlah Pendapatan - Jumlah Perbelanjaan\nPositif: Lebihan (Surplus) | Negatif: Defisit' },
      { label: 'Dana Kecemasan / Emergency Fund', val: '3 hingga 6 bulan perbelanjaan asas bulanan' }
    ]
  }
};

export class MathChallengeScene extends Phaser.Scene {
  constructor() {
    super('MathChallengeScene');
    this.questionId = null;
    this.onComplete = null;
    this.selectedOption = null;
    this.optionButtons = [];
    this.attempts = 0;
  }

  init(data) {
    this.questionId = data.questionId;
    this.chapter = data.chapter;
    this.difficulty = data.difficulty || 'medium';
    this.onComplete = data.onComplete;
    this.onBankExhausted = data.onBankExhausted;
    this.attempts = 0;
    this.selectedOption = null;
  }

  isPortrait() {
    return this.cameras.main.height > this.cameras.main.width;
  }

  create() {
    this.scene.bringToTop();
    let currentQ = null;
    try {
      if (this.questionId) {
        currentQ = questionManager.setCurrentQuestion(this.questionId);
      } else {
        const ch = this.chapter || 1;
        currentQ = questionManager.getOrGenerateQuestion({ chapter: ch, difficulty: this.difficulty });
      }
    } catch (err) {
      console.warn('Error fetching question:', err);
      currentQ = questionManager.getOrGenerateQuestion({ chapter: this.chapter || 1, difficulty: this.difficulty || 'easy' });
    }

    if (!currentQ) {
      if (typeof this.onBankExhausted === 'function') {
        this.onBankExhausted();
      } else if (typeof this.onComplete === 'function') {
        this.onComplete(1.0);
      }
      return;
    }

    const isPort = this.isPortrait();
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dim background
    const dim = this.add.graphics();
    dim.fillStyle(0x102a35, 0.58);
    dim.fillRect(0, 0, w, h);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

    // Main Challenge Modal: warm cream recipe card with washi tape
    const panelW = isPort ? 680 : 940;
    const panelH = isPort ? 1120 : 620;
    this.panel = createPanel(this, cx, cy, panelW, panelH, {
      bgColor: THEME.panelLight,
      strokeColor: THEME.outlineDark,
      radius: 22
    });

    this.createHeader();
    this.createQuestionBody();
    this.createOptions();
    this.createFooterControls();
  }

  createHeader() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const titleY = isPort ? 130 : 90;
    const chapY = isPort ? 170 : 120;

    // Title Banner
    this.titleText = this.add.text(cx, titleY, localizationManager.t('math.challengeTitle'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '28px' : '30px',
      color: THEME.textDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Chapter badge
    const currentQ = questionManager.getCurrentQuestion();
    const chNum = this.chapter || currentQ?.chapter || 1;
    const isMs = localizationManager.getLanguage() === 'ms';
    const chapSubKey = `worlds.w${chNum}_sub`;
    const translatedSub = localizationManager.t(chapSubKey);
    const hasSub = translatedSub && translatedSub !== chapSubKey;
    const chapPrefix = isMs ? `Bab ${chNum}` : `Chapter ${chNum}`;
    const diffLabel = (this.difficulty || 'medium').toUpperCase();
    const remaining = questionManager.getRemainingCount({ chapter: chNum, difficulty: this.difficulty });
    const remainingText = isMs ? `Baki: ${remaining}` : `Left: ${remaining}`;
    const badgeText = hasSub
      ? `${chapPrefix}: ${translatedSub} • [${diffLabel}] • 📚 ${remainingText}`
      : `${chapPrefix} • [${diffLabel}] • 📚 ${remainingText}`;

    this.chapterText = this.add.text(cx, chapY, badgeText, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '16px' : '14px',
      color: '#0284c7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Otak Pantas Combo Streak Indicator
    const streak = gameManager.comboStreak || 0;
    if (streak > 1) {
      const streakX = isPort ? (cx + 200) : (cx + 310);
      this.streakBadge = this.add.text(streakX, titleY, `🔥 x${streak}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '22px' : '20px',
        color: '#ea580c',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: this.streakBadge,
        scale: { from: 1, to: 1.15 },
        duration: 350,
        yoyo: true,
        repeat: -1
      });
    }
  }

  createQuestionBody() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;

    const problemBox = this.add.graphics();
    problemBox.fillStyle(0xfff4c2, 0.98);

    const boxW = isPort ? 620 : 840;
    const boxH = isPort ? 210 : 115;
    const boxX = isPort ? (cx - 310) : 220;
    const boxY = isPort ? 210 : 145;

    problemBox.fillRoundedRect(boxX, boxY, boxW, boxH, 14);
    problemBox.lineStyle(3, THEME.outlineDark, 1);
    problemBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 14);
    problemBox.lineStyle(1.2, 0xfcd34d, 0.9);
    problemBox.strokeRoundedRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8, 10);

    const questionText = questionManager.getQuestionText();
    const promptY = boxY + boxH / 2;

    this.questionPrompt = this.add.text(cx, promptY, questionText, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '21px' : '19px',
      color: THEME.textDark,
      align: 'center',
      wordWrap: { width: isPort ? 570 : 800 }
    }).setOrigin(0.5);
  }

  createOptions() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const options = questionManager.getOptions();
    this.optionButtons = [];

    const startY = isPort ? 460 : 300;
    const spacingY = isPort ? 82 : 56;
    const btnW = isPort ? 620 : 600;
    const btnH = isPort ? 68 : 46;
    const fontSz = isPort ? '21px' : '18px';

    options.forEach((opt, index) => {
      const y = startY + index * spacingY;
      const btn = createButton(this, cx, y, opt.text, {
        width: btnW,
        height: btnH,
        fontSize: fontSz,
        bgColor: THEME.panelLight,
        bgDarkColor: THEME.panelBg,
        textColor: '#331f12',
        onClick: () => {
          this.handleOptionSelect(opt.value, btn);
        }
      });
      this.optionButtons.push({ btn, value: opt.value });
    });
  }

  createFooterControls() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;

    const fbY = isPort ? 820 : 515;
    const hintY = isPort ? 910 : 565;
    const hintH = isPort ? 54 : 42;
    const hintFont = isPort ? '18px' : '15px';
    const isMs = localizationManager.getLanguage() === 'ms';

    // Feedback message display
    this.feedbackText = this.add.text(cx, fbY, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPort ? '21px' : '16px',
      fontStyle: 'bold',
      color: '#f59e0b',
      align: 'center'
    }).setOrigin(0.5);

    // Step-by-Step Educational Solution Button (shown on wrong answer)
    this.btnSolution = createButton(this, cx, fbY + 36, isMs ? '📖 Tunjuk Cara Penyelesaian' : '📖 Show Step-by-Step Solution', {
      width: isPort ? 380 : 320,
      height: 38,
      fontSize: isPort ? '15px' : '13px',
      bgColor: 0x7c3aed,
      bgDarkColor: 0x6d28d9,
      onClick: () => {
        this.showExplanationModal(true);
      }
    });
    this.btnSolution.container.setVisible(false);

    // Side-by-side Hint & Formula Mama Buttons
    const btnGap = isPort ? 150 : 120;
    const btnW = isPort ? 270 : 190;

    // Hint Button
    this.btnHint = createButton(this, cx - btnGap, hintY, localizationManager.t('math.hint', { count: 3 }), {
      width: btnW,
      height: hintH,
      fontSize: hintFont,
      bgColor: 0x0284c7,
      bgDarkColor: 0x0369a1,
      onClick: () => {
        this.showHint();
      }
    });

    // Formula Mama Button
    const formulaLabel = isMs ? '💡 Petua Mama' : '💡 Formula Mama';
    this.btnFormula = createButton(this, cx + btnGap, hintY, formulaLabel, {
      width: btnW,
      height: hintH,
      fontSize: hintFont,
      bgColor: 0xd97706,
      bgDarkColor: 0xb45309,
      onClick: () => {
        this.showFormulaModal();
      }
    });
  }

  showStreakCelebration(streak, bonusCoins) {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2 - 120;

    const streakBox = this.add.container(cx, cy);
    const bg = this.add.graphics();
    bg.fillStyle(0xd97706, 0.95);
    bg.fillRoundedRect(-220, -32, 440, 64, 18);
    bg.lineStyle(2.5, 0xfef08a, 1);
    bg.strokeRoundedRect(-220, -32, 440, 64, 18);
    streakBox.add(bg);

    const isMs = localizationManager.getLanguage() === 'ms';
    const msg = isMs
      ? `🔥 OTAK PANTAS x${streak}! (+RM ${(bonusCoins / 10).toFixed(2)})`
      : `🔥 QUICK BRAIN x${streak}! (+RM ${(bonusCoins / 10).toFixed(2)})`;

    const txt = this.add.text(0, 0, msg, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    streakBox.add(txt);

    streakBox.setScale(0.2);
    this.tweens.add({
      targets: streakBox,
      scale: 1.1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: streakBox,
          y: cy - 40,
          alpha: 0,
          delay: 800,
          duration: 400,
          onComplete: () => streakBox.destroy()
        });
      }
    });
  }

  burstAnswerFeedback(isCorrect, x, y) {
    const colors = isCorrect
      ? [0xfbbf24, 0x34d399, 0x38bdf8, 0xfb7185]
      : [0xef4444, 0xfb7185, 0xf97316];
    const pieces = [];

    for (let i = 0; i < (isCorrect ? 24 : 10); i++) {
      const piece = this.add.graphics();
      piece.fillStyle(colors[i % colors.length], 1);
      if (i % 2 === 0) piece.fillCircle(0, 0, 4 + (i % 3));
      else piece.fillRect(-4, -3, 8, 6);
      piece.setPosition(x, y);
      piece.setDepth(1000);
      pieces.push(piece);

      const angle = Phaser.Math.DegToRad((360 / pieces.length) * i + Phaser.Math.Between(-12, 12));
      const distance = Phaser.Math.Between(isCorrect ? 70 : 30, isCorrect ? 180 : 85);
      this.tweens.add({
        targets: piece,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + (isCorrect ? 30 : 12),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        scaleX: 0.35,
        scaleY: 0.35,
        duration: Phaser.Math.Between(520, 820),
        ease: 'Cubic.easeOut',
        onComplete: () => piece.destroy()
      });
    }

    if (isCorrect) {
      this.cameras.main.flash(180, 255, 244, 190, false);
    } else {
      this.cameras.main.shake(160, 0.006);
    }
  }

  handleOptionSelect(value, buttonObj) {
    this.attempts += 1;
    const result = questionManager.checkAnswer(value);
    const currQ = questionManager.getCurrentQuestion();

    analyticsManager.recordQuestionAttempt({
      questionId: currQ?.id || this.questionId,
      chapter: currQ?.chapter || this.chapter || 1,
      isCorrect: result.isCorrect,
      hintsUsed: this.attempts > 1 ? 1 : 0
    });

    const isPort = this.isPortrait();
    const btnW = isPort ? 620 : 600;
    const btnH = isPort ? 68 : 46;

    if (result.isCorrect) {
      audioManager.playCorrect();
      this.burstAnswerFeedback(true, buttonObj.container.x, buttonObj.container.y);
      this.feedbackText.setText(`✓ ${result.feedback || localizationManager.t('math.correct')}`);
      this.feedbackText.setColor('#4ade80');
      if (this.btnSolution) this.btnSolution.container.setVisible(false);

      // Streak tracking & bonus
      gameManager.comboStreak = (gameManager.comboStreak || 0) + 1;
      const currentStreak = gameManager.comboStreak;
      if (currentStreak >= 2) {
        const bonusCoins = currentStreak * 5;
        if (playerManager?.player) {
          playerManager.addCoins(bonusCoins);
        }
        this.showStreakCelebration(currentStreak, bonusCoins);
      }

      // Highlight winning button
      buttonObj.container.list[0].clear();
      buttonObj.container.list[0].fillStyle(THEME.secondary, 1);
      buttonObj.container.list[0].fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);

      // Disable other buttons
      this.optionButtons.forEach(o => o.btn.container.disableInteractive());
      this.btnHint.container.disableInteractive();
      this.btnFormula.container.disableInteractive();

      // Show Continue Button with educational explanation
      this.time.delayedCall(600, () => {
        this.showExplanationModal(false);
      });
    } else {
      audioManager.playWrong();
      this.burstAnswerFeedback(false, buttonObj.container.x, buttonObj.container.y);
      gameManager.comboStreak = 0; // reset streak on error
      if (this.streakBadge) {
        this.streakBadge.destroy();
        this.streakBadge = null;
      }

      this.feedbackText.setText(`✗ ${result.feedback || localizationManager.t('math.tryAgain')}`);
      this.feedbackText.setColor('#f87171');

      if (this.btnSolution) {
        this.btnSolution.container.setVisible(true);
      }

      // Red tint shake
      buttonObj.container.list[0].clear();
      buttonObj.container.list[0].fillStyle(0xdc2626, 1);
      buttonObj.container.list[0].fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);

      this.tweens.add({
        targets: buttonObj.container,
        x: '+=6',
        duration: 50,
        yoyo: true,
        repeat: 3
      });
    }
  }

  showHint() {
    const hintData = questionManager.getNextHint();
    if (hintData) {
      this.feedbackText.setText(`💡 HINT: ${hintData.hint}`);
      this.feedbackText.setColor('#38bdf8');
      this.btnHint.setText(localizationManager.t('math.hint', { count: hintData.hintsRemaining }));
      audioManager.playClick();
    } else {
      this.feedbackText.setText('No more hints available!');
      this.btnHint.setText('NO HINTS LEFT');
    }
  }

  showFormulaModal() {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    const modalContainer = this.add.container(cx, cy);
    const boxW = isPort ? 650 : 820;
    const boxH = isPort ? 700 : 500;

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x000000, 0.4);
    modalBg.fillRoundedRect(-boxW / 2 - 4, -boxH / 2 + 6, boxW + 8, boxH, 22);

    modalBg.fillStyle(0xfffdf5, 0.98);
    modalBg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);

    modalBg.lineStyle(3, 0x331f12, 1);
    modalBg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);

    modalBg.lineStyle(1.5, 0xf59e0b, 0.9);
    modalBg.strokeRoundedRect(-boxW / 2 + 5, -boxH / 2 + 5, boxW - 10, boxH - 10, 16);
    modalContainer.add(modalBg);

    const currQ = questionManager.getCurrentQuestion();
    const chNum = this.chapter || currQ?.chapter || 1;
    const info = CHAPTER_FORMULAS[chNum] || CHAPTER_FORMULAS[1];
    const isMs = localizationManager.getLanguage() === 'ms';

    const titleText = isMs ? info.title.ms : info.title.en;
    const header = this.add.text(0, -boxH / 2 + 35, `💡 ${titleText}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '22px' : '20px',
      fontStyle: 'bold',
      color: '#b45309'
    }).setOrigin(0.5);
    modalContainer.add(header);

    // Render formula cards
    const startY = -boxH / 2 + 80;
    const spacing = isPort ? 130 : 92;

    info.items.forEach((item, idx) => {
      const y = startY + idx * spacing;
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0xfef3c7, 0.7);
      cardBg.fillRoundedRect(-boxW / 2 + 25, y, boxW - 50, isPort ? 115 : 82, 10);
      cardBg.lineStyle(1, 0xd97706, 0.8);
      cardBg.strokeRoundedRect(-boxW / 2 + 25, y, boxW - 50, isPort ? 115 : 82, 10);
      modalContainer.add(cardBg);

      const lbl = this.add.text(-boxW / 2 + 40, y + 8, `📌 ${item.label}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isPort ? '16px' : '14px',
        fontStyle: 'bold',
        color: '#92400e'
      });
      modalContainer.add(lbl);

      const val = this.add.text(-boxW / 2 + 40, y + (isPort ? 36 : 30), item.val, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: isPort ? '16px' : '14px',
        color: '#1e293b',
        wordWrap: { width: boxW - 80 }
      });
      modalContainer.add(val);
    });

    // Close button
    const closeBtn = createButton(this, 0, boxH / 2 - 35, isMs ? 'TUTUP / CLOSE' : 'CLOSE', {
      width: 220,
      height: 42,
      fontSize: '15px',
      bgColor: 0x475569,
      bgDarkColor: 0x334155,
      onClick: () => {
        audioManager.playClick();
        modalContainer.destroy();
      }
    });
    modalContainer.add(closeBtn.container);
  }

  showExplanationModal(isStudyMode = false) {
    const isPort = this.isPortrait();
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    const explContainer = this.add.container(cx, cy);
    const boxW = isPort ? 640 : 800;
    const boxH = isPort ? 640 : 480;

    const explBg = this.add.graphics();
    explBg.fillStyle(0x000000, 0.25);
    explBg.fillRoundedRect(-boxW / 2 - 2, -boxH / 2 + 7, boxW + 4, boxH, 22);

    explBg.fillStyle(0xd97706, 0.4);
    explBg.fillRoundedRect(-boxW / 2, -boxH / 2 + 4, boxW, boxH, 20);

    explBg.fillStyle(0xfffdf5, 0.98);
    explBg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);

    explBg.lineStyle(3, 0x331f12, 1);
    explBg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);

    explBg.lineStyle(1.5, 0xfcd34d, 0.9);
    explBg.strokeRoundedRect(-boxW / 2 + 5, -boxH / 2 + 5, boxW - 10, boxH - 10, 16);

    // Washi-tape stickers
    explBg.fillStyle(0xfb7185, 0.85);
    explBg.fillRect(-boxW / 2 + 16, -boxH / 2 - 4, 38, 12);
    explBg.fillStyle(0x6ee7b7, 0.85);
    explBg.fillRect(boxW / 2 - 54, -boxH / 2 - 4, 38, 12);

    explContainer.add(explBg);

    const isMs = localizationManager.getLanguage() === 'ms';
    const titleY = isPort ? -260 : -200;
    const titleText = isStudyMode
      ? (isMs ? '💡 Cara Penyelesaian Lengkap' : '💡 Complete Step-by-Step Solution')
      : ('★ ' + localizationManager.t('math.explanation'));

    const title = this.add.text(0, titleY, titleText, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPort ? '23px' : '21px',
      color: isStudyMode ? '#7c3aed' : '#059669',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    explContainer.add(title);

    const steps = questionManager.getExplanation();
    const startStepY = isPort ? -180 : -145;
    const stepSpacing = isPort ? 46 : 40;
    const textStartX = isPort ? -290 : -360;
    const wrapW = isPort ? 580 : 720;

    steps.forEach((step, i) => {
      const stepText = this.add.text(textStartX, startStepY + i * stepSpacing, `• ${step}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: isPort ? '18px' : '16px',
        color: '#331f12',
        wordWrap: { width: wrapW }
      });
      explContainer.add(stepText);
    });

    const contY = isPort ? 240 : 180;
    const contW = isPort ? 420 : 260;
    const contH = isPort ? 56 : 48;
    const contFont = isPort ? '19px' : '17px';

    const btnLabel = isStudyMode
      ? (isMs ? 'FAHAM! CUBA LAGI →' : 'UNDERSTOOD! TRY AGAIN →')
      : 'CONTINUE TO COOKING →';

    const actionBtn = createButton(this, 0, contY, btnLabel, {
      width: contW,
      height: contH,
      fontSize: contFont,
      bgColor: isStudyMode ? 0x7c3aed : THEME.secondary,
      bgDarkColor: isStudyMode ? 0x6d28d9 : THEME.secondaryDark,
      onClick: () => {
        explContainer.destroy();
        if (!isStudyMode) {
          const accuracy = this.attempts === 1 ? 1.0 : Math.max(0.4, 1.0 - (this.attempts - 1) * 0.2);
          if (this.onComplete) {
            this.onComplete(accuracy);
          }
        }
      }
    });
    explContainer.add(actionBtn.container);
  }
}

export default MathChallengeScene;
