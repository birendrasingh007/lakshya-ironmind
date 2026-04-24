const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const AGENTS_DIR = path.join(__dirname, '.claude/agents');

function runAgent(agentName, userInput) {
  try {
    console.log(`[${new Date().toISOString()}] Running ${agentName}`);
    
    const agentFile = path.join(AGENTS_DIR, `${agentName}.md`);
    
    if (!fs.existsSync(agentFile)) {
      throw new Error(`Agent file not found: ${agentFile}`);
    }

    const command = `echo "${userInput.replace(/"/g, '\\"')}" | claude`;
    console.log(`[${new Date().toISOString()}] Executing...`);
    
    const output = execSync(command, { 
      encoding: 'utf-8',
      env: { ...process.env },
      timeout: 120000 // 120 seconds timeout
    });

    console.log(`[${new Date().toISOString()}] Success!`);
    
    return {
      success: true,
      output: output.trim(),
      agent: agentName
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    return {
      success: false,
      error: error.message,
      agent: agentName
    };
  }
}

app.post('/api/checkin', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/checkin`);
  const { energy, timeAvailable, constraints, workoutType } = req.body;
  const userInput = `Morning check-in: Energy ${energy}, ${timeAvailable} minutes available. Constraints: ${constraints || 'none'}. Workout preference: ${workoutType}.`;
  const result = runAgent('checkin-agent', userInput);
  res.json(result);
});

app.post('/api/plan', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/plan`);
  const { energy, timeAvailable, constraints, workoutType } = req.body;
  const userInput = `You are plan-agent. Check-in data: Energy ${energy}, Time ${timeAvailable} min, Constraints ${constraints || 'none'}, Type ${workoutType}. Generate personalized workout plan.`;
  const result = runAgent('plan-agent', userInput);
  res.json(result);
});

app.post('/api/summary', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/summary`);
  const { sessionNotes } = req.body;
  const result = runAgent('summary-agent', sessionNotes);
  res.json(result);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`IronMind backend running on http://localhost:${PORT}`);
});
