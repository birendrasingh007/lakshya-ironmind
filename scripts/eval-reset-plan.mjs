/**
 * Offline Reset Plan eval runner (v1).
 * Calls Claude with the same prompts/settings as generateResetPlan in api/checkin.js.
 * Does NOT hit /api/checkin, Railway, or Airtable.
 */
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_PATH = join(__dirname, "..", "evals", "results-v1.json");

const client = new Anthropic(); // uses ANTHROPIC_API_KEY

const TEST_CASES = [
  { id: 1, stress_score: 5, energy_level: "Medium", time_available_mins: 5, stress_trigger: "Work" },
  { id: 2, stress_score: 9, energy_level: "Low", time_available_mins: 2, stress_trigger: "Work" },
  { id: 3, stress_score: 8, energy_level: "Low", time_available_mins: 5, stress_trigger: "Sleep" },
  { id: 4, stress_score: 3, energy_level: "High", time_available_mins: 10, stress_trigger: "Body" },
  { id: 5, stress_score: 9, energy_level: "Medium", time_available_mins: 2, stress_trigger: "Family" },
];

/**
 * Mirrors generateResetPlan in api/checkin.js (same prompts, model, settings, parsing).
 */
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
    
    Breathing consistency rules:
    - If a breathing technique or breathing pattern is named, the name must exactly match the inhale / hold / exhale counts described in the steps.
    - Never describe one breathing sequence and then label it as a different named pattern.
    - Example of an invalid output: steps describe 4-2-6 breathing but later call it "4-7-8".
    - If using custom breathing counts that do not match a known named technique, describe the counts directly and do not give the pattern a conflicting name.
    
    Consistency rules:
    - Before returning the JSON, ensure reset_title, duration_mins, steps, why_this_reset, and follow_up are internally consistent with each other.
    - Ensure the actual steps can realistically fit within time_available_mins.
    
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
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);

    return {
      reset_title: parsed.reset_title,
      duration_mins: parsed.duration_mins,
      steps: parsed.steps,
      why_this_reset: parsed.why_this_reset,
      follow_up: parsed.follow_up,
    };
  } catch (err) {
    console.error("Plan generation error:", err);
    throw new Error("Failed to generate reset plan");
  }
}

/** Deterministic: PASS if generated duration fits within requested time. */
function evaluateTimeCompliance(requestedTime, generatedDuration) {
  const result =
    typeof generatedDuration === "number" && generatedDuration <= requestedTime
      ? "PASS"
      : "FAIL";

  return {
    result,
    requested_time: requestedTime,
    generated_duration: generatedDuration ?? null,
  };
}

/**
 * LLM-as-a-judge: binary overall appropriateness for the user's context.
 * Never throws — returns ERROR on judge/parse failures.
 */
async function evaluateOverallAppropriateness(inputContext, resetPlan) {
  const systemPrompt = `You are a strict evaluation judge for a stress-reset recommendation system.
Independently inspect the generated plan. Do NOT simply trust fields like duration_mins — verify claims against the actual steps, timings, repetitions, and wording.

Judge question:
Given the user's stress level, energy level, available time, and stress trigger, is this reset recommendation appropriate overall?

Evaluation criteria:
1. Stress appropriateness — Is the recommendation suitable for the user's stress level?
2. Energy appropriateness — Is the effort/intensity suitable for the user's energy level?
3. Trigger relevance — Does the recommendation make sense for the stated stress trigger?
4. Realistic time feasibility — Based on the ACTUAL steps and any stated timings/repetitions, could the plan realistically be completed within time_available_mins? Do not simply trust output.duration_mins.
5. Internal consistency — Do the title, steps, timing, explanation, and follow-up agree with each other? Catch contradictions such as instructions describing one breathing pattern (e.g. 4-4-6) but later naming a different pattern (e.g. 4-7-8).

FAIL if there is a meaningful contradiction OR if the actual steps do not realistically fit within time_available_mins.
PASS only if the plan is appropriate on the criteria above and free of those failure modes.

Keep the decision binary. Do not use a 1-5 rating.
Return ONLY valid JSON (no markdown, no code blocks): { "result": "PASS" | "FAIL", "reason": "one concise sentence identifying the most important reason" }`;

  const userPrompt = `INPUT CONTEXT:
${JSON.stringify(inputContext, null, 2)}

GENERATED RESET PLAN:
${JSON.stringify(resetPlan, null, 2)}

Respond ONLY with valid JSON, no markdown.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);

    if (parsed.result !== "PASS" && parsed.result !== "FAIL") {
      return {
        result: "ERROR",
        reason: `Invalid judge result: ${JSON.stringify(parsed.result)}`,
      };
    }

    return {
      result: parsed.result,
      reason: typeof parsed.reason === "string" ? parsed.reason : String(parsed.reason ?? ""),
    };
  } catch (err) {
    return {
      result: "ERROR",
      reason: err?.message || String(err),
    };
  }
}

async function runCase(testCase) {
  const { id, stress_score, energy_level, time_available_mins, stress_trigger } = testCase;
  const validatedInput = {
    stress_score,
    energy_level,
    time_available_mins,
    stress_trigger,
  };
  const userHistory = [];

  const output = await generateResetPlan(validatedInput, userHistory, stress_trigger);

  const inputContext = {
    stress_score,
    energy_level,
    time_available_mins,
    stress_trigger,
  };

  const overallAppropriateness = await evaluateOverallAppropriateness(
    inputContext,
    output
  );

  return {
    id,
    input: { ...validatedInput, userHistory },
    output,
    evaluations: {
      time_compliance: evaluateTimeCompliance(
        time_available_mins,
        output.duration_mins
      ),
      overall_appropriateness: overallAppropriateness,
    },
    error: null,
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or your environment.");
    process.exit(1);
  }

  const results = [];

  console.log("Running offline reset-plan eval (v1)...\n");
  console.log("Case ID | Reset title | Time compliance | Overall appropriateness");
  console.log("-".repeat(80));

  for (const testCase of TEST_CASES) {
    try {
      const result = await runCase(testCase);
      results.push(result);

      const title = result.output.reset_title ?? "(missing)";
      const compliance = result.evaluations.time_compliance.result;
      const overall = result.evaluations.overall_appropriateness.result;
      console.log(`${result.id} | ${title} | ${compliance} | ${overall}`);
    } catch (err) {
      const message = err?.message || String(err);
      const timeCompliance = evaluateTimeCompliance(
        testCase.time_available_mins,
        null
      );
      results.push({
        id: testCase.id,
        input: {
          stress_score: testCase.stress_score,
          energy_level: testCase.energy_level,
          time_available_mins: testCase.time_available_mins,
          stress_trigger: testCase.stress_trigger,
          userHistory: [],
        },
        output: null,
        evaluations: {
          time_compliance: timeCompliance,
          overall_appropriateness: {
            result: "ERROR",
            reason: "Skipped: reset plan generation failed",
          },
        },
        error: message,
      });

      console.log(
        `${testCase.id} | ERROR: ${message} | ${timeCompliance.result} | ERROR`
      );
    }
  }

  await mkdir(dirname(RESULTS_PATH), { recursive: true });
  await writeFile(
    RESULTS_PATH,
    JSON.stringify(
      {
        version: "v1",
        generated_at: new Date().toISOString(),
        model: "claude-sonnet-4-6",
        userHistory: [],
        cases: results,
      },
      null,
      2
    )
  );

  console.log(`\nSaved results to ${RESULTS_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
