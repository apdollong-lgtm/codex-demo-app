import { Router } from 'express';

export const buildApiRouter = (service) => {
  const router = Router();

  router.get('/tables/:name', async (req, res) => {
    const data = await service.listTable(req.params.name);
    res.json(data);
  });

  router.get('/dashboard', async (_req, res) => {
    const data = await service.dashboard();
    res.json(data);
  });

  router.post('/rawfish', async (req, res) => {
    const row = await service.receiveRawfish(req.body);
    res.status(201).json(row);
  });

  router.post('/recipes', async (req, res) => {
    const row = await service.seedRecipe(req.body);
    res.status(201).json(row);
  });

  router.post('/mixing-batches', async (req, res) => {
    const row = await service.createMixingBatch(req.body);
    res.status(201).json(row);
  });

  router.post('/production-issues', async (req, res) => {
    const row = await service.createProductionIssue(req.body);
    res.status(201).json(row);
  });

  router.post('/cooking-batches', async (req, res) => {
    const row = await service.createCookingBatch(req.body);
    res.status(201).json(row);
  });

  router.post('/orders', async (req, res) => {
    const row = await service.createOrder(req.body);
    res.status(201).json(row);
  });

  router.post('/alerts/refresh', async (_req, res) => {
    const alerts = await service.refreshAlerts();
    res.json(alerts);
  });

  router.get('/reports/export.xlsx', async (_req, res) => {
    const buffer = await service.exportExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=production_report.xlsx');
    res.send(Buffer.from(buffer));
  });

  return router;
};
