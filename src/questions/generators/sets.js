export function generateSets(difficulty = 'medium') {
  // Survey of N customers
  const nA = Math.floor(Math.random() * 15) + 25; // like dish A: 25 to 39
  const nB = Math.floor(Math.random() * 15) + 20; // like dish B: 20 to 34
  const nBoth = Math.floor(Math.random() * 8) + 10; // like both: 10 to 17

  const nUnion = nA + nB - nBoth;
  const nNeither = Math.floor(Math.random() * 6) + 4; // 4 to 9
  const totalUniversal = nUnion + nNeither;

  const qId = `PROC-C04-${Date.now() % 100000}`;

  const wrong1 = nNeither + 5;
  const wrong2 = Math.max(1, nNeither - 2);
  const wrong3 = totalUniversal - nA;

  return {
    id: qId,
    chapter: 4,
    topic: 'set_operations',
    difficulty,
    type: 'multiple_choice',
    mission: 'S6',
    context: 'customer_preferences',
    question: {
      en: `Out of ${totalUniversal} customers surveyed at Mak Cik Salmah's Gerai, ${nA} like Sambal Sotong (Set S) and ${nB} like Fried Chicken (Set C). If ${nBoth} customers like both, how many customers like NEITHER dish?`,
      ms: `Daripada ${totalUniversal} pelanggan yang dikaji selidik di Gerai Mak Cik Salmah, ${nA} orang menggemari Sambal Sotong (Set S) dan ${nB} orang menggemari Ayam Goreng (Set C). Jika ${nBoth} orang menggemari kedua-duanya, berapakah bilangan pelanggan yang TIDAK menggemari mana-mana hidangan tersebut?`
    },
    equation: `n(S ∪ C) = n(S) + n(C) - n(S ∩ C)`,
    options: [
      { value: wrong1, text: `${wrong1} customers`, feedback: { en: `Did you add extra without subtracting the intersection?`, ms: `Adakah anda terlebih tambah tanpa tolak persilangan?` } },
      { value: nNeither, text: `${nNeither} customers`, feedback: { en: `Correct! n(S ∪ C) = ${nA} + ${nB} - ${nBoth} = ${nUnion}. Neither = ${totalUniversal} - ${nUnion} = ${nNeither}.`, ms: `Tepat! n(S ∪ C) = ${nA} + ${nB} - ${nBoth} = ${nUnion}. Baki = ${totalUniversal} - ${nUnion} = ${nNeither}.` } },
      { value: wrong2, text: `${wrong2} customers`, feedback: { en: `Calculation error in set union subtraction.`, ms: `Ralat pengiraan dalam penolakan kesatuan set.` } },
      { value: wrong3, text: `${wrong3} customers`, feedback: { en: `This is only the complement of Set S, not of (S ∪ C).`, ms: `Ini hanya pelengkap bagi Set S, bukan pelengkap (S ∪ C).` } }
    ],
    answer: nNeither,
    hints: {
      en: [
        `First find customers who like at least one dish: n(S ∪ C) = ${nA} + ${nB} - ${nBoth}.`,
        `Subtract that result from the universal set total (${totalUniversal}).`
      ],
      ms: [
        `Cari bilangan yang gemar sekurang-kurangnya satu hidangan: n(S ∪ C) = ${nA} + ${nB} - ${nBoth}.`,
        `Tolak jumlah tersebut daripada set semesta (${totalUniversal}).`
      ]
    },
    explanation: {
      en: [
        `1. n(S ∪ C) = ${nA} + ${nB} - ${nBoth} = ${nUnion}`,
        `2. Neither = ${totalUniversal} - ${nUnion} = ${nNeither} customers.`
      ],
      ms: [
        `1. n(S ∪ C) = ${nA} + ${nB} - ${nBoth} = ${nUnion}`,
        `2. Tidak menggemari kedua-duanya = ${totalUniversal} - ${nUnion} = ${nNeither} orang.`
      ]
    },
    xp: 100,
    coins: 60,
    skills: ['set_union', 'set_complement']
  };
}
