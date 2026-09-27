export function generateInequalities(difficulty = 'medium') {
  const priceA = Math.floor(Math.random() * 3) + 4; // RM 4 to 6
  const priceB = Math.floor(Math.random() * 2) + 2; // RM 2 to 3
  const budget = (priceA * 10) + (priceB * 15); // e.g. 70 to 105

  const qId = `PROC-C06-${Date.now() % 100000}`;

  return {
    id: qId,
    chapter: 6,
    topic: 'linear_inequalities_budget',
    difficulty,
    type: 'multiple_choice',
    mission: 'I1',
    context: 'procurement_budget',
    question: {
      en: `A stall purchases x kg of squid (RM ${priceA}/kg) and y kg of anchovies (RM ${priceB}/kg). The total procurement expenditure cannot exceed RM ${budget}. Which linear inequality correctly describes this condition?`,
      ms: `Sebuah gerai membeli x kg sotong (RM ${priceA}/kg) dan y kg ikan bilis (RM ${priceB}/kg). Jumlah perbelanjaan bahan tidak boleh melebihi RM ${budget}. Ketaksamaan linear manakah yang betul mewakili syarat ini?`
    },
    equation: `${priceA}x + ${priceB}y ≤ ${budget}`,
    options: [
      { value: 'A', text: `${priceA}x + ${priceB}y ≤ ${budget}`, feedback: { en: 'Correct! "Cannot exceed" means less than or equal to (≤).', ms: 'Tepat! "Tidak boleh melebihi" bermaksud kurang daripada atau sama dengan (≤).' } },
      { value: 'B', text: `${priceA}x + ${priceB}y ≥ ${budget}`, feedback: { en: '"≥" means at least, which contradicts "cannot exceed".', ms: '"≥" bermaksud sekurang-kurangnya, bercanggah dengan syarat "tidak melebihi".' } },
      { value: 'C', text: `${priceB}x + ${priceA}y ≤ ${budget}`, feedback: { en: 'Prices for squid and anchovies are inverted.', ms: 'Harga untuk sotong dan ikan bilis tertukar.' } },
      { value: 'D', text: `${priceA}x + ${priceB}y > ${budget}`, feedback: { en: 'Strict greater than violates the maximum budget.', ms: 'Lebih besar secara ketat melanggar had bajet.' } }
    ],
    answer: 'A',
    hints: {
      en: [
        `Cost of squid = ${priceA}x, Cost of anchovies = ${priceB}y.`,
        `Total cost = ${priceA}x + ${priceB}y.`,
        `"Cannot exceed RM ${budget}" is written as ≤ ${budget}.`
      ],
      ms: [
        `Kos sotong = ${priceA}x, Kos ikan bilis = ${priceB}y.`,
        `Jumlah kos = ${priceA}x + ${priceB}y.`,
        `"Tidak boleh melebihi RM ${budget}" ditulis sebagai ≤ ${budget}.`
      ]
    },
    explanation: {
      en: [
        `1. Squid cost: ${priceA}x, Anchovy cost: ${priceB}y.`,
        `2. Total spend: ${priceA}x + ${priceB}y.`,
        `3. Constraint: Cannot exceed budget: ${priceA}x + ${priceB}y ≤ ${budget}.`
      ],
      ms: [
        `1. Kos sotong: ${priceA}x, Kos ikan bilis: ${priceB}y.`,
        `2. Jumlah belanja: ${priceA}x + ${priceB}y.`,
        `3. Had bajet: Tidak boleh melebihi had: ${priceA}x + ${priceB}y ≤ ${budget}.`
      ]
    },
    xp: 100,
    coins: 60,
    skills: ['linear_inequalities', 'algebraic_formulation']
  };
}
