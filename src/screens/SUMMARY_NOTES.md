# /summary Component - Decision Log

## Architecture Decision 1: Why Agentic Learning, Not Just Stats?

**Alternative:** Show success rates in a table (static)

**Decision:** Call summary-agent to generate insight + prediction

**Reasoning:**
- Stats are passive (historical). Agents are active (predictive).
- User learns: "Box breathing works 75% for me."
- Agent learns: "User should try breathing first tomorrow."
- Difference: Personalization vs. tracking.

**Interview answer:** "I could show charts. Instead, I built learning. An AI agent understands your patterns and predicts what you need next. That's the future of personalization."

---

## Architecture Decision 2: Why Mock Data (Not Real AirTable Query)?

**Alternative:** Query AirTable for real ResetLogs

**Decision:** Mock data for MVP. Comment marked "TODO: production"

**Reasoning:**
- MVP speed: Demo works without AirTable schema complexity
- Shows concept: Learning works end-to-end
- Real integration comes in Phase 4 (post-capstone)
- Easier to test (consistent demo data)

---

## Architecture Decision 3: Why Confidence Score?

**Alternative:** Just show success rate (75%)

**Decision:** Calculate confidence based on sample size

**Reasoning:**
- 1 attempt with 100% success ≠ 4 attempts with 75% success
- Confidence tells user: "Is this a real pattern or lucky?"
- User trust: "75% with confidence 20%" vs "75% with confidence 90%"
- Agent calibrates language: Low confidence → "try a few more times"

Confidence formula: (total_attempts / 10) * 100
- 2 attempts: 20% confidence (not enough data)
- 5 attempts: 50% confidence (pattern emerging)
- 10+ attempts: 95% confidence (solid pattern)

---

## Architecture Decision 4: Why Call summary-agent (Not LLM API)?

**Alternative:** Format patterns as UI text, no agent

**Decision:** AI-generated insight (agentic learning)

**Reasoning:**
- Agent understands WHY patterns matter (context)
- Agent generates prediction (tomorrow's suggestion)
- Agent validates confidence (doesn't overstate weak patterns)
- Shows multi-agent orchestration (3 agents: checkin, reset, summary)

---

## Testing Checklist

- [ ] /summary loads after /cohort
- [ ] Stats display correctly (checkups, confidence, most helpful)
- [ ] Patterns list shows resets ranked by success rate
- [ ] Emojis display (🔥 for 75%+, 💪 for 50%+, etc)
- [ ] Learning insight from agent shows
- [ ] Tomorrow's suggestion personalizes correctly
- [ ] Confidence % matches formula
- [ ] Error handling if backend fails
- [ ] Mobile responsive

---

## Post-Capstone TODOs

- [ ] Replace mock data with real AirTable query
- [ ] Persist user patterns (store in new table)
- [ ] Nightly learning loop (auto-update patterns)
- [ ] User can view history (weekly trends)
- [ ] Export learning insights as PDF
- [ ] Share insights with coach/therapist