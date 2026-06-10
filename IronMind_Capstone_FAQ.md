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
