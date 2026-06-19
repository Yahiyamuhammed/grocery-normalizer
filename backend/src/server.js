import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import matchRoutes from './routes/match.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing JSON bodies

// Routes
app.use('/api/v1/matching', matchRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});