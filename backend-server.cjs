const express = require('express');
const cors = require('cors');
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function runAgent(agentName, userInput) {
  try {
    console.log(`[${new Date().toISOString()}] Running ${agentName}`);
    const message = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: userInput }]
    });
    const output = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log(`[${new Date().toISOString()}] Success!`);
    return { success: true, output: output.trim(), agent: agentName };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    return { success: false, error: error.message, agent: agentName };
  }
}

app.post('/api/checkin', async (req, res) => {
  const { energy, timeAvailable, constraints, workoutType } = req.body;
  const userInput = `Morning check-in: Energy ${energy}, ${timeAvailable} minutes available. Constraints: ${constraints || 'none'}. Workout preference: ${workoutType}.`;
  res.json(await runAgent('checkin-agent', userInput));
});

app.post('/api/plan', async (req, res) => {
  const { energy, timeAvailable, constraints, workoutType } = req.body;
  const userInput = `You are plan-agent. Check-in data: Energy ${energy}, Time ${timeAvailable} min, Constraints ${constraints || 'none'}, Type ${workoutType}. Generate personalized workout plan.`;
  res.json(await runAgent('plan-agent', userInput));
});

app.post('/api/summary', async (req, res) => {
  const { sessionNotes } = req.body;
  res.json(await runAgent('summary-agent', sessionNotes));
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = 3001;
app.listen(PORT, () => console.log(`IronMind backend running on http://localhost:${PORT}`));
