import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import checkinHandler from './checkin.js';
import cohortHandler from './cohort.js';
import summaryHandler from './summary.js';
import authHandler from './auth.js';
import resetFeedbackHandler from './reset-feedback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route: POST /api/auth
app.post('/api/auth', async (req, res) => {
  await authHandler(req, res);
});

// Route: POST /api/checkin
app.post('/api/checkin', async (req, res) => {
  await checkinHandler(req, res);
});

// Route: POST /api/reset-feedback
app.post('/api/reset-feedback', async (req, res) => {
  await resetFeedbackHandler(req, res);
});

// Route: GET /api/cohort
app.get('/api/cohort', async (req, res) => {
  await cohortHandler(req, res);
});

// Route: GET /api/summary
app.get('/api/summary', async (req, res) => {
  await summaryHandler(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});