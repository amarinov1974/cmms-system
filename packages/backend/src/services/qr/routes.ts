/**
 * QR Routes (Section 18 — Store Manager only)
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { InternalRoles } from '../../types/roles.js';
import { qrService } from './qr-service.js';
import type { GenerateQRRequest } from './types.js';

const router = Router();
router.use(requireAuth);

router.post('/generate', requireRole(InternalRoles.STORE_MANAGER), async (req, res) => {
  try {
    const request = req.body as GenerateQRRequest;
    const session = req.session!;
    const qr = await qrService.generateQR(
      request,
      session.userId,
      session.role
    );
    res.json(qr);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generate QR failed';
    res.status(400).json({ error: message });
  }
});

export default router;
