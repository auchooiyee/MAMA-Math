import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import analyticsManager from '../managers/AnalyticsManager.js';
import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class TeacherDashboardScene extends Phaser.Scene {
  constructor() {
    super('TeacherDashboardScene');
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createKPICards();
    this.createChapterMasteryBars();
    this.createDiagnosticAlerts();
  }

  createBackground() {
    createWarungBackdrop(this, { dim: 0.2, counter: true });

    // Warm radial glow
    const glow = this.add.graphics();
    glow.fillStyle(0x38bdf8, 0.04);
    glow.fillCircle(640, 360, 460);
  }

  createHeader() {
    // Back to Menu Button
    createButton(this, 110, 45, '← MENU', {
      width: 120,
      height: 40,
      fontSize: '15px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => {
        this.scene.start('MainMenuScene');
      }
    });

    // Header Title
    this.add.text(640, 35, '🎓 ' + localizationManager.t('teacher.title'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 65, localizationManager.t('teacher.subtitle'), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#94a3b8'
    }).setOrigin(0.5);
  }

  createKPICards() {
    const kpis = analyticsManager.getClassKPIs();
    const container = this.add.container(640, 125);

    const cards = [
      { label: localizationManager.t('teacher.kpiStudents'), val: `${kpis.studentsActive} / ${kpis.studentsEnrolled}`, color: '#38bdf8', icon: '👥' },
      { label: localizationManager.t('teacher.kpiAccuracy'), val: `${kpis.averageAccuracy}%`, color: '#4ade80', icon: '🎯' },
      { label: localizationManager.t('teacher.kpiQuestions'), val: `${kpis.totalQuestionsAnswered}`, color: '#facc15', icon: '📐' },
      { label: localizationManager.t('teacher.kpiAlerts'), val: `${kpis.chaptersNeedingRevision} ` + localizationManager.t('teacher.needsRevision'), color: '#f87171', icon: '⚠️' }
    ];

    const cardW = 280;
    const totalW = cards.length * cardW;
    const startX = -totalW / 2 + cardW / 2;

    cards.forEach((c, i) => {
      const cardX = startX + i * cardW;
      const card = this.add.container(cardX, 0);

      const bg = this.add.graphics();
      bg.fillStyle(0x1e293b, 0.9);
      bg.fillRoundedRect(-130, -35, 260, 70, 12);
      bg.lineStyle(1.5, THEME.primary, 0.6);
      bg.strokeRoundedRect(-130, -35, 260, 70, 12);
      card.add(bg);

      const icon = this.add.text(-110, 0, c.icon, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px'
      }).setOrigin(0, 0.5);
      card.add(icon);

      const val = this.add.text(-70, -10, c.val, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '19px',
        color: c.color,
        fontStyle: 'bold'
      });
      card.add(val);

      const lbl = this.add.text(-70, 12, c.label, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#94a3b8'
      });
      card.add(lbl);

      container.add(card);
    });
  }

  createChapterMasteryBars() {
    const container = this.add.container(360, 440);

    const board = this.add.graphics();
    board.fillStyle(0x18181b, 0.95);
    board.fillRoundedRect(-320, -250, 640, 500, 16);
    board.lineStyle(2, 0x0284c7, 0.8);
    board.strokeRoundedRect(-320, -250, 640, 500, 16);
    container.add(board);

    const title = this.add.text(-300, -225, '📊 ' + localizationManager.t('teacher.chapterMastery'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });
    container.add(title);

    const breakdown = analyticsManager.getChapterBreakdown();
    const barStartY = -185;
    const barSpacing = 42;
    const maxBarW = 320;

    breakdown.forEach((ch, idx) => {
      const y = barStartY + idx * barSpacing;

      // Label (e.g. Chapter 1 in EN, Bab 1 in MS)
      const isMs = localizationManager.getLanguage() === 'ms';
      const chLabel = isMs ? `Bab ${ch.chapter}` : `Chapter ${ch.chapter}`;
      const lbl = this.add.text(-300, y, `${ch.code}: ${chLabel}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      container.add(lbl);

      // Track background
      const track = this.add.graphics();
      track.fillStyle(0x334155, 0.8);
      track.fillRoundedRect(-140, y - 8, maxBarW, 16, 8);
      container.add(track);

      // Fill bar
      let barColor = 0x22c55e; // Green
      if (ch.mastery < 60) barColor = 0xef4444; // Red
      else if (ch.mastery < 80) barColor = 0xf59e0b; // Amber

      const fillBar = this.add.graphics();
      fillBar.fillStyle(barColor, 1);
      fillBar.fillRoundedRect(-140, y - 8, Math.max(12, (maxBarW * ch.mastery) / 100), 16, 8);
      container.add(fillBar);

      // Percentage Text
      const pct = this.add.text(-140 + maxBarW + 15, y, `${ch.mastery}%`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: ch.mastery < 60 ? '#f87171' : (ch.mastery >= 80 ? '#4ade80' : '#fef08a'),
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      container.add(pct);
    });
  }

  createDiagnosticAlerts() {
    const container = this.add.container(960, 440);

    const board = this.add.graphics();
    board.fillStyle(0x18181b, 0.95);
    board.fillRoundedRect(-280, -250, 560, 500, 16);
    board.lineStyle(2, THEME.primary, 0.8);
    board.strokeRoundedRect(-280, -250, 560, 500, 16);
    container.add(board);

    const title = this.add.text(-250, -225, '⚠️ ' + localizationManager.t('teacher.diagnosticAlerts'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#f59e0b',
      fontStyle: 'bold'
    });
    container.add(title);

    const alerts = analyticsManager.getMisconceptionAlerts();
    alerts.forEach((alert, i) => {
      const y = -170 + i * 110;
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x27272a, 0.9);
      cardBg.fillRoundedRect(-250, y, 500, 95, 10);
      cardBg.lineStyle(1.5, alert.chapter === 6 ? 0xef4444 : 0xf59e0b, 0.8);
      cardBg.strokeRoundedRect(-250, y, 500, 95, 10);
      container.add(cardBg);

      const topicText = this.add.text(-235, y + 10, `Bab ${alert.chapter}: ${alert.topic}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      container.add(topicText);

      const errBadge = this.add.text(230, y + 10, `Error Rate: ${alert.errorRate}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: '#f87171',
        fontStyle: 'bold'
      }).setOrigin(1, 0);
      container.add(errBadge);

      const diagText = this.add.text(-235, y + 36, localizationManager.t(alert.alertKey), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#cbd5e1',
        wordWrap: { width: 470 }
      });
      container.add(diagText);

      const recText = this.add.text(-235, y + 68, '💡 ' + localizationManager.t(alert.recommendationKey), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#86efac',
        fontStyle: 'bold'
      });
      container.add(recText);
    });

    // Challenge Creation Action Button
    const btnCreate = createButton(this, 960, 650, '🎯 ' + localizationManager.t('teacher.createChallengeBtn'), {
      width: 380,
      height: 48,
      fontSize: '17px',
      bgColor: THEME.secondary,
      bgDarkColor: THEME.secondaryDark,
      onClick: () => {
        this.scene.start('TeacherChallengeScene');
      }
    });
  }
}

export default TeacherDashboardScene;
