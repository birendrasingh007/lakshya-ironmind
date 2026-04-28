import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { energy, timeAvailable, constraints, workoutType } = req.body;
  const userInput = `Morning check-in: Energy ${energy}, ${timeAvailable} minutes available. Constraints: ${constraints || "none"}. Workout preference: ${workoutType}.`;
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: userInput }]
    });
    const output = message.content[0].type === "text" ? message.content[0].text : "";
    res.json({ success: true, output: output.trim(), agent: "checkin-agent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
