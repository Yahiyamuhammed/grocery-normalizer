const express = require('express');
const cors = require('cors');
require('dotenv').config();

const normalizationRoutes = require('./routes/normalizationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', normalizationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Prototype Server running on http://localhost:${PORT}`);
});