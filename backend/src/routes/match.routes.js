import { Router } from 'express';
import { normalizeProducts } from '../controllers/match.controller.js';

const router = Router();

// POST /api/v1/matching/normalize
router.post('/normalize', normalizeProducts);

export default router;