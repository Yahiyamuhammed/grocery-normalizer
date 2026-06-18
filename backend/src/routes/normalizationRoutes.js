const express = require('express');
const router = express.Router();
const multer = require('multer');
const { normalizeCSV } = require('../controllers/normalizationController');

// In-memory file processing via Multer
const upload = multer({ storage: multer.memoryStorage() });

router.post('/normalize', upload.single('file'), normalizeCSV);

module.exports = router;