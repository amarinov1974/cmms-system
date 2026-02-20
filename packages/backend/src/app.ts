/**
 * Express App Setup
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './services/auth/routes.js';
import ticketRoutes from './services/ticket/routes.js';
import qrRoutes from './services/qr/routes.js';
import workOrderRoutes from './services/work-order/routes.js';
import invoiceBatchRoutes from './services/invoice-batch/routes.js';
import storeRoutes from './services/store/routes.js';
import assetRoutes from './services/asset/routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiKeyMiddleware } from './middleware/api-key.middleware.js';
import { prisma } from './config/database.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Public health endpoints (no API key required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API key required for all routes below
app.use(apiKeyMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/invoice-batches', invoiceBatchRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/assets', assetRoutes);

app.post('/api/demo/delete-all-tickets', async (_req, res) => {
  try {
    const wo = await prisma.workOrder.deleteMany({});
    const tickets = await prisma.ticket.deleteMany({});
    res.json({
      success: true,
      deleted: { workOrders: wo.count, tickets: tickets.count },
    });
  } catch (error) {
    console.error('Delete all tickets error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete',
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorMiddleware);

export { app };
