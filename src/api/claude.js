import Anthropic from '@anthropic-ai/sdk'

const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Peak']

export async function generatePlan(checkIn, stravaData, onChunk) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.'
    )
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const { lastActivity, weeklyStats } = stravaData
  const energyLabel = ENERGY_LABELS[checkIn.energyLevel]

  const prompt = `You are a personalized health and habit co-pilot. Based on the morning check-in and Strava data below, create a practical daily plan for today.

MORNING CHECK-IN:
- Energy Level: ${energyLabel} (${checkIn.energyLevel}/5)
- Sleep Last Night: ${checkIn.sleepHours} hours
- Mood: ${checkIn.mood}
- Today's Focus: ${checkIn.goals || 'Not specified'}

STRAVA FITNESS DATA:
- Last Activity: ${lastActivity.type} "${lastActivity.name}" (${lastActivity.date}) — ${lastActivity.distance} in ${lastActivity.duration} at ${lastActivity.pace} pace, avg HR ${lastActivity.heartRate} bpm
- This Week: ${weeklyStats.totalDistance} across ${weeklyStats.activeDays} active days (${weeklyStats.totalTime} total)
- Weekly Goal: ${weeklyStats.goalProgress}% complete (${weeklyStats.totalDistance} of ${weeklyStats.weeklyGoal})

Write the daily plan using EXACTLY this format — ## for section headers, - for bullet points. Be specific with times, reference their actual data, and keep advice actionable. Tailor exercise to their energy and training load.

## 🌅 Morning Routine
## 💼 Focus & Deep Work
## 🏃 Movement & Recovery
## 🥗 Nutrition Reminders
## 🌙 Evening Wind-down
## ✅ Key Habits to Track Today

Rules: 3–5 bullets per section. Be personal and encouraging. Reference specific numbers from their data.`

  let fullText = ''
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullText += event.delta.text
      onChunk?.(fullText)
    }
  }

  await stream.finalMessage()
  return fullText
}
