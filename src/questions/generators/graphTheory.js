export function generateGraphTheory(difficulty = 'medium') {
  // Use Theorem: Sum of degrees = 2 × Number of Edges: \sum d(v) = 2E
  const edges = Math.floor(Math.random() * 8) + 6; // 6 to 13 edges
  const sumDegrees = 2 * edges;

  const qId = `PROC-C05-${Date.now() % 100000}`;

  const wrong1 = edges; // forgot factor of 2
  const wrong2 = sumDegrees + 2;
  const wrong3 = Math.max(2, sumDegrees - 4);

  return {
    id: qId,
    chapter: 5,
    topic: 'network_graph_theory_degree',
    difficulty,
    type: 'multiple_choice',
    mission: 'G2',
    context: 'delivery_connections',
    question: {
      en: `A delivery network connecting stall outlets has ${edges} edges (delivery routes). What is the sum of degrees of all vertices (outlets) in this network?`,
      ms: `Sebuah rangkaian penghantaran yang menghubungkan cawangan gerai mempunyai ${edges} tepi (laluan penghantaran). Apakah jumlah darjah bagi semua bucu (cawangan) dalam rangkaian ini?`
    },
    equation: `∑ d(v) = 2E`,
    options: [
      { value: wrong1, text: `${wrong1}`, feedback: { en: `Each edge connects two vertices and contributes 2 to the sum of degrees, not 1.`, ms: `Setiap tepi menghubungkan dua bucu dan menyumbang 2 darjah, bukan 1.` } },
      { value: sumDegrees, text: `${sumDegrees}`, feedback: { en: `Correct! ∑ d(v) = 2 × E = 2 × ${edges} = ${sumDegrees}.`, ms: `Tepat! ∑ d(v) = 2 × E = 2 × ${edges} = ${sumDegrees}.` } },
      { value: wrong2, text: `${wrong2}`, feedback: { en: `Calculation error in multiplication by 2.`, ms: `Ralat pengiraan dalam pendaraban dengan 2.` } },
      { value: wrong3, text: `${wrong3}`, feedback: { en: `Incorrect degree sum.`, ms: `Jumlah darjah tidak tepat.` } }
    ],
    answer: sumDegrees,
    hints: {
      en: [
        `In graph theory, the Handshaking Theorem states: The sum of degrees of all vertices equals twice the number of edges: ∑ d(v) = 2E.`,
        `Multiply the number of edges (${edges}) by 2.`
      ],
      ms: [
        `Dalam teori graf: Jumlah darjah bagi semua bucu adalah bersamaan dengan dua kali ganda bilangan tepi: ∑ d(v) = 2E.`,
        `Darabkan bilangan tepi (${edges}) dengan 2.`
      ]
    },
    explanation: {
      en: [
        `1. Apply the formula: ∑ d(v) = 2E`,
        `2. Number of edges E = ${edges}`,
        `3. Sum of degrees = 2 × ${edges} = ${sumDegrees}.`
      ],
      ms: [
        `1. Gunakan rumus: ∑ d(v) = 2E`,
        `2. Bilangan tepi E = ${edges}`,
        `3. Jumlah darjah = 2 × ${edges} = ${sumDegrees}.`
      ]
    },
    xp: 100,
    coins: 60,
    skills: ['handshaking_lemma', 'degree_of_vertex']
  };
}
