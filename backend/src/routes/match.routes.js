import { Router } from 'express';
import multer from 'multer';
import { processCsvAndMatch } from '../controllers/match.controller.js';

const router = Router();
// Store the file temporarily in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/matching/upload
router.post('/upload', upload.single('file'), processCsvAndMatch);

export default router;