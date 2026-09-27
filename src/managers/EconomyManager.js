class EconomyManager {
  calculateDishEconomics(recipe, mathAccuracy = 1.0, cookingAccuracy = 1.0) {
    const baseCost = recipe.baseCost || 4.50;
    const basePrice = recipe.sellingPrice || 8.00;

    // Consequence of math/cooking precision on economic output
    // Higher precision cuts wastage (lower cost) and delights customers (higher tips/bonus)
    const costPenalty = mathAccuracy < 0.8 ? (1.0 - mathAccuracy) * 1.5 : 0;
    const actualCost = parseFloat((baseCost + costPenalty).toFixed(2));

    const satisfactionMultiplier = (mathAccuracy * 0.6) + (cookingAccuracy * 0.4);
    let finalPrice = basePrice;
    if (satisfactionMultiplier >= 0.95) {
      finalPrice += 1.50; // High tip bonus
    } else if (satisfactionMultiplier < 0.6) {
      finalPrice = Math.max(actualCost, finalPrice - 1.50); // Discount due to customer dissatisfaction
    }

    const netProfit = parseFloat((finalPrice - actualCost).toFixed(2));

    return {
      revenue: parseFloat(finalPrice.toFixed(2)),
      ingredientCost: actualCost,
      wasteCost: parseFloat(Math.max(0, actualCost - baseCost).toFixed(2)),
      netProfit: netProfit,
      marginPercent: Math.round((netProfit / finalPrice) * 100)
    };
  }
}

export const economyManager = new EconomyManager();
export default economyManager;
