/**
 * cohort.js
 * 
 * GET /api/cohort endpoint
 * 
 * WHAT: Return real cohort members + team message
 * 
 * HOW:
 * 1. Query AirTable Users table (WHERE cohort_id = 'active-bhidus')
 * 2. For each user, calculate completion % from ResetLogs
 * 3. Call cohort-nudge-agent
 * 4. Return: { members[], team_message, team_emoji }
 */

import Airtable from 'airtable';
import Anthropic from '@anthropic-ai/sdk';

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);
const usersTable = base('Users');
const resetLogsTable = base('ResetLogs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function cohortHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Cohort endpoint called');

    // STEP 1: Query Users table (active-bhidus cohort)
    const usersRecords = await usersTable
      .select({
        filterByFormula: `{cohort_id} = 'active-bhidus'`
      })
      .all();

    console.log(`Found ${usersRecords.length} users in cohort`);

    // STEP 2: Calculate completion % for each user
    const members = await Promise.all(
      usersRecords.map(async (userRecord) => {
        const userEmail = userRecord.fields.email_id;
        const userName = userRecord.fields.user_name;

        // Query ResetLogs for this user (past 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const resetLogs = await resetLogsTable
          .select({
            filterByFormula: `AND({user_id} = '${userEmail}', {log_date} >= '${sevenDaysAgoStr}')`
          })
          .all();

        // Calculate completion %
        const attempts = resetLogs.length;
        const completed = resetLogs.filter(log => log.fields.completion_status === 'done').length;
        const completion_pct = attempts > 0 ? Math.round((completed / attempts) * 100) : 0;

        console.log(`User ${userName}: ${completed}/${attempts} = ${completion_pct}%`);

        return {
          name: userName,
          completion_pct: completion_pct
        };
      })
    );

    // STEP 3: Calculate team stats
    const total_members = members.length;
    const avg_completion = Math.round(
      members.reduce((sum, m) => sum + m.completion_pct, 0) / total_members
    );
    const completed_count = members.filter(m => m.completion_pct >= 75).length;

    console.log(`Team stats: avg=${avg_completion}%, completed=${completed_count}/${total_members}`);

    // STEP 4: Call cohort-nudge-agent
    const agentPrompt = `
You are cohort-nudge-agent. Generate SHORT team motivation message.

CONTEXT:
- Team size: ${total_members} members
- Average completion this week: ${avg_completion}%
- Members crushing 75%+: ${completed_count}
- Team name: "Active Bhidus"

RULES:
1. Message: 1-2 sentences max
2. Celebrate consistency, not perfection
3. Include ONE emoji (💪 🔥 🎉 ❤️)
4. Be authentic, not salesy

COMPLETION TIER:
- If avg < 50%: "Small steps matter. Keep going! 💪"
- If avg 50-75%: "Building momentum! 🔥"
- If avg > 75%: "Unstoppable! 🎉"

OUTPUT ONLY JSON (no markdown):
{ "team_message": "...", "team_emoji": "..." }
`;

    const agentResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: agentPrompt }]
    });

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
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      try {
        agentData = JSON.parse(cleanedText);
      } catch (retryErr) {
        console.error('Failed to parse agent response:', retryErr);
      }
    }

    // STEP 5: Return response
    return res.status(200).json({
      success: true,
      members,
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