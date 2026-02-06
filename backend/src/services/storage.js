import sqlite3 from 'sqlite3';
import { v4 as uuid } from 'uuid';
import { demoSeed } from '../data/demoSeed.js';

export class DemoStorage {
  constructor() {
    this.tables = structuredClone(demoSeed);
  }

  list(table) {
    return this.tables[table] || [];
  }

  insert(table, row) {
    const record = { id: row.id || uuid(), ...row };
    this.tables[table].push(record);
    return record;
  }

  upsert(table, row, key = 'id') {
    const idx = this.tables[table].findIndex((r) => r[key] === row[key]);
    if (idx >= 0) {
      this.tables[table][idx] = { ...this.tables[table][idx], ...row };
      return this.tables[table][idx];
    }
    return this.insert(table, row);
  }

  find(table, predicate) {
    return this.tables[table].find(predicate);
  }
}

export class RealStorage {
  constructor(dbFile) {
    this.db = new sqlite3.Database(dbFile);
  }

  async init() {
    const tableNames = [
      'Rawfish_SoT', 'Rawfish_Inventory_Ledger', 'MixingBatch_SoT', 'MX_Inventory_Ledger', 'Recipe_Master',
      'Production_Issue', 'Cooking_Batch', 'Finished_Goods_Ledger', 'Orders', 'Alerts_Log', 'Audit_Log'
    ];
    await Promise.all(tableNames.map((table) => this.run(`CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, payload TEXT NOT NULL)`)));
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function done(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  async list(table) {
    const rows = await this.all(`SELECT payload FROM ${table}`);
    return rows.map((r) => JSON.parse(r.payload));
  }

  async insert(table, row) {
    const record = { id: row.id || uuid(), ...row };
    await this.run(`INSERT INTO ${table}(id,payload) VALUES(?,?)`, [record.id, JSON.stringify(record)]);
    return record;
  }

  async upsert(table, row) {
    const record = { id: row.id || uuid(), ...row };
    await this.run(`INSERT INTO ${table}(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload`, [record.id, JSON.stringify(record)]);
    return record;
  }

  async find(table, predicate) {
    const rows = await this.list(table);
    return rows.find(predicate);
  }
}
