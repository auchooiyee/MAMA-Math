export function generateNumberBases(difficulty = 'easy') {
  // Generate random base 10 number between 9 and 25
  const dec = Math.floor(Math.random() * 16) + 9;
  const bin = dec.toString(2);

  const qId = `PROC-C02-${Date.now() % 100000}`;

  const wrong1 = dec - 2;
  const wrong2 = dec + 2;
  const wrong3 = dec + 1;

  return {
    id: qId,
    chapter: 2,
    topic: 'number_bases_conversion',
    difficulty,
    type: 'multiple_choice',
    mission: 'N1',
    context: 'night_market_price',
    question: {
      en: `An organic spice jar is priced in binary code as ${bin}₂. What is the equivalent price in base 10 (RM)?`,
      ms: `Sebalang rempah organik ditandakan dengan kod binari ${bin}₂. Apakah harga setara dalam asas 10 (RM)?`
    },
    equation: `${bin}₂ → Base 10`,
    options: [
      { value: wrong1, text: `RM ${wrong1}`, feedback: { en: `Close, but check your powers of 2 calculation.`, ms: `Hampir tepat, tetapi periksa kuasa 2 anda.` } },
      { value: dec, text: `RM ${dec}`, feedback: { en: `Correct! ${bin}₂ converted to base 10 is ${dec}.`, ms: `Tepat! ${bin}₂ ditukar kepada asas 10 ialah ${dec}.` } },
      { value: wrong2, text: `RM ${wrong2}`, feedback: { en: `Double-check the ones digit (2⁰).`, ms: `Periksa digit sa (2⁰).` } },
      { value: wrong3, text: `RM ${wrong3}`, feedback: { en: `Slight calculation error.`, ms: `Sedikit kesilapan pengiraan.` } }
    ],
    answer: dec,
    hints: {
      en: [
        `Write down place values for ${bin}₂ starting from right: 1, 2, 4, 8...`,
        `Multiply each binary digit by its respective power of 2.`,
        `Add all non-zero terms together.`
      ],
      ms: [
        `Tuliskan nilai tempat bagi ${bin}₂ bermula dari kanan: 1, 2, 4, 8...`,
        `Darabkan setiap digit binari dengan kuasa 2 masing-masing.`,
        `Jumlahkan semua hasil darab bukan sifar.`
      ]
    },
    explanation: {
      en: [
        `1. Binary digits of ${bin}₂ from right to left correspond to powers of 2.`,
        `2. Sum of active powers of 2 equals ${dec}.`
      ],
      ms: [
        `1. Digit binari ${bin}₂ dari kanan ke kiri mewakili kuasa 2.`,
        `2. Jumlah kuasa 2 yang aktif menghasilkan ${dec}.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['base_2_conversion']
  };
}
