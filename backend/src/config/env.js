import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mode: process.env.APP_MODE || 'demo',
  dbFile: process.env.DB_FILE || './backend/data/production.db'
};
