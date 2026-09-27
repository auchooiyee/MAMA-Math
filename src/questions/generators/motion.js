export function generateMotion(difficulty = 'medium') {
  // Generate clean integer speed: Distance D, Time in minutes Tmin => T_hours
  const speed = (Math.floor(Math.random() * 5) + 3) * 10; // 30, 40, 50, 60, 70 km/h
  const timeMinutes = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
  const timeHours = timeMinutes / 60;
  const distance = Math.round(speed * timeHours);

  const qId = `PROC-C07-${Date.now() % 100000}`;

  const wrong1 = speed + 10;
  const wrong2 = Math.max(10, speed - 15);
  const wrong3 = Math.round(distance / timeMinutes); // forgot to convert minutes to hours!

  return {
    id: qId,
    chapter: 7,
    topic: 'motion_graphs_speed',
    difficulty,
    type: 'multiple_choice',
    mission: 'M2',
    context: 'delivery_dash',
    question: {
      en: `A delivery rider covers a total distance of ${distance} km in ${timeMinutes} minutes according to the distance-time tracking graph. Calculate the average speed of the rider in km/h.`,
      ms: `Seorang penunggang penghantar meliputi jarak keseluruhan ${distance} km dalam masa ${timeMinutes} minit berdasarkan graf penjejakan jarak-masa. Hitung laju purata penunggang dalam km/j.`
    },
    equation: `Average Speed = Distance / Time (in hours)`,
    options: [
      { value: wrong1, text: `${wrong1} km/h`, feedback: { en: 'Slight overestimation of speed.', ms: 'Nilai laju terkurang tepat.' } },
      { value: speed, text: `${speed} km/h`, feedback: { en: `Correct! ${distance} km ÷ (${timeMinutes}/60 h) = ${speed} km/h.`, ms: `Tepat! ${distance} km ÷ (${timeMinutes}/60 j) = ${speed} km/j.` } },
      { value: wrong2, text: `${wrong2} km/h`, feedback: { en: 'Underestimated speed.', ms: 'Nilai laju terkurang.' } },
      { value: wrong3, text: `${wrong3} km/h`, feedback: { en: 'Did you forget to convert minutes into hours (divide by 60)?', ms: 'Adakah anda terlupa menukar minit kepada jam (bahagi 60)?' } }
    ],
    answer: speed,
    hints: {
      en: [
        `Convert time from minutes to hours: ${timeMinutes} minutes = ${timeMinutes} / 60 = ${timeHours} hours.`,
        `Average speed = Total Distance ÷ Total Time = ${distance} ÷ ${timeHours}.`
      ],
      ms: [
        `Tukar masa dari minit ke jam: ${timeMinutes} minit = ${timeMinutes} / 60 = ${timeHours} jam.`,
        `Laju purata = Jumlah Jarak ÷ Jumlah Masa = ${distance} ÷ ${timeHours}.`
      ]
    },
    explanation: {
      en: [
        `1. Distance = ${distance} km`,
        `2. Time = ${timeMinutes} min = ${timeHours} hours`,
        `3. Average Speed = ${distance} / ${timeHours} = ${speed} km/h.`
      ],
      ms: [
        `1. Jarak = ${distance} km`,
        `2. Masa = ${timeMinutes} minit = ${timeHours} jam`,
        `3. Laju Purata = ${distance} / ${timeHours} = ${speed} km/j.`
      ]
    },
    xp: 100,
    coins: 60,
    skills: ['average_speed', 'unit_conversion']
  };
}
