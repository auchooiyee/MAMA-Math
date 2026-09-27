export function generateProbability(difficulty = 'easy') {
  // P(A) = 1/2 or 1/3, P(B) = 1/4 or 1/5
  const denominatorsA = [2, 3, 4];
  const denA = denominatorsA[Math.floor(Math.random() * denominatorsA.length)];
  const denominatorsB = [3, 4, 5];
  const denB = denominatorsB[Math.floor(Math.random() * denominatorsB.length)];

  const combinedDen = denA * denB;
  const correctAns = `1/${combinedDen}`;

  const qId = `PROC-C09-${Date.now() % 100000}`;

  const wrong1 = `1/${denA + denB}`; // added denominators instead of multiplying!
  const wrong2 = `2/${combinedDen}`;
  const wrong3 = `1/${Math.max(2, combinedDen - 2)}`;

  return {
    id: qId,
    chapter: 9,
    topic: 'combined_probability_independent',
    difficulty,
    type: 'multiple_choice',
    mission: 'P2',
    context: 'menu_combo_choice',
    question: {
      en: `A customer chooses a beverage and a snack independently. The probability of choosing Teh Tarik is 1/${denA}, and the probability of choosing Curry Puff is 1/${denB}. What is the probability that the customer chooses both Teh Tarik and Curry Puff?`,
      ms: `Seorang pelanggan memilih minuman dan kuih secara berasingan. Kebarangkalian memilih Teh Tarik ialah 1/${denA}, dan kebarangkalian memilih Karipap ialah 1/${denB}. Apakah kebarangkalian pelanggan itu memilih kedua-dua Teh Tarik dan Karipap?`
    },
    equation: `P(A ∩ B) = P(A) × P(B)`,
    options: [
      { value: wrong1, text: wrong1, feedback: { en: 'Do not add denominators! Multiply probabilities for independent events.', ms: 'Jangan tambah penyebut! Darabkan kebarangkalian bagi peristiwa tak bersandar.' } },
      { value: correctAns, text: correctAns, feedback: { en: `Correct! P = (1/${denA}) × (1/${denB}) = 1/${combinedDen}.`, ms: `Tepat! P = (1/${denA}) × (1/${denB}) = 1/${combinedDen}.` } },
      { value: wrong2, text: wrong2, feedback: { en: 'Check numerator multiplication: 1 × 1 = 1.', ms: 'Periksa pendaraban pengangka: 1 × 1 = 1.' } },
      { value: wrong3, text: wrong3, feedback: { en: 'Calculation error in denominator multiplication.', ms: 'Ralat pendaraban penyebut.' } }
    ],
    answer: correctAns,
    hints: {
      en: [
        `Since the choices are independent events, use the multiplication rule: P(A ∩ B) = P(A) × P(B).`,
        `Multiply the two fractions: (1 / ${denA}) × (1 / ${denB}).`
      ],
      ms: [
        `Oleh sebab pilihan adalah peristiwa tak bersandar, gunakan petua pendaraban: P(A ∩ B) = P(A) × P(B).`,
        `Darabkan kedua-dua pecahan: (1 / ${denA}) × (1 / ${denB}).`
      ]
    },
    explanation: {
      en: [
        `1. P(Teh Tarik) = 1/${denA}`,
        `2. P(Curry Puff) = 1/${denB}`,
        `3. Combined Probability P(Both) = (1/${denA}) × (1/${denB}) = 1/${combinedDen}.`
      ],
      ms: [
        `1. P(Teh Tarik) = 1/${denA}`,
        `2. P(Karipap) = 1/${denB}`,
        `3. Kebarangkalian Bergabung P(Kedua-duanya) = (1/${denA}) × (1/${denB}) = 1/${combinedDen}.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['independent_events', 'combined_probability']
  };
}
