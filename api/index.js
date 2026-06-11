import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import checkinHandler from './checkin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route: POST /api/checkin
app.post('/api/checkin', async (req, res) => {
  await checkinHandler(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});