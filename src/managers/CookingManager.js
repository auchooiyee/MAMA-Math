class CookingManager {
  constructor() {
    this.currentRecipe = null;
    this.currentCustomer = null;
    this.lastServedCustomer = null;
    this.currentStepIndex = 0;
    this.cookingScores = [];
    this.mathScores = [];
    this.startTime = 0;
    this.endTime = 0;
  }

  startRecipe(recipe, customer = null) {
    this.currentRecipe = recipe;
    this.currentCustomer = customer;
    this.currentStepIndex = 0;
    this.cookingScores = [];
    this.mathScores = [];
    this.startTime = Date.now();
    this.endTime = 0;
  }

  getCurrentStep() {
    if (!this.currentRecipe || !this.currentRecipe.steps) return null;
    return this.currentRecipe.steps[this.currentStepIndex] || null;
  }

  recordCookingScore(score0to1) {
    this.cookingScores.push(Math.max(0, Math.min(1, score0to1)));
  }

  recordMathScore(score0to1) {
    this.mathScores.push(Math.max(0, Math.min(1, score0to1)));
  }

  getLiveQuality() {
    const scores = [...this.mathScores, ...this.cookingScores];
    if (scores.length === 0) return 1;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  nextStep() {
    this.currentStepIndex += 1;
    const next = this.getCurrentStep();
    if (!next) {
      this.endTime = Date.now();
    }
    return next;
  }

  isRecipeComplete() {
    if (!this.currentRecipe || !this.currentRecipe.steps) return true;
    return this.currentStepIndex >= this.currentRecipe.steps.length;
  }

  getPerformanceMetrics() {
    const avg = arr => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 1.0);
    const mathAccuracy = avg(this.mathScores);
    const cookingAccuracy = avg(this.cookingScores);

    const durationSeconds = Math.max(1, Math.round(( (this.endTime || Date.now()) - this.startTime) / 1000));
    const targetSeconds = this.currentRecipe?.prepTimeSeconds || 60;
    const speedScore = durationSeconds <= targetSeconds ? 1.0 : Math.max(0.5, 1 - (durationSeconds - targetSeconds) / targetSeconds);

    // Formula from GDD Section 22:
    // finalScore = mathAccuracy * 0.40 + cookingAccuracy * 0.25 + speed * 0.15 + customerSatisfaction * 0.10 + financialPerformance * 0.10
    const satisfaction = (mathAccuracy * 0.6) + (cookingAccuracy * 0.4);
    const financial = mathAccuracy >= 0.8 ? 1.0 : 0.7;

    const finalScore = (mathAccuracy * 0.40) +
                       (cookingAccuracy * 0.25) +
                       (speedScore * 0.15) +
                       (satisfaction * 0.10) +
                       (financial * 0.10);

    let stars = 1;
    if (finalScore >= 0.90) stars = 3;
    else if (finalScore >= 0.70) stars = 2;

    const isPerfect = mathAccuracy === 1.0 && cookingAccuracy >= 0.95;

    return {
      mathAccuracy,
      cookingAccuracy,
      speedScore,
      durationSeconds,
      finalScore,
      stars,
      isPerfect
    };
  }
}

export const cookingManager = new CookingManager();
export default cookingManager;
