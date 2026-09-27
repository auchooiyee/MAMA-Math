export function generateQuadratic(difficulty = 'easy') {
  // Generate random integer root r between 3 and 12, and offset k between 2 and 6
  // Equation: x(x + k) = A => x² + kx - A = 0 where A = r(r + k)
  const r = Math.floor(Math.random() * 8) + 4; // root (correct answer)
  const k = Math.floor(Math.random() * 5) + 2; // length offset
  const area = r * (r + k);

  const qId = `PROC-C01-${Date.now() % 100000}`;

  const wrong1 = r + k;
  const wrong2 = Math.max(1, r - 2);
  const wrong3 = r * 2;

  return {
    id: qId,
    chapter: 1,
    topic: 'quadratic_equation',
    difficulty,
    type: 'multiple_choice',
    mission: 'Q1',
    context: 'tray_dimensions',
    question: {
      en: `A rectangular baking tray has an area of ${area} cm². Its width is x cm and its length is (x + ${k}) cm. Find the value of x.`,
      ms: `Sebuah dulang pembakar mempunyai luas ${area} cm². Lebarnya ialah x cm dan panjangnya ialah (x + ${k}) cm. Cari nilai x.`
    },
    equation: `x(x + ${k}) = ${area}`,
    options: [
      { value: wrong2, text: `x = ${wrong2} cm`, feedback: { en: `Area would be ${wrong2}(${wrong2 + k}) = ${wrong2 * (wrong2 + k)} cm², not ${area}.`, ms: `Luas ialah ${wrong2}(${wrong2 + k}) = ${wrong2 * (wrong2 + k)} cm², bukan ${area}.` } },
      { value: r, text: `x = ${r} cm`, feedback: { en: `Correct! ${r} × (${r} + ${k}) = ${area} cm².`, ms: `Tepat! ${r} × (${r} + ${k}) = ${area} cm².` } },
      { value: wrong1, text: `x = ${wrong1} cm`, feedback: { en: `This would be length (x + ${k}), not width x.`, ms: `Ini adalah panjang (x + ${k}), bukan lebar x.` } },
      { value: wrong3, text: `x = ${wrong3} cm`, feedback: { en: `Check your quadratic factorisation.`, ms: `Periksa pemfaktoran kuadratik anda.` } }
    ],
    answer: r,
    hints: {
      en: [
        `Formulate area: x(x + ${k}) = ${area}.`,
        `Expand into standard form: x² + ${k}x - ${area} = 0.`,
        `Factorise: (x + ${r + k})(x - ${r}) = 0. Since x > 0, choose the positive root.`
      ],
      ms: [
        `Bina formula luas: x(x + ${k}) = ${area}.`,
        `Kembangkan kepada bentuk am: x² + ${k}x - ${area} = 0.`,
        `Faktorkan: (x + ${r + k})(x - ${r}) = 0. Oleh sebab x > 0, pilih punca positif.`
      ]
    },
    explanation: {
      en: [
        `1. Area = Width × Length = x(x + ${k}) = ${area}`,
        `2. x² + ${k}x - ${area} = 0`,
        `3. (x + ${r + k})(x - ${r}) = 0`,
        `4. x = -${r + k} (rejected, length must be > 0) or x = ${r}`,
        `5. Answer: x = ${r} cm.`
      ],
      ms: [
        `1. Luas = Lebar × Panjang = x(x + ${k}) = ${area}`,
        `2. x² + ${k}x - ${area} = 0`,
        `3. (x + ${r + k})(x - ${r}) = 0`,
        `4. x = -${r + k} (ditolak kerana ukuran > 0) atau x = ${r}`,
        `5. Jawapan: x = ${r} cm.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['factorisation', 'quadratic_problem_solving']
  };
}
