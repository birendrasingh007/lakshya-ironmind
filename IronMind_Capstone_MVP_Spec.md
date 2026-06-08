IronMind Reset Cohort: 1-Page MVP Spec
Status: LOCKED for Capstone (June 26)

What It Does
IronMind converts daily stress into one tiny personalized reset action, then makes consistency visible through private friend accountability. When a user checks in with their stress level, energy, available time, and trigger, an AI agent recommends a single 2-10 minute reset matched to their exact state. They complete it (or skip it), and only their completion status—not their stress score or triggers—becomes visible to their private cohort.
Core thesis: Stress → AI-Recommended Action → Accountability Loop

Who Uses It
Primary user: Birendra (solo demo)
Demo cohort: Active Bhidus friends (Sukanya, Babu, Bhaskar, Adarsh, Shashank) + 1-2 additional friends
Target persona: 35-45 year old busy adult managing high stress, juggling multiple roles, wants consistency but abandons apps when life gets busy

Concrete User Story
It's Tuesday 2 PM. Bhaskar just had a hard conversation with his boss. He checks in: stress 8/10, low energy, 5 minutes available, trigger = work deadline. AI recommends 2-minute box breathing. Bhaskar completes it, marks it helpful. His Active Bhidus cohort sees: ✅ Bhaskar completed today's reset. No raw stress data. No triggers. Just: he showed up.

4 Core Screens (Must-Have for June 26)
ScreenPurposeWhat User Sees/checkinCapture daily stress state4 inputs: Stress 1-10, Energy (Low/Med/High), Time available (2/5/10 min), Trigger (Work/Family/Body/Sleep/Unknown) → [Generate Reset] button/resetDisplay AI-recommended actionReset title, duration, why this reset, step-by-step instructions, [Done] [Skip] [Regenerate] buttons/completeCapture completion feedback"Did it help?" → Yes / No / Not sure → Submit/cohortShow private group progressCohort name, this week's progress (X/Y resets completed), today's status (✅ Completed / ⏳ Pending) for each member, team nudge message, emoji reactions (💪 🔥 🎉 ❤️)

What It Does NOT Do (Out of Scope)
❌ No meditation content library
❌ No Spotify integration
❌ No YouTube video embeds
❌ No voice guidance / Claude TTS
❌ No HRV data integration
❌ No panic de-escalation protocols
❌ No real authentication system
❌ No push notifications
❌ No mobile app (web only)

Reset Types (Examples, AI-Generated Per User State)
ConditionResetDurationStress 8-10 + low time + work triggerBox breathing + grounding2 minStress 7-10 + body tension triggerShoulder/neck release3 minLow energy + medium stressGentle walk + reflection5 minHigh stress + 10 min availableBreathing + journaling prompt5 minMedium stress + medium energyMobility flow5 min
AI varies resets based on user history (what they've completed before).

3 Agents (Agentic Loop)
AgentModelInputOutputstress-checkin-agentHaikuStress, energy, time, triggerValidated state summaryreset-plan-agentSonnetStress state + user historyOne reset (JSON: title, steps, why, duration)cohort-nudge-agentHaikuCohort progress + member statusTeam encouragement message

Data Model (Simple)
Users: id, name, cohort_id, is_demo

StressCheckins: user_id, date, stress_score, energy, time_available, trigger

ResetPlans: user_id, date, reset_title, reset_json, duration_mins, reasoning

ResetLogs: user_id, date, status (done/skipped/too_hard), helped (yes/no)

CohortMembers: cohort_id, user_id, display_name

CohortProgress: cohort_id, date, completed_count, total_members

Success Criteria (June 26 Demo)
✅ User completes stress check-in
✅ AI generates one reset matched to state
✅ User marks done/skipped + helpful/not helpful
✅ Cohort dashboard shows all 5 demo members + safe progress (only completion status visible)
✅ Live demo runs smoothly (or backup video plays)
✅ Can explain 3-agent architecture
✅ Can articulate thesis: "Stress → tiny action → accountability"

🎯 Stretch Goal (v1.5 / Post-Capstone)
If time permits (unlikely):

✨ /summary screen: "You completed box breathing at stress 8, marked it helpful"
✨ user-pattern.md: Track what resets work for each user
✨ summary-agent: Generates personalized "tomorrow's reset" suggestion based on learning
✨ Evening learning loop: Agent adapts tomorrow's recommendation based on today's feedback

Decision: Build this ONLY if Phase 1-2 ships by June 15 with time left. Record it as stretch goal for Hamza to see roadmap thinking.

One-Liner for Capstone
"I built IronMind so that Sukanya can stay consistent on stress resets through private friend accountability — instead of abandoning apps when life gets busy."
