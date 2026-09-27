import teacherData from '../data/teacherAnalytics.json' with { type: 'json' };
import multiplayerManager from './MultiplayerManager.js';

class AnalyticsManager {
  constructor() {
    this.sessionAttempts = [];
    this.activeClassChallenge = null;
    this.baselineData = teacherData;
  }

  recordQuestionAttempt(data) {
    const attempt = {
      questionId: data.questionId || 'unknown',
      chapter: data.chapter || 1,
      isCorrect: Boolean(data.isCorrect),
      hintsUsed: data.hintsUsed || 0,
      durationSeconds: data.durationSeconds || 30,
      timestamp: Date.now()
    };
    this.sessionAttempts.push(attempt);
    return attempt;
  }

  getChapterMastery(chapterNum) {
    const chapterAttempts = this.sessionAttempts.filter(a => a.chapter === chapterNum);
    const baseline = this.baselineData.chapterMastery.find(c => c.chapter === chapterNum);

    if (chapterAttempts.length === 0) {
      return baseline ? baseline.mastery : 75;
    }

    const sessionCorrect = chapterAttempts.filter(a => a.isCorrect).length;
    const sessionRate = Math.round((sessionCorrect / chapterAttempts.length) * 100);

    // Weighted combination of baseline class and session
    if (baseline) {
      const totalCorrect = baseline.correct + sessionCorrect;
      const totalAttempts = baseline.attempts + chapterAttempts.length;
      return Math.round((totalCorrect / totalAttempts) * 100);
    }
    return sessionRate;
  }

  getChapterBreakdown() {
    return Array.from({ length: 10 }, (_, i) => {
      const ch = i + 1;
      const mastery = this.getChapterMastery(ch);
      const baseline = this.baselineData.chapterMastery.find(c => c.chapter === ch);
      return {
        chapter: ch,
        code: `F4-C${ch.toString().padStart(2, '0')}`,
        nameKey: `worlds.w${ch}`,
        mastery,
        needsRevision: mastery < 60,
        isMastered: mastery >= 80,
        attempts: (baseline?.attempts || 0) + this.sessionAttempts.filter(a => a.chapter === ch).length
      };
    });
  }

  getClassKPIs() {
    const breakdown = this.getChapterBreakdown();
    const avgMastery = Math.round(breakdown.reduce((acc, c) => acc + c.mastery, 0) / breakdown.length);
    const revisionCount = breakdown.filter(c => c.needsRevision).length;

    return {
      classCode: this.baselineData.classInfo.code,
      className: this.baselineData.classInfo.name,
      school: this.baselineData.classInfo.school,
      studentsEnrolled: this.baselineData.classInfo.studentsEnrolled,
      studentsActive: this.baselineData.classInfo.studentsActive,
      averageAccuracy: avgMastery,
      totalQuestionsAnswered: this.baselineData.classInfo.totalQuestionsAnswered + this.sessionAttempts.length,
      chaptersNeedingRevision: revisionCount
    };
  }

  getMisconceptionAlerts() {
    return this.baselineData.commonMisconceptions;
  }

  createClassChallenge(config) {
    const challenge = {
      id: 'CHAL-' + Math.floor(1000 + Math.random() * 9000),
      classCode: config.classCode || this.baselineData.classInfo.code,
      chapter: config.chapter || 1, // 0 means all chapters
      difficulty: config.difficulty || 'easy',
      timeLimitMinutes: config.timeLimitMinutes || 10,
      questionCount: config.questionCount || 10,
      hintsAllowed: config.hintsAllowed !== undefined ? config.hintsAllowed : true,
      createdTimestamp: Date.now()
    };

    this.activeClassChallenge = challenge;

    // Broadcast challenge to student clients on the room bus
    if (multiplayerManager) {
      multiplayerManager.broadcast({
        type: 'CLASS_CHALLENGE_CREATED',
        challenge
      });
    }

    return challenge;
  }

  getActiveClassChallenge() {
    return this.activeClassChallenge;
  }
}

export const analyticsManager = new AnalyticsManager();
export default analyticsManager;
