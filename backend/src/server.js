import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { DemoStorage, RealStorage } from './services/storage.js';
import { ProductionService } from './services/productionService.js';
import { buildApiRouter } from './routes/api.js';

const app = express();
app.use(cors());
app.use(express.json());

const boot = async () => {
  const storage = env.mode === 'real' ? new RealStorage(env.dbFile) : new DemoStorage();
  if (env.mode === 'real') {
    await storage.init();
  }

  const service = new ProductionService(storage);
  app.get('/health', (_req, res) => res.json({ ok: true, mode: env.mode }));
  app.use('/api', buildApiRouter(service));

  app.listen(env.port, () => {
    console.log(`SoT production backend running on port ${env.port} (${env.mode} mode)`);
  });
};

boot();
