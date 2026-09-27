export function generateFinance(difficulty = 'easy') {
  const income = (Math.floor(Math.random() * 8) + 8) * 1000; // RM 8,000 to 15,000
  const fixedExpenses = (Math.floor(Math.random() * 4) + 2) * 1000; // RM 2,000 to 5,000
  const variableExpenses = (Math.floor(Math.random() * 4) + 3) * 1000; // RM 3,000 to 6,000

  const totalExpenses = fixedExpenses + variableExpenses;
  const netCashFlow = income - totalExpenses;

  const qId = `PROC-C10-${Date.now() % 100000}`;

  const wrong1 = netCashFlow + 1000;
  const wrong2 = -netCashFlow;
  const wrong3 = income - fixedExpenses; // forgot variable expenses

  return {
    id: qId,
    chapter: 10,
    topic: 'consumer_math_cash_flow',
    difficulty,
    type: 'multiple_choice',
    mission: 'F8',
    context: 'restaurant_monthly_budget',
    question: {
      en: `A restaurant records monthly sales income of RM ${income.toLocaleString()}. Its fixed expenses are RM ${fixedExpenses.toLocaleString()} and variable expenses are RM ${variableExpenses.toLocaleString()}. What is the net cash flow for the month?`,
      ms: `Sebuah restoran merekodkan pendapatan jualan bulanan sebanyak RM ${income.toLocaleString()}. Perbelanjaan tetapnya ialah RM ${fixedExpenses.toLocaleString()} dan perbelanjaan boleh ubah ialah RM ${variableExpenses.toLocaleString()}. Apakah aliran tunai bersih bagi bulan tersebut?`
    },
    equation: `Net Cash Flow = Total Income - (Fixed Expenses + Variable Expenses)`,
    options: [
      { value: wrong1, text: `RM ${wrong1.toLocaleString()}`, feedback: { en: 'Slight miscalculation in subtraction.', ms: 'Sedikit kesilapan tolak.' } },
      { value: netCashFlow, text: `RM ${netCashFlow.toLocaleString()}`, feedback: { en: `Correct! ${income} - (${fixedExpenses} + ${variableExpenses}) = RM ${netCashFlow}.`, ms: `Tepat! ${income} - (${fixedExpenses} + ${variableExpenses}) = RM ${netCashFlow}.` } },
      { value: wrong2, text: `- RM ${Math.abs(wrong2).toLocaleString()}`, feedback: { en: 'Income exceeds expenses, so cash flow is positive (surplus), not negative (deficit).', ms: 'Pendapatan melebihi perbelanjaan, aliran tunai adalah positif (lebihan).' } },
      { value: wrong3, text: `RM ${wrong3.toLocaleString()}`, feedback: { en: 'Remember to deduct variable expenses too!', ms: 'Ingat untuk tolak perbelanjaan boleh ubah juga!' } }
    ],
    answer: netCashFlow,
    hints: {
      en: [
        `First find Total Expenses = Fixed Expenses (RM ${fixedExpenses.toLocaleString()}) + Variable Expenses (RM ${variableExpenses.toLocaleString()}).`,
        `Net Cash Flow = Total Income (RM ${income.toLocaleString()}) - Total Expenses.`
      ],
      ms: [
        `Mula-mula cari Jumlah Perbelanjaan = Perbelanjaan Tetap (RM ${fixedExpenses.toLocaleString()}) + Perbelanjaan Boleh Ubah (RM ${variableExpenses.toLocaleString()}).`,
        `Aliran Tunai Bersih = Jumlah Pendapatan (RM ${income.toLocaleString()}) - Jumlah Perbelanjaan.`
      ]
    },
    explanation: {
      en: [
        `1. Total Expenses = RM ${fixedExpenses.toLocaleString()} + RM ${variableExpenses.toLocaleString()} = RM ${totalExpenses.toLocaleString()}`,
        `2. Net Cash Flow = RM ${income.toLocaleString()} - RM ${totalExpenses.toLocaleString()} = RM ${netCashFlow.toLocaleString()}.`
      ],
      ms: [
        `1. Jumlah Perbelanjaan = RM ${fixedExpenses.toLocaleString()} + RM ${variableExpenses.toLocaleString()} = RM ${totalExpenses.toLocaleString()}`,
        `2. Aliran Tunai Bersih = RM ${income.toLocaleString()} - RM ${totalExpenses.toLocaleString()} = RM ${netCashFlow.toLocaleString()}.`
      ]
    },
    xp: 50,
    coins: 30,
    skills: ['net_cash_flow', 'budgeting']
  };
}
