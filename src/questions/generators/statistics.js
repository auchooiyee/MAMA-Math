export function generateStatistics(difficulty = 'easy') {
  // Generate 5 sorted distinct numbers
  const base = Math.floor(Math.random() * 10) + 5;
  const numbers = [
    base,
    base + Math.floor(Math.random() * 3) + 2,
    base + Math.floor(Math.random() * 3) + 6,
    base + Math.floor(Math.random() * 3) + 10,
    base + Math.floor(Math.random() * 4) + 14
  ];

  const minVal = numbers[0];
  const maxVal = numbers[numbers.length - 1];
  const range = maxVal - minVal;

  const qId = `PROC-C08-${Date.now() % 100000}`;

  const wrong1 = range + 3;
  const wrong2 = Math.max(1, range - 2);
  const wrong3 = maxVal; // confused range with maximum value

  return {
    id: qId,
    chapter: 8,
    topic: 'dispersion_range',
    difficulty,
    type: 'multiple_choice',
    mission: 'D1',
    context: 'customer_waiting_times',
    question: {
      en: `The waiting times (in minutes) for 5 customers at the food stall are recorded as: ${numbers.join(', ')}. Calculate the range of this dataset.`,
      ms: `Masa menunggu (dalam minit) bagi 5 pelanggan di gerai makanan direkodkan seperti berikut: ${numbers.join(', ')}. Hitung julat bagi set data ini.`
    },
    equation: `Range = Maximum Value - Minimum Value`,
    options: [
      { value: wrong2, text: `${wrong2} minutes`, feedback: { en: 'Slight calculation mistake in subtraction.', ms: 'Sedikit ralat pengiraan dalam penolakan.' } },
      { value: range, text: `${range} minutes`, feedback: { en: `Correct! Range = ${maxVal} - ${minVal} = ${range} minutes.`, ms: `Tepat! Julat = ${maxVal} - ${minVal} = ${range} minit.` } },
      { value: wrong1, text: `${wrong1} minutes`, feedback: { en: 'Check your minimum and maximum values.', ms: 'Periksa nilai minimum dan maksimum anda.' } },
      { value: wrong3, text: `${wrong3} minutes`, feedback: { en: 'This is the maximum value, not the range.', ms: 'Ini ialah nilai maksimum, bukan julat.' } }
    ],
    answer: range,
    hints: {
      en: [
        `Identify the largest value (${maxVal}) and the smallest value (${minVal}).`,
        `Calculate: Range = Largest Value - Smallest Value.`
      ],
      ms: [
        `Kenal pasti nilai terbesar (${maxVal}) dan nilai terkecil (${minVal}).`,
        `Kira: Julat = Nilai Terbesar - Nilai Terkecil.`
      ]
    },
    explanation: {
      en: [
        `1. Minimum value = ${minVal}`,
        `2. Maximum value = ${maxVal}`,
        `3. Range = ${maxVal} - ${minVal} = ${range} minutes.`
      ],
      ms: [
        `1. Nilai minimum = ${minVal}`,
        `2. Nilai maksimum = ${maxVal}`,
        `3. Julat = ${maxVal} - ${minVal} = ${range} minit.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['range_calculation', 'ungrouped_data']
  };
}
