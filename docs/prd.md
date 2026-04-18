# PRD: Lakshya IronMind — Personalized Health & Habit Co-Pilot

---

### 1. Problem Statement

Busy adults aged 25–60 know the habits that would improve their health — exercise, sleep, hydration, recovery — but consistently fail to maintain them. The problem isn't knowledge; it's the gap between intention and daily execution. Generic apps prescribe static plans that don't adapt to how someone actually feels or what they did yesterday. The result is the Monday Restart Cycle: high motivation at the start of the week, burnout by Wednesday, guilt by Friday, and a reset the following Monday. What's missing is a co-pilot that meets the user where they are each day — not a coach that prescribes a fixed program.

---

### 2. Goals

1. Reduce the Monday Restart Cycle: get ≥60% of active users to complete at least 4 out of 5 weekday plans within their first two weeks.
2. Increase perceived plan relevance: ≥75% of generated plans are approved (not regenerated or heavily edited) by the user.
3. Deliver a working, demo-able prototype by the end of the 3-week Claude Code course capstone.
4. Demonstrate the AI Plan Generation + Human Approval workflow as a replicable product pattern for future features.
5. Achieve a qualitative "this gets me" response from at least 3 out of 5 user test participants in lightweight usability testing.

---

### 3. Non-Goals

- **No backend or user accounts in v1.** State lives in the browser session only. No login, no persistence across sessions.
- **No real Strava OAuth integration in v1.** Mock data simulates Strava activity. Real integration is scoped to v2.
- **No push notifications or nudge delivery in v1.** The nudge schedule is shown as a preview only — nothing is actually sent.
- **Not a fitness tracker.** IronMind does not record workouts, steps, or biometrics. It reads context and generates plans.
- **Not a medical or clinical tool.** No health advice requiring professional licensing.
- **No social or community features.** This is a solo co-pilot, not a group accountability app.

---

### 4. Users & Use Cases

**Scenario 1 — The Overcommitted Professional**
Priya, 34, is a product manager who runs 3x/week when life cooperates. She had back-to-back calls yesterday, slept 5 hours, and skipped her run. She opens IronMind on her phone during her morning coffee. She rates her energy as low, mood as "meh," and types "just need to move a little today." IronMind generates a 20-minute walk + 10-minute stretch plan instead of her usual 5K. She approves it. She actually does it.

**Scenario 2 — The Motivated-But-Inconsistent Athlete**
Marcus, 42, trains for triathlons but travels 2 weeks a month for work. He's in a hotel in Chicago with a gym but no pool. He checks in: high energy, full sleep, goal is "stay on training schedule." IronMind sees mock Strava data showing a rest day yesterday and generates a 45-minute strength session tailored to hotel gym equipment. He edits one exercise, approves the rest, and completes the plan.

**Scenario 3 — The Recovering Burnout**
Selin, 29, just finished a brutal product launch. She hasn't exercised in 3 weeks and feels guilty about it. She opens IronMind with low energy and the goal "get back on track without overwhelming myself." IronMind generates a gentle re-entry plan: a short walk, a breathing exercise, and a hydration goal. No running. No guilt. Just a small win to restart momentum.

---

### 5. User Stories

**Must-Have**

- As a user, I want to log my current energy, sleep quality, mood, and daily goal so that Claude can generate a plan that reflects how I actually feel today.
- As a user, I want to see Claude stream my personalized plan in real time so that I feel engaged while it's being created.
- As a user, I want to approve, edit, or regenerate the plan so that I stay in control and only commit to what feels right.
- As a user, I want to see a locked confirmation of my approved plan so that I have a clear, committed view of what I'm doing today.

**Should-Have**

- As a user, I want to see my mock Strava activity from yesterday so that the plan accounts for what I've already done.
- As a user, I want to see a preview of when I'll receive nudges throughout the day so that I can mentally prepare for the reminders.
- As a user, I want the plan broken into named sections (e.g., Morning, Movement, Recovery) so that it's easy to scan and follow.

**Nice-to-Have**

- As a user, I want to add a free-text note about anything Claude should know (injury, travel, stress) so that the plan is even more tailored.
- As a user, I want to regenerate just one section of the plan (not the whole thing) so that I don't lose parts I already liked.
- As a user, I want to see a weekly summary of how many plans I approved and completed so that I can track consistency over time.

---

### 6. Acceptance Criteria

**Check-In Form**

- Given I open the app, when I land on the check-in screen, then I see inputs for energy level, sleep quality, mood, and today's goal — all required before proceeding.
- Given I complete the form, when I submit, then the app transitions to the Strava preview step without errors.

**Strava Preview**

- Given I'm on the Strava step, when it loads, then I see mock activity data (activity type, duration, distance) from the previous day.
- Given the Strava step is displayed, when I click Continue, then the app moves to the plan generation step.

**Plan Generation (Streaming)**

- Given I reach the generating step, when Claude begins responding, then I see tokens appear on screen in real time within 2 seconds of the step loading.
- Given the stream is in progress, when new tokens arrive, then the UI updates without full re-renders or visible flicker.
- Given the stream completes, when the full plan is received, then the app automatically transitions to the review step.

**Plan Review**

- Given I'm on the review step, when the plan has `## section` headers and `- bullet` items, then each section renders as a distinct color-coded card.
- Given I'm on the review step, when I click Approve, then the plan is locked and I'm taken to the confirmation screen.
- Given I'm on the review step, when I click Regenerate, then the app returns to the generating step and fetches a new plan with the same check-in inputs.
- Given I'm on the review step, when I edit the plan text inline, then my edits are preserved when I approve.

**Confirmation**

- Given I approve the plan, when the confirmation screen loads, then I see the full locked plan and a nudge schedule preview.

---

### 7. Risks & Assumptions

| **Risks** | **Assumptions** |
|---|---|
| Claude API latency may make the streaming feel slow on poor connections — perceived wait time could hurt trust. | [ASSUMPTION] Users will tolerate a 3–8 second stream start time if they see tokens appearing immediately. |
| With no backend, users lose their plan on refresh. This could feel low-trust for a "habit co-pilot." | [ASSUMPTION] For a prototype/capstone demo, single-session state is acceptable to stakeholders. |
| The API key is exposed in the browser (`dangerouslyAllowBrowser: true`). Unsuitable for any public deployment. | [ASSUMPTION] This app will only be demo'd in controlled settings, not shipped to real end users. |
| Plan quality depends entirely on prompt engineering. A bad prompt yields a generic plan that undermines the value proposition. | [ASSUMPTION] Claude's output with the current prompt is "good enough" to be approved 75%+ of the time without tuning. [NEEDS INPUT] |
| No real Strava data means the "personalization" story is partially simulated. Demo audiences may probe this. | [ASSUMPTION] Mock Strava data is sufficient to demonstrate the integration pattern for v1. |
| Without persistence, there's no way to measure the Monday Restart Cycle in v1. | [ASSUMPTION] Success in v1 is measured qualitatively (demo feedback) not quantitatively. |

---

### 8. Open Questions

1. **What is the primary demo audience for the capstone?** (Course instructors? Investors? Peers?) This affects how polished the UI needs to be. *Owner: [NEEDS INPUT]*
2. **Is the nudge schedule preview purely cosmetic, or should it show real times?** If real, we need to decide how to calculate them from the approved plan. *Owner: [NEEDS INPUT]*
3. **What's the fallback if Claude returns a plan that can't be parsed into sections?** The current `<pre>` fallback may look broken in a demo. Should we define a minimum acceptable format? *Owner: Engineering*
4. **Should the edit flow on Plan Review allow structured edits (per section) or just free-text editing of the whole plan?** Structured editing is more work but far better UX. *Owner: [NEEDS INPUT]*
5. **Is there a v1 success gate?** What needs to be true for this capstone to be considered "shipped"? *Owner: [NEEDS INPUT]*

---

### 9. Success Metrics

**Leading Indicators (early signals — visible during the capstone)**

- Plan approval rate: % of generated plans approved on first generation (target: ≥75%)
- Regeneration rate: % of sessions where the user regenerates more than once (target: ≤20%)
- Stream engagement: Do users wait for the stream to finish, or abandon mid-generation? (qualitative)
- Demo reaction: Do observers ask "how do I get this?" (qualitative signal of perceived value)

**Lagging Indicators (post-capstone, if pursued further)**

- Week-2 retention: % of users who return and complete a second week of daily plans
- Completion rate: % of approved plans that users mark as completed (requires future session state)
- Reduction in self-reported Monday Restart Cycle: surveyed 4 weeks after first use
- NPS from user test participants post-demo

---

*Review the [ASSUMPTION] and [NEEDS INPUT] sections before sharing with engineering.*

---

## User Stories

---

**Story 1:** As a busy professional, I want to log how I'm feeling each morning so that my daily health plan reflects my actual state, not a generic template.

**Acceptance Criteria:**
- Given I open the app, when the check-in screen loads, then I see fields for energy level, sleep quality, mood, and today's goal — all required before I can proceed.
- Given I'm on the check-in screen, when I try to submit with any field empty, then I see an inline error and cannot proceed.
- Given I complete all fields, when I tap Submit, then the app moves to the next step with my inputs preserved for plan generation.

**Priority:** Must-have
**Effort:** Small (< 1 day)

---

**Story 2:** As a busy professional, I want to see a summary of my recent Strava activity before my plan is generated so that I know the AI is accounting for what I've already done.

**Acceptance Criteria:**
- Given I've completed the check-in, when the Strava preview loads, then I see at least one recent activity with its type, duration, and distance.
- Given the Strava preview is displayed, when I click Continue, then the app proceeds to plan generation without losing my check-in data.
- Given no Strava activity exists for yesterday, when the preview loads, then I see a "No recent activity found" message rather than an error or blank screen.

**Priority:** Should-have
**Effort:** Small (< 1 day)

---

**Story 3:** As a busy professional, I want to watch my personalized plan appear word-by-word so that I feel engaged and trust that it's being built specifically for me.

**Acceptance Criteria:**
- Given I've passed the Strava step, when the generating screen loads, then tokens begin appearing on screen within 2 seconds.
- Given the stream is in progress, when new tokens arrive, then the UI updates smoothly without flickering or full page re-renders.
- Given the stream completes, when the full plan is received, then the app automatically transitions to the review screen.
- Given the Claude API returns an error, when generation fails, then I see a clear error message and a Retry button — not a blank screen.

**Priority:** Must-have
**Effort:** Medium (2–3 days)

---

**Story 4:** As a busy professional, I want to approve, edit, or regenerate my plan before committing to it so that I only follow through on something I actually believe in.

**Acceptance Criteria:**
- Given I'm on the review screen, when the plan contains `## section` headers and `- bullet` items, then each section renders as a distinct color-coded card.
- Given I'm on the review screen, when I click Approve, then the plan is locked and I'm taken to the confirmation screen.
- Given I'm on the review screen, when I click Regenerate, then the app returns to the generating step and streams a new plan using my original check-in inputs.
- Given I'm on the review screen, when I edit text inline, then my changes are preserved when I click Approve.
- Given the plan cannot be parsed into sections, when the review screen loads, then the plan is displayed as readable plain text rather than broken UI.

**Priority:** Must-have
**Effort:** Medium (2–3 days)

---

**Story 5:** As a busy professional, I want to see a locked confirmation of my approved plan with a nudge schedule so that I have a clear commitment and know when to expect reminders.

**Acceptance Criteria:**
- Given I've approved my plan, when the confirmation screen loads, then I see the full plan in read-only format.
- Given the confirmation screen is visible, when I scroll down, then I see a nudge schedule preview showing times keyed to plan sections (e.g., "Morning check: 7:00 AM").
- Given the confirmation screen is visible, when I tap Start Over, then the app resets to the check-in screen with all fields cleared.

**Priority:** Must-have
**Effort:** Small (< 1 day)

---

**Story 6:** As a busy professional, I want to log how my day actually went each evening so that I can reflect on consistency and build momentum over time.

**Acceptance Criteria:**
- Given I've approved a plan earlier in the day, when I open the app in the evening, then I see an evening summary screen prompting me to reflect.
- Given I'm on the evening summary screen, when I mark each plan section as done or skipped, then the app shows a completion summary (e.g., "3 of 4 completed").
- Given I've submitted my evening reflection, when the summary is shown, then I see a short encouraging message tailored to my completion rate.
- Given I haven't approved a plan today, when I open the app in the evening, then I see a prompt to do a quick check-in rather than the reflection screen.

**Priority:** Should-have
**Effort:** Large (1 week+) `[NEEDS CLARIFICATION]` — requires session persistence or local storage; not possible without at least browser-based state management.

---

## Edge Cases to Discuss

- **No check-in submitted yet:** What does the app show if someone opens it mid-day for the first time? Should there be an abbreviated "late start" check-in flow?
- **Regeneration loop:** If a user regenerates 3+ times and still isn't satisfied, should the app offer a manual edit mode or a "skip today" option to avoid frustration?
- **Strava shows intense recent activity:** If yesterday's mock data shows a long hard ride, should the plan automatically reduce intensity — or should the user confirm this preference first?
- **Evening summary without persistence:** In v1 with no backend, refreshing the page loses the approved plan. The evening summary story is effectively blocked until local storage or session persistence is in place.
- **Mobile viewport:** The streaming plan view and card-based review screen haven't been tested on small screens. Cards may stack awkwardly or the stream may feel cramped on a 375px viewport.

---

## Questions for the Team

1. **Evening summary in v1 or v2?** The feature requires at minimum `localStorage` persistence to know what plan was approved. Is that in scope for the capstone, or should this story be explicitly deferred to v2?
2. **Nudge schedule — cosmetic or functional?** The confirmation screen shows a nudge preview. Should these times be calculated dynamically from the plan content, or are they static placeholders for the demo?
3. **Inline editing scope:** Should users be able to edit individual bullets within a section, or replace the full plan text? Bubble-level editing is significantly more complex than a single textarea.
4. **Regeneration with context:** When a user regenerates, should they be able to tell Claude *why* ("too intense", "no gym today") — or does it silently reuse the same check-in inputs?
5. **What defines "done" for evening summary?** Is a checkbox per section sufficient, or does the user need to log actual output (time spent, distance, perceived effort)?
