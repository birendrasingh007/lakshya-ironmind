# /reset Component - Decision Log

## Architecture Decision 1: Why Separate Screen?

**Alternative:** Show reset inline on /checkin screen

**Decision:** Separate `/reset` screen

**Reasoning:**
- User needs to READ the plan, understand steps, prepare mentally
- Three distinct actions: Done, Skip, Regenerate (deserves its own UX)
- Screen state separate from form state (cleaner logic)
- Post-capstone: Can add animations, timer, guidance on /reset

**Interview answer:** "Separation of concerns. /checkin collects input. /reset displays output and captures action. Cleaner component architecture."

---

## Architecture Decision 2: Regenerate Button Behavior

**Alternative:** Show 3 options upfront like "Option A, B, C"

**Decision:** Show one plan, let user regenerate for different plan

**Reasoning:**
- Stressed user = decision fatigue. One good option > 3 choices
- Regenerate calls same agent with same input (might repeat, that's OK)
- Post-capstone: Add rejection_history to prevent repeats

**Interview answer:** "UX design for stress. One personalized option beats multiple generic options. Regenerate lets user explore without overwhelming."

---

## Component Structure

/reset screen displays:

Reset title + duration
Why this reset (reasoning)
Steps (numbered list)
Follow-up message
Buttons: [Done] [Skip] [Regenerate]

---

## State Flow

- Receives reset plan from backend (via URL params or Context - TBD)
- Displays it
- User clicks button → sets completion action
- Navigate to /complete screen

---

## Testing Checklist

- [ ] Reset plan displays correctly
- [ ] Buttons are clickable
- [ ] Regenerate calls backend (show spinner)
- [ ] Steps display in numbered list
- [ ] Styling matches /checkin (purple gradient, white card)

---

## Post-Capstone TODOs

- [ ] Add rejection_history to reset-plan-agent
- [ ] Add timer widget (countdown 2 min while doing reset)
- [ ] Add animations (fade in steps as user reads)
- [ ] Add audio cues (bell at end of timer)