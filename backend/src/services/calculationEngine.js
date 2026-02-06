export const calcCostPerKg = (totalCost, weightKg) => (weightKg ? totalCost / weightKg : 0);

export function calcWeightedAverageCost(lines) {
  const totalKg = lines.reduce((acc, l) => acc + Number(l.usedKg || 0), 0);
  const totalCost = lines.reduce((acc, l) => acc + Number(l.usedKg || 0) * Number(l.costPerKg || 0), 0);
  return { totalKg, weightedAvgCost: totalKg ? totalCost / totalKg : 0 };
}

export function calcYield(inputKg, outputKg) {
  const yieldPercent = inputKg ? (outputKg / inputKg) * 100 : 0;
  return {
    yieldPercent,
    lossKg: Math.max(0, inputKg - outputKg)
  };
}

export function calcProductionIssue(recipe, planKettleCount) {
  return {
    requiredDuriangKg: Number(planKettleCount) * 10,
    requiredSugarKg: Number(planKettleCount) * Number(recipe.sugarKgPerKettle || 0),
    requiredStockKg: Number(planKettleCount) * Number(recipe.stockKgPerKettle || 0)
  };
}

export function calcRealProductionCost(inputCost, outputKg) {
  return outputKg ? inputCost / outputKg : 0;
}
