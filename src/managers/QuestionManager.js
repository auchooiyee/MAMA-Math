import questionLoader from '../questions/questionLoader.js';
import { generateQuestionForChapter } from '../questions/questionGenerator.js';
import localizationManager from './LocalizationManager.js';

class QuestionManager {
  constructor() {
    this.currentQuestion = null;
    this.hintsUsed = 0;
    this.attemptsCount = 0;
    this.usedQuestionIds = new Set();
    this.usedSignatures = new Set();
  }

  resetSession() {
    this.usedQuestionIds.clear();
    this.usedSignatures.clear();
  }

  getAvailableBankQuestions({ chapter = null, difficulty = null } = {}) {
    const list = questionLoader.getQuestionsByChapterAndDifficulty(chapter, difficulty);
    return list.filter(q => !this.usedQuestionIds.has(q.id));
  }

  hasMoreQuestions({ chapter = null, difficulty = null, includeProcedural = false } = {}) {
    if (includeProcedural && chapter) {
      return true;
    }
    return this.getAvailableBankQuestions({ chapter, difficulty }).length > 0;
  }

  getRemainingCount({ chapter = null, difficulty = null } = {}) {
    return this.getAvailableBankQuestions({ chapter, difficulty }).length;
  }

  getNextBankQuestion({ chapter = null, difficulty = null } = {}) {
    const available = this.getAvailableBankQuestions({ chapter, difficulty });
    if (available.length === 0) {
      return null;
    }
    // Randomly pick one from available pool without repetition
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    this.usedQuestionIds.add(chosen.id);
    return this.loadQuestion(chosen);
  }

  getOrGenerateQuestion({ chapter = 1, difficulty = 'easy' } = {}) {
    const ch = parseInt(chapter, 10) || 1;
    // 1. Check static bank for requested tier first
    let q = this.getNextBankQuestion({ chapter: ch, difficulty });
    if (q) return q;

    // 2. Fallback to other difficulty tiers in same chapter
    const fallbackTiers = difficulty === 'medium'
      ? ['hard', 'easy']
      : difficulty === 'hard'
        ? ['medium', 'easy']
        : ['medium', 'hard'];

    for (const altTier of fallbackTiers) {
      q = this.getNextBankQuestion({ chapter: ch, difficulty: altTier });
      if (q) return q;
    }

    // 3. Fallback to procedural generator with zero-repeat signature tracking
    try {
      let attempts = 0;
      let generatedQ = null;
      while (attempts < 10) {
        generatedQ = generateQuestionForChapter(ch, difficulty);
        const sig = `${ch}:${generatedQ.equation || generatedQ.answer || generatedQ.id}`;
        if (!this.usedSignatures.has(sig)) {
          this.usedSignatures.add(sig);
          break;
        }
        attempts++;
      }
      if (generatedQ) {
        return this.loadQuestion(generatedQ);
      }
    } catch (e) {
      console.warn(`Procedural generation fallback error for chapter ${ch}:`, e);
    }

    // 4. If all exhausted, clear used question IDs for this chapter and pick again
    const allForCh = questionLoader.getQuestionsForChapter(ch);
    allForCh.forEach(item => this.usedQuestionIds.delete(item.id));
    return this.getNextBankQuestion({ chapter: ch, difficulty });
  }

  setCurrentQuestion(questionId) {
    const q = questionLoader.getQuestionById(questionId);
    if (!q) {
      console.warn(`Question ${questionId} not found, falling back to dynamic question`);
      const ch = parseInt(questionId?.split('-')?.[1]?.replace('C', ''), 10) || 1;
      return this.getOrGenerateQuestion({ chapter: ch, difficulty: 'easy' });
    }
    this.usedQuestionIds.add(q.id);
    return this.loadQuestion(q);
  }

  loadQuestion(questionObj) {
    this.currentQuestion = questionObj;
    this.hintsUsed = 0;
    this.attemptsCount = 0;
    return this.currentQuestion;
  }

  generateAndSetQuestion(chapterNumber, difficulty = 'easy') {
    return this.getOrGenerateQuestion({ chapter: chapterNumber, difficulty });
  }

  getCurrentQuestion() {
    return this.currentQuestion;
  }

  getQuestionText() {
    if (!this.currentQuestion) return '';
    const lang = localizationManager.getLanguage();
    if (typeof this.currentQuestion.question === 'object') {
      return this.currentQuestion.question[lang] || this.currentQuestion.question.en;
    }
    return this.currentQuestion.question;
  }

  getOptions() {
    if (!this.currentQuestion || !this.currentQuestion.options) return [];
    const lang = localizationManager.getLanguage();
    return this.currentQuestion.options.map(opt => {
      if (typeof opt === 'object') {
        const feedback = opt.feedback ? (opt.feedback[lang] || opt.feedback.en) : '';
        const text = typeof opt.text === 'object' && opt.text !== null
          ? (opt.text[lang] || opt.text.en)
          : opt.text;
        return { value: opt.value, text, feedback };
      }
      return { value: opt, text: String(opt), feedback: '' };
    });
  }

  getNextHint() {
    if (!this.currentQuestion || !this.currentQuestion.hints) return null;
    const lang = localizationManager.getLanguage();
    const hintsList = this.currentQuestion.hints[lang] || this.currentQuestion.hints.en || [];
    if (this.hintsUsed < hintsList.length) {
      const hint = hintsList[this.hintsUsed];
      this.hintsUsed += 1;
      return { hint, hintsRemaining: hintsList.length - this.hintsUsed };
    }
    return null;
  }

  getExplanation() {
    if (!this.currentQuestion || !this.currentQuestion.explanation) return [];
    const lang = localizationManager.getLanguage();
    return this.currentQuestion.explanation[lang] || this.currentQuestion.explanation.en || [];
  }

  checkAnswer(submittedValue) {
    if (!this.currentQuestion) return { isCorrect: false, feedback: '' };

    this.attemptsCount += 1;
    const isCorrect = submittedValue === this.currentQuestion.answer;
    let feedback = '';

    if (this.currentQuestion.options) {
      const option = this.currentQuestion.options.find(
        opt => (typeof opt === 'object' ? opt.value === submittedValue : opt === submittedValue)
      );
      if (option && option.feedback) {
        const lang = localizationManager.getLanguage();
        feedback = option.feedback[lang] || option.feedback.en || '';
      }
    }

    return {
      isCorrect,
      feedback,
      attemptsCount: this.attemptsCount,
      hintsUsed: this.hintsUsed
    };
  }
}

export const questionManager = new QuestionManager();
export default questionManager;
