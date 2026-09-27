import { generateQuadratic } from './generators/quadratic.js';
import { generateNumberBases } from './generators/numberBases.js';
import { generateLogic } from './generators/logic.js';
import { generateSets } from './generators/sets.js';
import { generateGraphTheory } from './generators/graphTheory.js';
import { generateInequalities } from './generators/inequalities.js';
import { generateMotion } from './generators/motion.js';
import { generateStatistics } from './generators/statistics.js';
import { generateProbability } from './generators/probability.js';
import { generateFinance } from './generators/finance.js';
import { validateQuestion } from './validators.js';

export const GENERATORS_BY_CHAPTER = {
  1: generateQuadratic,
  2: generateNumberBases,
  3: generateLogic,
  4: generateSets,
  5: generateGraphTheory,
  6: generateInequalities,
  7: generateMotion,
  8: generateStatistics,
  9: generateProbability,
  10: generateFinance
};

const recentSignatures = new Set();

export function generateQuestionForChapter(chapterNumber, difficulty = 'easy') {
  const generator = GENERATORS_BY_CHAPTER[chapterNumber];
  if (!generator) {
    throw new Error(`No procedural generator registered for chapter ${chapterNumber}`);
  }

  let question = null;
  let attempts = 0;
  // Retry up to 8 times to get a question variant not recently used
  while (attempts < 8) {
    question = generator(difficulty);
    const sig = `${chapterNumber}:${question.equation || question.answer || question.id}`;
    if (!recentSignatures.has(sig)) {
      recentSignatures.add(sig);
      if (recentSignatures.size > 50) {
        const first = recentSignatures.values().next().value;
        recentSignatures.delete(first);
      }
      break;
    }
    attempts++;
  }

  const validation = validateQuestion(question);
  if (!validation.valid) {
    console.error(`Procedural question validation error for chapter ${chapterNumber}:`, validation.errors);
    throw new Error(`Generated invalid question for chapter ${chapterNumber}: ${validation.errors.join(', ')}`);
  }

  return question;
}

export default {
  generateQuestionForChapter,
  GENERATORS_BY_CHAPTER
};
