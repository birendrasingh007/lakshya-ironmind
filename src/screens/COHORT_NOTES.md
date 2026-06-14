# /cohort Component - Decision Log

## Architecture Decision 1: Why Show Only Completion %?

**Alternative:** Show stress scores, reset types, triggers

**Decision:** Show ONLY completion % (name + completion bar)

**Reasoning:**
- Psychological safety: Users see "consistency," not "who's more stressed"
- Accountability without shame: "You showed up" beats "Your stress is high"
- Privacy-first: Stress is personal. Consistency is team.
- Prevents comparison spiral: Users don't judge each other's struggles

**Interview answer:** "I made a deliberate privacy-first choice. Raw stress data invites judgment. Completion % celebrates showing up, which builds team culture."

---

## Architecture Decision 2: Why Hardcode Demo Data?

**Alternative:** Query AirTable for real user data

**Decision:** Hardcode demo members in backend

**Reasoning:**
- MVP speed: No need to build user auth yet
- Shows product vision: 5-8 team members, completion bars, team message
- Real data comes in Phase 3+
- Easier testing: Consistent, predictable demo

---

## Architecture Decision 3: Why Call cohort-nudge-agent?

**Alternative:** Static message ("Great work team!")

**Decision:** AI-generated, context-aware team message

**Reasoning:**
- Agents show power: Claude understands team dynamics
- Personalization: Message changes based on actual performance
- Capstone showcase: Demonstrates multi-agent orchestration
- Real value: Team feels seen, not generic

---

## Component Structure

States:
- `members`: List of team members with completion %
- `teamMessage`: AI-generated motivation text
- `teamEmoji`: Emoji from agent (💪 🔥 🎉 ❤️)
- `loading`: Spinner while fetching
- `error`: Error message if backend fails

useEffect:
- Runs once on mount
- Calls GET /api/cohort
- Populates state with response

---

## Testing Checklist

- [ ] /cohort loads (see spinner briefly)
- [ ] Members display with names + % bars
- [ ] Team message shows with emoji
- [ ] Back button navigates correctly
- [ ] Error handling if backend fails

---

## Post-Capstone TODOs

- [ ] Real user data (query AirTable instead of hardcoding)
- [ ] User auth (know which cohort user belongs to)
- [ ] Leaderboards (weekly/monthly trends)
- [ ] Private team messaging