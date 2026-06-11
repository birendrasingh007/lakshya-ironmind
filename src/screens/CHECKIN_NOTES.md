# /checkin Component - Decision Log

## Architecture Decision 1: Why useState for Form State?

**Alternative:** Redux, Zustand, Context API

**Decision:** useState

**Reasoning:**
- Single form component, simple state (4 fields: stress, energy, time, trigger)
- Redux/Zustand is overkill for MVP
- useState is React standard for form-level state
- Post-capstone: If app scales to 10+ screens sharing state, migrate to Context/Zustand

**Interview answer:** "useState is sufficient for a single form with local state. As the app grows and multiple screens need access to the same data, I'd migrate to Context API or Zustand to avoid prop drilling."

---

## Architecture Decision 2: Client-Side Validation BEFORE Backend

**Why validate twice?**

1. UX: Immediate feedback (no API round-trip for dumb errors like stress > 10)
2. Security: Backend ALWAYS validates again (never trust client)
3. Cost: Cheap validation (range check) prevents wasted API calls

**Interview answer:** "Defense in depth. Client validation is for user experience. Server validation is for security. Never trust client input."

---

## Architecture Decision 3: Why Four Separate Handlers?

**Alternative:** One generic handler

**Decision:** Separate handlers (handleStressChange, handleEnergyChange, handleTimeChange, handleTriggerChange)

**Reasoning:**
- Each input type is different (event object vs direct value)
- Stress slider: event.target.value → parseInt
- Energy/Trigger buttons: direct string value
- Time dropdown: event.target.value → parseInt
- Separate = clean, single responsibility, easier to debug

**Interview answer:** "Single responsibility principle. Each handler does one job. If logic gets complex, easier to extend one handler vs a generic one."

---

## Architecture Decision 4: Why async/await for API Call?

**Alternative:** .then() promises

**Decision:** async/await

**Reasoning:**
- Cleaner, more readable than .then() chains
- Easier to follow control flow (reads top-to-bottom)
- Better error handling (try/catch vs .catch())

**Interview answer:** "async/await is syntactic sugar over Promises. More readable. Modern standard in Node/React."

---

## Component Structure
State (useState)
↓
Handlers (update state on user input)
↓
handleSubmit (form submission, API call)
↓
JSX (UI that binds to state + handlers)
---

## Testing Notes

- [ ] Stress slider works (1-10)
- [ ] Energy buttons toggle correctly
- [ ] Time dropdown changes
- [ ] Trigger buttons select
- [ ] Submit button disabled while loading
- [ ] Error message shows if validation fails
- [ ] Console shows API call when submit clicked (will fail until backend built - expected)

---

## Interview Prep

**Q: "What would you change if users complained the form is too long?"**

A: "I'd prioritize the most critical field (stress_score). Move energy/time to a second screen if needed. Or use progressive disclosure: show stress first, reveal others as needed."

**Q: "Why not use a library like Formik for form state?"**

A: "Formik is great for complex forms with 20+ fields and validation rules. For a 4-field MVP, it's overkill. I'd adopt it post-capstone if form complexity grows."

**Q: "What if the stress value is submitted as a string instead of number?"**

A: "parseInt() protects against that. If backend sends string, we parse to number. If parsing fails, NaN, and validation catches it."

---

## Lessons Learned (Update as we test)

- [ ] Lesson 1: [TBD]
- [ ] Lesson 2: [TBD]