import Anthropic from "@anthropic-ai/sdk";
import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic();
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);

// AGENT 1: Validate check-in input
async function validateCheckin(stressScore, energyLevel, timeAvailable, stressTrigger) {
const systemPrompt = `You are stress-checkin-agent. Your job:
    1. Validate user input (stress 1-10, energy Low/Med/High, time 2/5/10, trigger Work/Family/Body/Sleep/Unknown)
    2. Summarize their state in ONE sentence
    3. Return ONLY valid JSON (no markdown, no code blocks): { "is_valid": boolean, "state_summary": string }
    
    Be strict: reject invalid inputs.`;

    const userPrompt = `Validate this check-in:
    stress_score: ${stressScore}
    energy_level: ${energyLevel}
    time_available: ${timeAvailable}
    stress_trigger: ${stressTrigger}
    
    Respond ONLY with valid JSON, no markdown.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);
    
    return {
      is_valid: parsed.is_valid,
      state_summary: parsed.state_summary
    };
  } catch (err) {
    console.error("Validation error:", err);
    throw new Error("Validation failed");
  }
}

// Save check-in to AirTable DailyState
async function saveDailyState(userId, stressScore, energyLevel, timeAvailable, stressTrigger) {
  try {
    const records = await base.table("DailyState").create([{
        fields: {
          user_id: userId,
          check_in_date: new Date().toISOString().split('T')[0],
          stress_score: stressScore,
          energy_level: energyLevel,
          time_available_mins: timeAvailable,
          stress_trigger: stressTrigger,
          activity_level: null,
          nutrition_target_cals: null
        }
      }]);
      
      return records[0].id;
  } catch (err) {
    console.error("AirTable DailyState save error:", err);
    throw new Error("Failed to save check-in to database");
  }
}

// Get user's past resets for context
async function getUserHistory(userId, limit = 5) {
  try {
    const records = await base.table("ResetLogs")
      .select({
        filterByFormula: `{user_id} = '${userId}'`,
        sort: [{ field: "log_date", direction: "desc" }],
        maxRecords: limit
      })
      .all();

    return records.map(r => ({
      reset_title: r.fields.reset_title || "",
      was_helpful: r.fields.was_helpful || "not_sure",
      duration: r.fields.duration_mins || 0,
      completion_status: r.fields.completion_status || "skipped",
      log_date: r.fields.log_date || ""
    }));
  } catch (err) {
    console.error("History fetch error:", err);
    return [];
  }
}

// AGENT 2: Generate personalized reset plan
async function generateResetPlan(validatedInput, userHistory, stressTrigger) {
    const systemPrompt = `You are reset-plan-agent. Your job:
    1. Read user's history (what resets worked? what didn't?)
    2. Read today's constraints (stress level, energy, time, trigger)
    3. Generate ONE personalized reset plan
    4. Return ONLY valid JSON (no markdown, no code blocks): { "reset_title": string, "duration_mins": number, "steps": [string], "why_this_reset": string, "follow_up": string }
    
    Personalization rules:
    - If stress 8-10 + time ≤5: Quick breathing (2 min)
    - If energy Low + any stress: Gentle walk (5 min)
    - If body tension: Shoulder mobility (3 min)
    - If user completed same reset 3+ times and marked helpful: Suggest it again
    - Never suggest something user skipped 3+ times
    
    User History:
    ${JSON.stringify(userHistory, null, 2)}
    
    Today's Input:
    ${JSON.stringify(validatedInput, null, 2)}`;
    
    const userPrompt = `Generate a personalized reset plan for stress trigger: ${stressTrigger}. Respond ONLY with valid JSON, no markdown.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);

    return {
      reset_title: parsed.reset_title,
      duration_mins: parsed.duration_mins,
      steps: parsed.steps,
      why_this_reset: parsed.why_this_reset,
      follow_up: parsed.follow_up
    };
  } catch (err) {
    console.error("Plan generation error:", err);
    throw new Error("Failed to generate reset plan");
  }
}

// Save reset plan to AirTable ResetPlans
async function saveResetPlan(userId, dailyStateId, resetPlan) {
  try {
    const records = await base.table("ResetPlans").create([{
        fields: {
          user_id: userId,
          daily_state_id: dailyStateId,
          plan_date: new Date().toISOString().split('T')[0],
          reset_title: resetPlan.reset_title,
          reset_json: JSON.stringify(resetPlan),
          duration_mins: resetPlan.duration_mins,
          reasoning: resetPlan.why_this_reset,
          agent_name: "reset-plan-agent"
        }
      }]);
      
      return records[0].id;
  } catch (err) {
    console.error("ResetPlans save error:", err);
    throw new Error("Failed to save reset plan to database");
  }
}

// MAIN HANDLER
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, stress_score, energy_level, time_available_mins, stress_trigger } = req.body;

  try {
    console.log("Checkin request:", { user_id, stress_score, energy_level, time_available_mins, stress_trigger });

    // STEP 1: Validate input
    const validated = await validateCheckin(stress_score, energy_level, time_available_mins, stress_trigger);
    
    if (!validated.is_valid) {
      return res.status(400).json({ error: validated.state_summary });
    }

    console.log("Validation passed:", validated.state_summary);

    // STEP 2: Save raw input to AirTable
    const dailyStateId = await saveDailyState(user_id, stress_score, energy_level, time_available_mins, stress_trigger);
    console.log("DailyState saved:", dailyStateId);

    // STEP 3: Get user's history
    const history = await getUserHistory(user_id);
    console.log("User history retrieved:", history.length, "records");

    // STEP 4: Generate personalized reset
    const resetPlan = await generateResetPlan(
      {
        stress_score,
        energy_level,
        time_available_mins,
        stress_trigger
      },
      history,
      stress_trigger
    );

    console.log("Reset plan generated:", resetPlan.reset_title);

    // STEP 5: Save reset plan to AirTable
    const resetPlanId = await saveResetPlan(user_id, dailyStateId, resetPlan);
    console.log("ResetPlans saved:", resetPlanId);

    // STEP 6: Return to frontend
    return res.status(200).json({
      success: true,
      reset_plan_id: resetPlanId,
      reset_title: resetPlan.reset_title,
      duration_mins: resetPlan.duration_mins,
      steps: resetPlan.steps,
      why_this_reset: resetPlan.why_this_reset,
      follow_up: resetPlan.follow_up
    });

  } catch (err) {
    console.error("Checkin error:", err);
    return res.status(500).json({ error: err.message });
  }
}