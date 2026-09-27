import chapter01 from './data/chapter01.json' with { type: 'json' };
import chapter02 from './data/chapter02.json' with { type: 'json' };
import chapter03 from './data/chapter03.json' with { type: 'json' };
import chapter04 from './data/chapter04.json' with { type: 'json' };
import chapter05 from './data/chapter05.json' with { type: 'json' };
import chapter06 from './data/chapter06.json' with { type: 'json' };
import chapter07 from './data/chapter07.json' with { type: 'json' };
import chapter08 from './data/chapter08.json' with { type: 'json' };
import chapter09 from './data/chapter09.json' with { type: 'json' };
import chapter10 from './data/chapter10.json' with { type: 'json' };
import { validateQuestion } from './validators.js';

class QuestionLoader {
  constructor() {
    this.questionsById = new Map();
    this.questionsByChapter = new Map();
    this.loadInitialData();
  }

  loadInitialData() {
    this.registerQuestions(1, chapter01);
    this.registerQuestions(2, chapter02);
    this.registerQuestions(3, chapter03);
    this.registerQuestions(4, chapter04);
    this.registerQuestions(5, chapter05);
    this.registerQuestions(6, chapter06);
    this.registerQuestions(7, chapter07);
    this.registerQuestions(8, chapter08);
    this.registerQuestions(9, chapter09);
    this.registerQuestions(10, chapter10);
  }

  registerQuestions(chapterNumber, questions) {
    const validQuestions = [];
    for (const q of questions) {
      const validation = validateQuestion(q);
      if (!validation.valid) {
        console.error(`Invalid question ${q.id}:`, validation.errors);
      } else {
        validQuestions.push(q);
        this.questionsById.set(q.id, q);
      }
    }
    this.questionsByChapter.set(chapterNumber, validQuestions);
  }

  getQuestionById(id) {
    return this.questionsById.get(id);
  }

  getQuestionsForChapter(chapterNumber) {
    return this.questionsByChapter.get(chapterNumber) || [];
  }

  getQuestionsByChapterAndDifficulty(chapterNumber, difficulty = null) {
    let list = [];
    if (chapterNumber && chapterNumber > 0) {
      list = this.getQuestionsForChapter(chapterNumber);
    } else {
      list = this.getAllQuestions();
    }
    if (difficulty && difficulty !== 'all') {
      return list.filter(q => q.difficulty === difficulty);
    }
    return list;
  }

  getAllQuestions() {
    return Array.from(this.questionsById.values());
  }
}

export const questionLoader = new QuestionLoader();
export default questionLoader;
