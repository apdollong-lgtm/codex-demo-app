import test from 'node:test';
import assert from 'node:assert/strict';
import { calcWeightedAverageCost, calcYield } from '../services/calculationEngine.js';

test('calcWeightedAverageCost works', () => {
  const r = calcWeightedAverageCost([
    { usedKg: 10, costPerKg: 100 },
    { usedKg: 20, costPerKg: 200 }
  ]);
  assert.equal(r.totalKg, 30);
  assert.equal(r.weightedAvgCost, (10 * 100 + 20 * 200) / 30);
});

test('calcYield works', () => {
  const r = calcYield(100, 87);
  assert.equal(r.lossKg, 13);
  assert.equal(r.yieldPercent, 87);
});
