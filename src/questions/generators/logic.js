export function generateLogic(difficulty = 'easy') {
  const premises = [
    {
      pEn: 'the oil is heated',
      qEn: 'the fritters turn golden brown',
      pMs: 'minyak telah dipanaskan',
      qMs: 'cucur menjadi kuning keemasan'
    },
    {
      pEn: 'the dough contains yeast',
      qEn: 'the roti expands during baking',
      pMs: 'doh mengandungi yis',
      qMs: 'roti mengembang semasa dibakar'
    },
    {
      pEn: 'fresh coconut milk is added',
      qEn: 'the curry is creamy',
      pMs: 'santan segar dimasukkan',
      qMs: 'kari menjadi pekat dan berlemak'
    }
  ];

  const pick = premises[Math.floor(Math.random() * premises.length)];
  const qId = `PROC-C03-${Date.now() % 100000}`;

  return {
    id: qId,
    chapter: 3,
    topic: 'logical_reasoning_converse',
    difficulty,
    type: 'multiple_choice',
    mission: 'L4',
    context: 'kitchen_rule',
    question: {
      en: `Given the implication: 'If ${pick.pEn}, then ${pick.qEn}'. What is the CONVERSE of this implication?`,
      ms: `Diberi implikasi: 'Jika ${pick.pMs}, maka ${pick.qMs}'. Apakah AKAS bagi implikasi ini?`
    },
    equation: 'p ⇒ q  →  Converse: q ⇒ p',
    options: [
      {
        value: 'A',
        text: `If ${pick.qEn}, then ${pick.pEn}.`,
        feedback: { en: 'Correct! The converse swaps the antecedent and consequent.', ms: 'Tepat! Akas menukar kedudukan anteseden dan akibat.' }
      },
      {
        value: 'B',
        text: `If not ${pick.pEn}, then not ${pick.qEn}.`,
        feedback: { en: 'This is the inverse (~p ⇒ ~q).', ms: 'Ini ialah songsangan (~p ⇒ ~q).' }
      },
      {
        value: 'C',
        text: `If not ${pick.qEn}, then not ${pick.pEn}.`,
        feedback: { en: 'This is the contrapositive (~q ⇒ ~p).', ms: 'Ini ialah kontrapositif (~q ⇒ ~p).' }
      },
      {
        value: 'D',
        text: `${pick.pEn} if and only if ${pick.qEn}.`,
        feedback: { en: 'This is an equivalence statement.', ms: 'Ini ialah pernyataan jika dan hanya jika.' }
      }
    ],
    answer: 'A',
    hints: {
      en: [
        'An implication has the form: If p, then q.',
        'The converse simply reverses direction: If q, then p.'
      ],
      ms: [
        'Implikasi berbentuk: Jika p, maka q.',
        'Akas menyongsangkan arah pernyataan: Jika q, maka p.'
      ]
    },
    explanation: {
      en: [
        `1. Original: If p (${pick.pEn}), then q (${pick.qEn}).`,
        `2. Converse (q ⇒ p): 'If ${pick.qEn}, then ${pick.pEn}'.`
      ],
      ms: [
        `1. Asal: Jika p (${pick.pMs}), maka q (${pick.qMs}).`,
        `2. Akas (q ⇒ p): 'Jika ${pick.qMs}, maka ${pick.pMs}'.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['converse', 'implication_analysis']
  };
}
