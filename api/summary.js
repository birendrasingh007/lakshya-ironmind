/**
 * summary.js
 * 
 * Backend endpoint for /api/summary
 * 
 * WHAT: Return user's learning patterns + agent insight
 * 
 * HOW:
 * 1. Query AirTable ResetLogs (past 7 days)
 * 2. Calculate patterns (success rate per reset)
 * 3. Call summary-agent to generate insight
 * 4. Return: { patterns, insight, tomorrow_suggestion, confidence, stats }
 */

import Anthropic from '@anthropic-ai/sdk';
import { calculatePatterns, calculateConfidence, getMostHelpful, getLeastHelpful } from '../src/lib/patterns.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// MOCK DATA: For MVP, use demo ResetLogs (in production, query AirTable)
const mockResetLogs = [
  { reset_title: 'Box Breathing', was_helpful: 'yes' },
  { reset_title: 'Box Breathing', was_helpful: 'yes' },
  { reset_title: 'Box Breathing', was_helpful: 'no' },
  { reset_title: 'Box Breathing', was_helpful: 'yes' },
  { reset_title: 'Shoulder Mobility', was_helpful: 'no' },
  { reset_title: 'Shoulder Mobility', was_helpful: 'yes' },
  { reset_title: 'Gentle Walk', was_helpful: 'yes' }
];

export default async function summaryHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Summary endpoint called');

    // STEP 1: Query ResetLogs (for MVP: use mock data)
    // TODO: Replace with AirTable query in production
    const resetLogs = mockResetLogs;
    const totalCheckups = resetLogs.length;

    console.log(`User history: ${totalCheckups} checkups`);

    // STEP 2: Calculate patterns
    const patterns = calculatePatterns(resetLogs);
    console.log('Patterns calculated:', patterns);

    // STEP 3: Calculate confidence
    const confidence = calculateConfidence(totalCheckups);

    // STEP 4: Get stats
    const mostHelpful = getMostHelpful(patterns);
    const leastHelpful = getLeastHelpful(patterns);

    // STEP 5: Call summary-agent
    const agentPrompt = `
You are summary-agent. Your job: read user's reset patterns and generate personalized learning insight.

USER PATTERNS (past 7 days):
${patterns.map(p => `- ${p.reset_type}: ${p.attempts} attempts, ${p.helpful} helpful (${p.success_rate}% success)`).join('\n')}

Total check-ins: ${totalCheckups}
Learning confidence: ${confidence}%

TASK:
1. Identify what resets work best for this user
2. Identify what resets don't work
3. Generate a SHORT tomorrow's suggestion (1 sentence)
4. Generate a learning insight (2 sentences)

RULES:
- Be specific (mention reset names + percentages)
- Be authentic (not generic)
- If confidence < 50%, add caveat: "Not enough data yet"
- If confidence > 75%, be confident: "Clear pattern"

OUTPUT ONLY JSON (no markdown, no code blocks):
{
  "insight": "Box breathing is working for you. 3 out of 4 times you found it helpful (75% success rate).",
  "tomorrow_suggestion": "If you're stressed tomorrow, try Box Breathing first—it has your best track record.",
  "pattern_summary": "Breathing techniques work best for you. Physical movement is less effective so far."
}
`;

    const agentResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: agentPrompt
        }
      ]
    });

    // STEP 6: Parse agent response
    const responseText = agentResponse.content[0].type === 'text' 
      ? agentResponse.content[0].text 
      : '';
    
    console.log('Agent response:', responseText);

    let agentData = {
      insight: 'Keep practicing. Each reset teaches you something.',
      tomorrow_suggestion: 'Try your most helpful reset first.',
      pattern_summary: 'Patterns emerging. Keep going!'
    };

    try {
      agentData = JSON.parse(responseText);
    } catch (parseErr) {
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      try {
        agentData = JSON.parse(cleanedText);
      } catch (retryErr) {
        console.error('Failed to parse agent response:', retryErr);
      }
    }

    // STEP 7: Return response
    return res.status(200).json({
      success: true,
      patterns,
      insight: agentData.insight,
      tomorrow_suggestion: agentData.tomorrow_suggestion,
      pattern_summary: agentData.pattern_summary,
      confidence,
      stats: {
        total_checkups: totalCheckups,
        most_helpful: mostHelpful?.reset_type || 'None yet',
        least_helpful: leastHelpful?.reset_type || 'None yet'
      }
    });
  } catch (err) {
    console.error('Summary endpoint error:', err);
    return res.status(500).json({
      error: err.message,
      success: false
    });
  }
}