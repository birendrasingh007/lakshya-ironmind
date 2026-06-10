# IronMind Capstone: Design Decisions

---

## Technology Choices

**Q: Why Claude Code + React instead of Lovable?**

A: Token limits on Lovable $5/mo would block mid-build. Claude Code's direct SDK integration is cleaner for agents. Time difference negligible (~15 mins). Long-term: portable code, no vendor lock-in.

---

**Q: Why AirTable instead of Postgres?**

A: Zero setup time. 16-day capstone can't afford DevOps. Post-capstone migration to Postgres straightforward.

---

**Q: Why Claude (Haiku + Sonnet) for agents?**

A: Capstone context (Hamza's course). Claude's instruction-following superior for deterministic agent outputs.

---

## Technology Stack

### Q: Why React + Vite instead of Next.js or plain HTML/CSS?

**Decision:** React + Vite for frontend framework.

**Rationale:**
- **Speed:** Vite rebuilds in <100ms (vs Webpack's seconds). Critical for rapid iteration in 16-day sprint.
- **React ecosystem:** Large component library, hooks for state management, easier to reuse components across screens (/checkin, /reset, /complete, /cohort).
- **Simplicity:** Don't need Next.js full-stack routing for capstone MVP. Just frontend + separate Express backend.
- **Lightweight:** No unnecessary server-side rendering for this use case.

**Post-capstone consideration:** Could migrate to Next.js for integrated API routes, but MVP doesn't justify the complexity.

**Interview angle:** "I evaluated create-react-app vs Vite. Vite's fast rebuild loop was worth the learning curve for a tight capstone timeline."

---

### Q: Why Express backend instead of serverless (AWS Lambda, Vercel Functions)?

**Decision:** Express.js backend for server-side agent orchestration.

**Rationale:**
- **Agent state:** Claude agents need persistent memory (user_history, user-pattern.md). Express server can maintain this between requests.
- **Cost:** Free tier is sufficient for 5-8 users. Serverless pricing per invocation would be overkill.
- **Control:** Full control over request/response cycle, agent chaining (stress-checkin-agent → reset-plan-agent → database).
- **Deployment:** Railway (free tier) or Vercel backend functions both work. Express is portable.

**Trade-off:** Serverless would be simpler for stateless APIs. But agent logic requires state management.

**Interview angle:** "For agentic workflows, I need request context to carry data between agent calls. Express gives me that control."

---

### Q: Why Tailwind CSS instead of styled-components or vanilla CSS?

**Decision:** Tailwind CSS for styling.

**Rationale:**
- **Speed:** Utility-first approach = faster styling than writing custom CSS. Critical for MVP timeline.
- **Consistency:** Predefined color palette, spacing, typography ensures cohesive UI.
- **Minimal setup:** Works out-of-the-box with Vite. No runtime overhead (vs styled-components).
- **Responsive:** Built-in mobile-first breakpoints (needed for eventual React Native port).

**Trade-off:** Larger initial CSS bundle. But for capstone scale, negligible.

**Interview angle:** "Tailwind trades raw CSS flexibility for speed. For capstone with tight deadline, speed wins."

---

### Q: Why @anthropic-ai/sdk instead of REST API calls?

**Decision:** Use Anthropic's official SDK (`@anthropic-ai/sdk`) for Claude API calls.

**Rationale:**
- **Type safety:** SDK provides TypeScript types, error handling, retry logic out-of-the-box.
- **Reliability:** Official SDK = guaranteed compatibility with latest Claude models.
- **Agent patterns:** SDK naturally supports multi-turn conversations (needed for agent chaining).
- **Simpler code:** vs manually building HTTP requests with axios + parsing JSON.

**Example (SDK):**
```javascript
const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 500,
  system: "You are stress-checkin-agent...",
  messages: [{ role: "user", content: JSON.stringify(userInput) }]
});
```

**vs (REST):**
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "anthropic-api-key": KEY, "content-type": "application/json" },
  body: JSON.stringify({ model: "claude-sonnet-4-20250514", ... })
});
```

**SDK is cleaner + more maintainable.**

**Interview angle:** "Official SDKs reduce boilerplate and maintenance burden. I chose SDK over raw REST to focus on agent logic, not API plumbing."

---

---

## Architecture

**Q: Why one `DailyState` table instead of separate tables per wheel?**

A: Merge-ready for Wheels 1-2. One check-in, all wheels read from same row. NULL columns signal "ready to fill."

---

**Q: Why read-time calculation for CohortProgress?**

A: No background jobs needed for MVP (5-8 users). Query is <100ms. Simple. Post-capstone: add caching if needed.

---

**Q: Why 3 agents instead of 1?**

A: Single Responsibility. Model efficiency (Haiku for lightweight, Sonnet for reasoning). Failure isolation. Reusability.

---

## Product

**Q: Why private cohorts, not public leaderboards?**

A: Peer accountability beats comparison culture. Small trusted groups scale better. Research: 65% follow-through improvement.

---

**Q: Why one reset per checkin, not a library?**

A: Decision fatigue when stressed. Personalized one option beats 10 generic ones. Higher completion.

---

## Scope

**Q: Why defer /summary and learning loop?**

A: MVP is stress → action → accountability. Learning loop is enhancement, not core. Stretch goal if time permits.

---

**Q: Why no real auth for capstone?**

A: Demo user + hardcoded cohort. Auth is 3-4 hours. Not required to prove thesis. Post-capstone: add Clerk.

---

**Q: Why no push notifications or mobile app?**

A: 16-day constraint. Can prove hypothesis on web. Push + React Native deferred to Phase 1 post-capstone.

---

**Update as we build.**
