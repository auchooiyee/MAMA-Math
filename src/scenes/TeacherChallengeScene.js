import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import analyticsManager from '../managers/AnalyticsManager.js';
import questionLoader from '../questions/questionLoader.js';
import multiplayerManager, { MULTIPLAYER_MODES } from '../managers/MultiplayerManager.js';
import audioManager from '../managers/AudioManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class TeacherChallengeScene extends Phaser.Scene {
  constructor() {
    super('TeacherChallengeScene');
    this.selectedChapter = 1;
    this.selectedDifficulty = 'medium';
    this.selectedDuration = 10; // minutes
    this.selectedQuestionCount = 10;
    this.hintsAllowed = true;
    this.classCode = String(Math.floor(1000 + Math.random() * 9000));
  }

  init() {
    this.classCode = String(Math.floor(1000 + Math.random() * 9000));
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createFormControls();
    this.createPreviewCard();
  }

  createBackground() {
    createWarungBackdrop(this, { dim: 0.2, counter: true });

    const glow = this.add.graphics();
    glow.fillStyle(0x7c3aed, 0.05);
    glow.fillCircle(640, 360, 440);
  }

  createHeader() {
    // Back to Dashboard Button
    createButton(this, 110, 45, '← DASHBOARD', {
      width: 140,
      height: 40,
      fontSize: '14px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => {
        this.scene.start('TeacherDashboardScene');
      }
    });

    // Title
    this.add.text(640, 35, '🎯 ' + localizationManager.t('teacher.createChallengeTitle'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 65, localizationManager.t('teacher.createChallengeSub'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createFormControls() {
    const container = this.add.container(420, 390);

    const panel = this.add.graphics();
    panel.fillStyle(0x18181b, 0.95);
    panel.fillRoundedRect(-360, -260, 720, 520, 18);
    panel.lineStyle(2, THEME.primary, 0.8);
    panel.strokeRoundedRect(-360, -260, 720, 520, 18);
    container.add(panel);

    let currentY = -215;

    const isMs = localizationManager.getLanguage() === 'ms';
    const chPrefix = isMs ? 'Bab ' : 'Chapter ';
    const allLabel = isMs ? 'Semua Bab' : 'All Chapters';

    // 1. Target Chapter Selector
    const lblCh = this.add.text(-330, currentY, '1. ' + localizationManager.t('teacher.selectChapter'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });
    container.add(lblCh);
    currentY += 32;

    const chapters = [
      { id: 1, label: `${chPrefix}1` },
      { id: 2, label: `${chPrefix}2` },
      { id: 3, label: `${chPrefix}3` },
      { id: 4, label: `${chPrefix}4` },
      { id: 5, label: `${chPrefix}5` },
      { id: 6, label: `${chPrefix}6` },
      { id: 7, label: `${chPrefix}7` },
      { id: 8, label: `${chPrefix}8` },
      { id: 9, label: `${chPrefix}9` },
      { id: 10, label: `${chPrefix}10` },
      { id: 0, label: allLabel }
    ];

    chapters.forEach((ch, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const btnX = -255 + col * 170;
      const btnY = currentY + row * 36;

      const isSel = this.selectedChapter === ch.id;
      const btn = createButton(this, btnX, btnY, ch.label, {
        width: 155,
        height: 30,
        fontSize: '12px',
        bgColor: isSel ? THEME.secondary : 0x27272a,
        onClick: () => {
          this.selectedChapter = ch.id;
          audioManager.playClick();
          this.scene.restart();
        }
      });
      container.add(btn.container);
    });

    currentY += 120;

    // 2. Difficulty Selector
    const lblDiff = this.add.text(-330, currentY, '2. ' + localizationManager.t('teacher.selectDifficulty'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });
    container.add(lblDiff);
    currentY += 35;

    const diffs = ['easy', 'medium', 'hard'];
    diffs.forEach((d, idx) => {
      const btnX = -210 + idx * 210;
      const isSel = this.selectedDifficulty === d;
      const btn = createButton(this, btnX, currentY, d.toUpperCase(), {
        width: 190,
        height: 34,
        fontSize: '14px',
        bgColor: isSel ? THEME.secondary : 0x27272a,
        onClick: () => {
          this.selectedDifficulty = d;
          audioManager.playClick();
          this.scene.restart();
        }
      });
      container.add(btn.container);
    });

    currentY += 60;

    // 3. Time Limit
    const lblTime = this.add.text(-330, currentY, '3. ' + localizationManager.t('teacher.timeLimit'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });
    container.add(lblTime);
    currentY += 35;

    const durations = [5, 10, 15];
    durations.forEach((m, idx) => {
      const btnX = -210 + idx * 210;
      const isSel = this.selectedDuration === m;
      const btn = createButton(this, btnX, currentY, `${m} MINUTES`, {
        width: 190,
        height: 34,
        fontSize: '14px',
        bgColor: isSel ? THEME.secondary : 0x27272a,
        onClick: () => {
          this.selectedDuration = m;
          audioManager.playClick();
          this.scene.restart();
        }
      });
      container.add(btn.container);
    });

    currentY += 60;

    // 4. Hints Policy
    const lblHint = this.add.text(-330, currentY, '4. ' + localizationManager.t('teacher.hintPolicy'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });
    container.add(lblHint);
    currentY += 35;

    const policies = [
      { val: true, label: 'ALLOW HINTS (Practice Mode)' },
      { val: false, label: 'DISABLE HINTS (Exam Mode)' }
    ];
    policies.forEach((p, idx) => {
      const btnX = -150 + idx * 300;
      const isSel = this.hintsAllowed === p.val;
      const btn = createButton(this, btnX, currentY, p.label, {
        width: 270,
        height: 34,
        fontSize: '13px',
        bgColor: isSel ? THEME.secondary : 0x27272a,
        onClick: () => {
          this.hintsAllowed = p.val;
          audioManager.playClick();
          this.scene.restart();
        }
      });
      container.add(btn.container);
    });
  }

  createPreviewCard() {
    const container = this.add.container(1010, 390);

    const panel = this.add.graphics();
    panel.fillStyle(0x18181b, 0.95);
    panel.fillRoundedRect(-220, -260, 440, 520, 18);
    panel.lineStyle(2, 0x059669, 0.85);
    panel.strokeRoundedRect(-220, -260, 440, 520, 18);
    container.add(panel);

    const title = this.add.text(0, -220, '📋 CHALLENGE SUMMARY', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);

    // Class Code Box
    const codeBox = this.add.graphics();
    codeBox.fillStyle(0x0f172a, 1);
    codeBox.fillRoundedRect(-180, -180, 360, 70, 12);
    codeBox.lineStyle(1.5, THEME.primary, 0.8);
    codeBox.strokeRoundedRect(-180, -180, 360, 70, 12);
    container.add(codeBox);

    const codeLbl = this.add.text(0, -165, 'CLASSROOM 4-DIGIT PIN FOR STUDENTS:', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);
    container.add(codeLbl);

    const codeVal = this.add.text(0, -135, this.classCode, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '34px',
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5);
    container.add(codeVal);

    const isMs = localizationManager.getLanguage() === 'ms';
    const chPrefix = isMs ? 'Bab ' : 'Chapter ';
    const allLabel = isMs ? 'Semua Bab' : 'All 10 Chapters';

    // Summary Specifications
    const summaryData = [
      { label: isMs ? 'Bab Sasaran:' : 'Target Chapter:', val: this.selectedChapter === 0 ? allLabel : `${chPrefix}${this.selectedChapter}` },
      { label: 'Difficulty:', val: this.selectedDifficulty.toUpperCase() },
      { label: 'Time Limit:', val: `${this.selectedDuration} Minutes` },
      { label: 'Question Set:', val: '10 Questions' },
      { label: 'Hints Allowed:', val: this.hintsAllowed ? 'Yes (3 Hints/Q)' : 'No (Strict Exam)' }
    ];

    summaryData.forEach((item, idx) => {
      const y = -70 + idx * 36;
      const lbl = this.add.text(-180, y, item.label, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#cbd5e1'
      });
      const val = this.add.text(180, y, item.val, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(1, 0);
      container.add(lbl);
      container.add(val);
    });

    // Launch Broadcast Button
    const btnLaunch = createButton(this, 1010, 580, '🚀 ' + localizationManager.t('teacher.broadcastBtn'), {
      width: 380,
      height: 52,
      fontSize: '18px',
      bgColor: THEME.secondary,
      bgDarkColor: THEME.secondaryDark,
      onClick: () => {
        this.broadcastChallenge();
      }
    });
  }

  broadcastChallenge() {
    audioManager.playCoin();
    const challenge = analyticsManager.createClassChallenge({
      classCode: this.classCode,
      chapter: this.selectedChapter,
      difficulty: this.selectedDifficulty,
      timeLimitMinutes: this.selectedDuration,
      questionCount: 10,
      hintsAllowed: this.hintsAllowed
    });
    const questionPool = questionLoader.getQuestionsByChapterAndDifficulty(
      this.selectedChapter > 0 ? this.selectedChapter : null,
      this.selectedDifficulty
    );
    let seed = [...challenge.id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
    const seededRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const orderedQuestions = [...questionPool];
    for (let index = orderedQuestions.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(seededRandom() * (index + 1));
      [orderedQuestions[index], orderedQuestions[swapIndex]] = [orderedQuestions[swapIndex], orderedQuestions[index]];
    }
    // Give the host the full selected bank; it assigns each question once across the room.
    challenge.questionIds = orderedQuestions.map(question => question.id);
    challenge.questionCount = challenge.questionIds.length;

    // Determine suitable mission recipe matching chapter or default to M01-01
    let missionId = 'M01-01';
    if (this.selectedChapter === 6 || this.selectedChapter === 4) {
      missionId = 'M04-01';
    } else if (this.selectedChapter === 2) {
      missionId = 'M02-01';
    } else if (this.selectedChapter === 5) {
      missionId = 'M05-01';
    } else if (this.selectedChapter === 7) {
      missionId = 'M07-01';
    } else if (this.selectedChapter === 10) {
      missionId = 'M10-01';
    }

    // Create room in multiplayer manager with selected chapter & difficulty
    multiplayerManager.createRoom(MULTIPLAYER_MODES.CLASSROOM, {
      classCode: this.classCode,
      roomId: this.classCode,
      hostRoleMode: 'observant',
      nickname: 'Teacher (Host)',
      missionId: missionId,
      targetChapter: this.selectedChapter,
      difficulty: this.selectedDifficulty,
      questionCount: challenge.questionIds.length,
      questionIds: challenge.questionIds,
      timeLimitMinutes: challenge.timeLimitMinutes
    });

    // Confirmation Modal
    const modal = this.add.container(640, 360);

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x09090b, 0.96);
    modalBg.fillRoundedRect(-280, -180, 560, 360, 18);
    modalBg.lineStyle(3, THEME.secondary, 1);
    modalBg.strokeRoundedRect(-280, -180, 560, 360, 18);
    modal.add(modalBg);

    const title = this.add.text(0, -120, '🎉 CLASS CHALLENGE BROADCASTED! 🎉', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.add(title);

    const desc = this.add.text(0, -45, `Students can now join using 4-Digit PIN:\n\n${this.classCode}\n\nStudents answer independently. Each question is assigned once across the room; the challenge ends when the bank is finished or the host ends it. Scores are shown live to the teacher.`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    modal.add(desc);

    const btnEnter = createButton(this, 0, 55, '👁️ ENTER ROOM (OBSERVANT)', {
      width: 320,
      height: 46,
      fontSize: '16px',
      bgColor: THEME.secondary,
      bgDarkColor: THEME.secondaryDark,
      onClick: () => {
        this.scene.start('MultiplayerRoomScene');
      }
    });
    modal.add(btnEnter.container);

    const btnClose = createButton(this, 0, 115, 'RETURN TO DASHBOARD', {
      width: 320,
      height: 42,
      fontSize: '14px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => {
        this.scene.start('TeacherDashboardScene');
      }
    });
    modal.add(btnClose.container);
  }
}

export default TeacherChallengeScene;
