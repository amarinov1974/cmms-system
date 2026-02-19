/**
 * Asset routes - lookup asset by ID (for ticket submit screen)
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { prisma } from '../../config/database.js';

const router = Router();
router.use(requireAuth);

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { id: true, description: true, storeId: true },
    });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    res.json(asset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Asset lookup failed';
    res.status(400).json({ error: message });
  }
});

export default router;
