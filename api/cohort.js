/**
 * cohort.js
 * 
 * Backend endpoint for /api/cohort
 * 
 * WHAT: Return cohort member list + team message
 * 
 * HOW:
 * 1. GET /api/cohort
 * 2. Backend returns hardcoded demo members
 * 3. Calculates average completion
 * 4. Calls cohort-nudge-agent to generate team message
 * 5. Returns: { members[], team_message, team_emoji }
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// DEMO DATA: Hardcoded members for MVP
const demoMembers = [
  { user_id: 'birendra-001', name: 'Birendra', completion_pct: 80 },
  { user_id: 'sukanya-001', name: 'Sukanya', completion_pct: 60 },
  { user_id: 'babu-001', name: 'Babu', completion_pct: 100 },
  { user_id: 'bhaskar-001', name: 'Bhaskar', completion_pct: 70 },
  { user_id: 'adarsh-001', name: 'Adarsh', completion_pct: 50 }
];

export default async function cohortHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Cohort endpoint called');

    // CALCULATE TEAM STATS
    const total_members = demoMembers.length;
    const avg_completion = Math.round(
      demoMembers.reduce((sum, m) => sum + m.completion_pct, 0) / total_members
    );
    const completed_count = demoMembers.filter(m => m.completion_pct >= 75).length;

    console.log(`Team stats: avg=${avg_completion}%, completed=${completed_count}/${total_members}`);

    // CALL COHORT-NUDGE-AGENT
    const agentPrompt = `
You are cohort-nudge-agent. Your job is to generate a SHORT, authentic team motivation message.

CONTEXT:
- Team size: ${total_members} members
- Average completion this week: ${avg_completion}%
- Members with 75%+ completion: ${completed_count}
- Team name: "Active Bhidus"

RULES:
1. Message should be 1-2 sentences max
2. Celebrate consistency, not perfection
3. Include ONE emoji (💪 🔥 🎉 ❤️)
4. Be authentic, not salesy
5. Reference the team's actual performance

COMPLETION TIER GUIDANCE:
- If avg < 50%: "Small steps matter. Keep going! 💪"
- If avg 50-75%: "You're building momentum. 4 of 5 this week! 🔥"
- If avg > 75%: "Unstoppable. This is what consistency looks like! 🎉"

OUTPUT ONLY JSON (no markdown, no code blocks):
{ "team_message": "...", "team_emoji": "..." }
`;

    const agentResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: agentPrompt
        }
      ]
    });

    // PARSE AGENT RESPONSE
    const responseText = agentResponse.content[0].type === 'text' 
      ? agentResponse.content[0].text 
      : '';
    
    console.log('Agent response:', responseText);

    let agentData = { 
      team_message: 'Team is doing great!', 
      team_emoji: '💪' 
    };

    try {
      agentData = JSON.parse(responseText);
    } catch (parseErr) {
      // If JSON parsing fails, strip markdown and try again
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      try {
        agentData = JSON.parse(cleanedText);
      } catch (retryErr) {
        console.error('Failed to parse agent response:', retryErr);
        // Fallback to default
      }
    }

    // RETURN RESPONSE
    return res.status(200).json({
      success: true,
      members: demoMembers,
      team_message: agentData.team_message,
      team_emoji: agentData.team_emoji,
      avg_completion,
      total_members,
      completed_count
    });
  } catch (err) {
    console.error('Cohort endpoint error:', err);
    return res.status(500).json({ 
      error: err.message,
      success: false 
    });
  }
}