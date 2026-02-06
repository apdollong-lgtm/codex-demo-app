import ExcelJS from 'exceljs';
import { v4 as uuid } from 'uuid';
import {
  calcCostPerKg,
  calcProductionIssue,
  calcRealProductionCost,
  calcWeightedAverageCost,
  calcYield
} from './calculationEngine.js';

const TABLES = {
  rawfish: 'Rawfish_SoT',
  rawfishLedger: 'Rawfish_Inventory_Ledger',
  mixing: 'MixingBatch_SoT',
  mxLedger: 'MX_Inventory_Ledger',
  recipe: 'Recipe_Master',
  issue: 'Production_Issue',
  cooking: 'Cooking_Batch',
  fg: 'Finished_Goods_Ledger',
  orders: 'Orders',
  alerts: 'Alerts_Log',
  audit: 'Audit_Log'
};

export class ProductionService {
  constructor(storage) {
    this.storage = storage;
  }

  async audit(action, payload) {
    return this.storage.insert(TABLES.audit, { id: uuid(), timestamp: new Date().toISOString(), action, payload });
  }

  getBalance(ledger, key, value) {
    const entries = ledger.filter((e) => e[key] === value);
    return entries.length ? entries[entries.length - 1].balanceKg : 0;
  }

  async receiveRawfish(input) {
    const costPerKg = calcCostPerKg(input.totalCost, input.weightKg);
    const row = await this.storage.insert(TABLES.rawfish, { ...input, costPerKg });
    const ledger = await this.storage.list(TABLES.rawfishLedger);
    const balanceKg = this.getBalance(ledger, 'lotCode', row.lotCode) + Number(row.weightKg);
    await this.storage.insert(TABLES.rawfishLedger, {
      date: row.receiveDate,
      lotCode: row.lotCode,
      eventType: 'IN',
      qtyKg: row.weightKg,
      balanceKg
    });
    await this.audit('RAWFISH_RECEIVED', row);
    return row;
  }

  async createMixingBatch(payload) {
    const calc = calcWeightedAverageCost(payload.lines);
    const yieldRes = calcYield(calc.totalKg, payload.outputKg);
    const newCostPerKg = calcCostPerKg(calc.totalKg * calc.weightedAvgCost, payload.outputKg);

    const row = await this.storage.insert(TABLES.mixing, {
      ...payload,
      totalUsedKg: calc.totalKg,
      weightedAvgCost: calc.weightedAvgCost,
      yieldPercent: yieldRes.yieldPercent,
      lossKg: yieldRes.lossKg,
      newCostPerKg
    });

    const ledger = await this.storage.list(TABLES.mxLedger);
    const balanceKg = this.getBalance(ledger, 'mxLotCode', row.mxLotCode) + Number(payload.outputKg);
    await this.storage.insert(TABLES.mxLedger, {
      date: payload.mixDate,
      mxLotCode: row.mxLotCode,
      eventType: 'IN',
      qtyKg: payload.outputKg,
      balanceKg,
      reference: row.id
    });

    await this.audit('MIXING_BATCH_CREATED', row);
    return row;
  }

  async createProductionIssue(payload) {
    const recipe = await this.storage.find(TABLES.recipe, (r) => r.recipeCode === payload.recipeCode);
    const calculated = calcProductionIssue(recipe, payload.planKettleCount);
    const row = await this.storage.insert(TABLES.issue, { ...payload, ...calculated });

    const ledger = await this.storage.list(TABLES.mxLedger);
    const currentBalance = this.getBalance(ledger, 'mxLotCode', row.issuedMxLotCode);
    await this.storage.insert(TABLES.mxLedger, {
      date: payload.date,
      mxLotCode: row.issuedMxLotCode,
      eventType: 'OUT',
      qtyKg: row.issuedQtyKg,
      balanceKg: currentBalance - Number(row.issuedQtyKg),
      reference: row.id
    });

    await this.audit('PRODUCTION_ISSUE_CREATED', row);
    return row;
  }

  async createCookingBatch(payload) {
    const issue = await this.storage.find(TABLES.issue, (p) => p.id === payload.piNo);
    const mxBatch = await this.storage.find(TABLES.mixing, (m) => m.mxLotCode === issue.issuedMxLotCode);
    const yieldInfo = calcYield(payload.inputKg, payload.outputKg);
    const realCostPerKg = calcRealProductionCost(Number(payload.inputKg) * Number(mxBatch.newCostPerKg), payload.outputKg);

    const row = await this.storage.insert(TABLES.cooking, { ...payload, ...yieldInfo, realCostPerKg });

    const fgLedger = await this.storage.list(TABLES.fg);
    const currentBalance = this.getBalance(fgLedger, 'productCode', issue.recipeCode);
    await this.storage.insert(TABLES.fg, {
      date: payload.date,
      productCode: issue.recipeCode,
      eventType: 'IN',
      qtyKg: payload.outputKg,
      balanceKg: currentBalance + Number(payload.outputKg),
      reference: row.id
    });

    if (yieldInfo.yieldPercent < 85) {
      await this.storage.insert(TABLES.alerts, {
        date: new Date().toISOString(),
        type: 'ABNORMAL_YIELD',
        level: 'critical',
        message: `Batch ${row.id} yield ${yieldInfo.yieldPercent.toFixed(2)}%`,
        status: 'open'
      });
    }

    await this.audit('COOKING_BATCH_CREATED', row);
    return row;
  }

  async createOrder(payload) {
    const row = await this.storage.insert(TABLES.orders, payload);
    const fgLedger = await this.storage.list(TABLES.fg);
    for (const item of payload.items) {
      const balance = this.getBalance(fgLedger, 'productCode', item.productCode);
      await this.storage.insert(TABLES.fg, {
        date: payload.date,
        productCode: item.productCode,
        eventType: 'OUT',
        qtyKg: item.qtyKg,
        balanceKg: balance - Number(item.qtyKg),
        reference: row.id
      });
    }
    await this.audit('ORDER_CREATED', row);
    return row;
  }

  async refreshAlerts() {
    const rawfish = await this.storage.list(TABLES.rawfish);
    const fg = await this.storage.list(TABLES.fg);
    const alerts = [];
    const now = new Date();

    for (const lot of rawfish) {
      if ((new Date(lot.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 2) {
        alerts.push({ type: 'EXPIRY', level: 'warning', message: `Lot ${lot.lotCode} expires soon`, status: 'open' });
      }
    }

    const productBalances = fg.reduce((acc, row) => {
      acc[row.productCode] = row.balanceKg;
      return acc;
    }, {});

    Object.entries(productBalances).forEach(([productCode, balance]) => {
      if (balance < 10) alerts.push({ type: 'LOW_STOCK', level: 'warning', message: `${productCode} below 10kg`, status: 'open' });
    });

    for (const alert of alerts) {
      await this.storage.insert(TABLES.alerts, { date: new Date().toISOString(), ...alert });
    }
    return alerts;
  }

  async dashboard() {
    const [mxLedger, fg, cooking, alerts, recipes] = await Promise.all([
      this.storage.list(TABLES.mxLedger),
      this.storage.list(TABLES.fg),
      this.storage.list(TABLES.cooking),
      this.storage.list(TABLES.alerts),
      this.storage.list(TABLES.recipe)
    ]);

    const inventoryByProcess = {
      mx: mxLedger.reduce((sum, r) => sum + (r.eventType === 'IN' ? r.qtyKg : -r.qtyKg), 0),
      finishedGoods: fg.reduce((sum, r) => sum + (r.eventType === 'IN' ? r.qtyKg : -r.qtyKg), 0)
    };

    return {
      inventoryByProcess,
      realCostPerProduct: cooking.map((c) => ({ batchId: c.id, costPerKg: c.realCostPerKg })),
      yieldTrend: cooking.map((c) => ({ date: c.date, yieldPercent: c.yieldPercent })),
      lossAnalysis: cooking.map((c) => ({ batchId: c.id, lossKg: c.lossKg })),
      overdueAlerts: alerts.filter((a) => a.status === 'open'),
      recipes
    };
  }

  async exportExcel() {
    const workbook = new ExcelJS.Workbook();
    for (const [name, table] of Object.entries(TABLES)) {
      const data = await this.storage.list(table);
      const sheet = workbook.addWorksheet(name);
      if (!data.length) continue;
      sheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      data.forEach((row) => sheet.addRow(row));
    }
    return workbook.xlsx.writeBuffer();
  }

  async listTable(name) {
    return this.storage.list(name);
  }

  async seedRecipe(data) {
    return this.storage.insert(TABLES.recipe, data);
  }
}
