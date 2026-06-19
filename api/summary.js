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
 
import Airtable from 'airtable';
import Anthropic from '@anthropic-ai/sdk';
import { calculatePatterns, calculateConfidence, getMostHelpful, getLeastHelpful } from '../src/lib/patterns.js';
 
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
 
const airtable = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN
  });
  
  const base = airtable.base(process.env.AIRTABLE_BASE_ID);
  const resetLogsTable = base('ResetLogs');
 
export default async function summaryHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  try {
    console.log('Summary endpoint called');
 
    // STEP 1: Query ResetLogs from AirTable
    const user_id = req.query.user_id || 'birendra@example.com';  // Get from request
 
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
 
    console.log(`Querying ResetLogs for user: ${user_id}`);
    console.log(`Date filter (7 days back): ${sevenDaysAgoStr}`);
 
 
    const resetLogRecords = await resetLogsTable
    .select({
        filterByFormula: `AND({user_id} = '${user_id}', {log_date} >= '${sevenDaysAgoStr}')`
    })
    .all();
 
    console.log(`Found ${resetLogRecords.length} reset logs`);
    resetLogRecords.forEach(record => {
        console.log(`  - user_id: ${record.fields.user_id}, log_date: ${record.fields.log_date}, was_helpful: ${record.fields.was_helpful}`);
      });
 
    const resetLogs = resetLogRecords.map(record => ({
    reset_title: record.fields.reset_title,
    was_helpful: record.fields.was_helpful
    }));
 
    console.log(`Found ${resetLogs.length} reset logs for user`);
 
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
 
    // STEP 5: Call summary-agent with conditional encouragement for new users
    const agentPrompt = `
You are IronMind's learning agent. Your job: celebrate wins and guide growth based on user's patterns.
 
USER DATA:
- Total check-ins: ${totalCheckups}
- Reset patterns: ${patterns.map(p => `${p.reset_type} (${p.attempts} attempts, ${p.helpful} helpful, ${p.success_rate}% success)`).join(', ')}
- Learning confidence: ${confidence}%
 
${totalCheckups < 3 ? `
GUIDANCE FOR NEW USERS (< 3 CHECK-INS):
- Celebrate their first attempts with genuine enthusiasm
- Show optimism: "You're building momentum!"
- Encourage variety and experimentation
- Tone: Warm, growth-minded, encouraging
- Example: "With just ${totalCheckups} check-in(s), you've already identified what works for you. That's a pattern! Keep experimenting to discover more techniques that work for your style."
` : `
GUIDANCE FOR EXPERIENCED USERS (3+ CHECK-INS):
- Identify clear, reliable patterns
- Reference specific data (success rates, reset names)
- Give confident recommendations
- Tone: Data-driven, confident, specific
`}
 
TASK:
1. Identify what resets work best (or show most promise if new user)
2. Generate SHORT tomorrow's suggestion (1 sentence, actionable)
3. Generate learning insight (2 sentences, encouraging + specific)
 
RULES:
- Be specific and reference actual data when available
- For new users: Celebrate progress and encourage variety
- If ${totalCheckups} < 3: "Promising start! Keep experimenting."
- If ${confidence} < 50%: "You're building a clearer picture with each check-in."
- If ${confidence} > 75%: "Clear pattern emerging—you know what works for you."
 
OUTPUT ONLY JSON (no markdown, no code blocks):
{
  "insight": "...",
  "tomorrow_suggestion": "...",
  "pattern_summary": "..."
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
      total_checkups: resetLogs.length,        // ← ADD THIS
      most_helpful: getMostHelpful(patterns),  // ← ADD THIS
      least_helpful: getLeastHelpful(patterns), // ← ADD THIS
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