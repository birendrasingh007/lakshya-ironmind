# /complete Component - Decision Log

## Architecture Decision 1: Why Separate Feedback Screen?

**Alternative:** Show feedback buttons on /reset screen itself

**Decision:** Separate `/complete` screen

**Reasoning:**
- User focuses on ONE action: feedback (not distracted by reset content)
- Clear UX flow: Read plan → Do reset → Give feedback (3 stages)
- Feedback data separate from reset data (cleaner schema)

**Interview answer:** "Separation of concerns. Each screen has one job. Reduces cognitive load."

---

## Architecture Decision 2: Why Wait 1.5 Seconds Before Navigation?

**Alternative:** Navigate immediately

**Decision:** Wait 1.5 seconds after success message

**Reasoning:**
- User sees confirmation (✅ Thanks for the feedback!)
- Feels satisfying, not robotic
- Gives brain time to process action
- User expects a pause before next screen

---

## Feedback Data

Captures:
- reset_plan_id (which reset)
- completion_status: "done" or "skipped"
- was_helpful: "yes", "no", or "not_sure"

This trains reset-plan-agent on personalization.

---

## Testing Checklist

- [ ] [Done] button → /complete screen
- [ ] [Skip] button → /complete screen
- [ ] Feedback buttons clickable
- [ ] POST to /api/reset-feedback works
- [ ] Success message shows
- [ ] Auto-navigate back to /checkin after 1.5s