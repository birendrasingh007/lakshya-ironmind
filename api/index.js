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

// Route: POST /api/reset-feedback
app.post('/api/reset-feedback', async (req, res) => {
    const { user_id, reset_plan_id, completion_status, was_helpful } = req.body;
  
    try {
      console.log('Reset feedback:', { user_id, reset_plan_id, completion_status, was_helpful });
  
      // TODO: POST to AirTable ResetLogs table
      // For now, just return success
  
      return res.status(200).json({
        success: true,
        message: 'Feedback saved',
        reset_log_id: 'rec_temp_' + Date.now()
      });
    } catch (err) {
      console.error('Reset feedback error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});