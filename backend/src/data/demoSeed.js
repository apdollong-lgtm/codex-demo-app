const now = new Date();
const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

export const demoSeed = {
  Rawfish_SoT: [
    {
      id: 'RF-001',
      lotCode: 'NF-LC-240501-A',
      receiveDate: addDays(-10),
      species: 'Tuna',
      grade: 'A',
      bin: 'B1',
      weightKg: 180,
      totalCost: 45000,
      costPerKg: 250,
      expiryDate: addDays(3)
    }
  ],
  Rawfish_Inventory_Ledger: [
    { id: 'RFL-1', date: addDays(-10), lotCode: 'NF-LC-240501-A', eventType: 'IN', qtyKg: 180, balanceKg: 180 }
  ],
  MixingBatch_SoT: [
    {
      id: 'MX-001',
      mxLotCode: 'MX-LC-240502-01',
      mixDate: addDays(-8),
      lines: [{ rawfishLotCode: 'NF-LC-240501-A', usedKg: 120, costPerKg: 250 }],
      totalUsedKg: 120,
      weightedAvgCost: 250,
      yieldPercent: 94,
      lossKg: 7.2,
      newCostPerKg: 265.96
    }
  ],
  MX_Inventory_Ledger: [
    { id: 'MXL-1', date: addDays(-8), mxLotCode: 'MX-LC-240502-01', eventType: 'IN', qtyKg: 112.8, balanceKg: 112.8 }
  ],
  Recipe_Master: [
    { id: 'RC-001', recipeCode: 'AB-01', productName: 'Spicy Tuna Cube', durationPerKettleMin: 30, sugarKgPerKettle: 2, stockKgPerKettle: 3 }
  ],
  Production_Issue: [
    {
      id: 'PI-001',
      date: addDays(-3),
      recipeCode: 'AB-01',
      planKettleCount: 2,
      requiredDuriangKg: 20,
      requiredSugarKg: 4,
      requiredStockKg: 6,
      issuedMxLotCode: 'MX-LC-240502-01',
      issuedQtyKg: 20
    }
  ],
  Cooking_Batch: [
    {
      id: 'CB-001',
      date: addDays(-2),
      piNo: 'PI-001',
      roundNo: 1,
      kettleNo: 'K1',
      inputKg: 20,
      outputKg: 17.4,
      yieldPercent: 87,
      lossKg: 2.6,
      realCostPerKg: 312
    }
  ],
  Finished_Goods_Ledger: [
    { id: 'FG-1', date: addDays(-2), productCode: 'AB-01', eventType: 'IN', qtyKg: 17.4, balanceKg: 17.4, reference: 'CB-001' },
    { id: 'FG-2', date: addDays(-1), productCode: 'AB-01', eventType: 'OUT', qtyKg: 5, balanceKg: 12.4, reference: 'SO-001' }
  ],
  Orders: [
    { id: 'SO-001', date: addDays(-1), customer: 'FreshMart', items: [{ productCode: 'AB-01', qtyKg: 5 }], status: 'fulfilled' }
  ],
  Alerts_Log: [
    { id: 'AL-1', date: addDays(-1), type: 'LOW_STOCK', level: 'warning', message: 'AB-01 stock below threshold 15kg', status: 'open' }
  ],
  Audit_Log: []
};
