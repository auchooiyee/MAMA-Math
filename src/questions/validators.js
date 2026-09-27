export function validateQuestion(question) {
  const errors = [];

  if (!question.id) errors.push('Missing question id');
  if (!question.chapter || typeof question.chapter !== 'number') errors.push('Missing or invalid chapter number');
  if (!question.topic) errors.push('Missing question topic');
  if (!question.type) errors.push('Missing question type');

  // Validate question text
  if (!question.question) {
    errors.push('Missing question text');
  } else if (typeof question.question === 'object') {
    if (!question.question.en && !question.question.ms) {
      errors.push('Missing dual-language question text (en/ms)');
    }
  }

  // Validate answer
  if (question.answer === undefined || question.answer === null) {
    errors.push('Missing question answer');
  }

  // Validate multiple choice options
  if (question.type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Multiple choice question must have at least 2 options');
    } else {
      const hasCorrectOption = question.options.some(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return opt.value === question.answer;
        }
        return opt === question.answer;
      });
      if (!hasCorrectOption) {
        errors.push(`Answer "${question.answer}" is not found in options`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default validateQuestion;
