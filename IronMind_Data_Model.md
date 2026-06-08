markdown# IronMind Reset Cohort: Data Model & Architecture

**Status:** LOCKED for Capstone (June 26)  
**Last Updated:** June 8, 2026  
**Owner:** Birendra Singh

---

## Overview

This document defines the data model for IronMind's Wheel 3 (Mental Health) capstone MVP. The schema is designed to be **merge-ready**: it can absorb Wheels 1 (Activity) and 2 (Nutrition) without restructuring.

**Core principle:** One unified daily check-in (`DailyState`) feeds all wheels' planning agents and evening summaries.

---

## Design Philosophy

### Current (Capstone)
User checks in once per day (Wheel 3 only)
↓
DailyState captures: stress, energy, time, trigger
↓
ResetPlan generates one reset recommendation
↓
ResetLog captures: did user complete it? Did it help?
↓
CohortProgress shows: who did it today? Team nudge

### Future (Post-Capstone)
User checks in once per day (All wheels)
↓
DailyState captures: stress + activity + nutrition + energy + time
↓
Three planning agents run in parallel:
├─ ResetPlan (Wheel 3)
├─ ActivityPlan (Wheel 1)
└─ NutritionPlan (Wheel 2)
↓
One evening summary shows all three plans & feedback

**Result:** No duplicate questions. No data silos. One unified check-in powers all wheels.

---

## Table Schema (Detailed)

### Table 1: Users

**Purpose:** User identities and cohort assignment
Column Name          | Type      | Constraints                    | Notes
─────────────────────┼───────────┼────────────────────────────────┼──────────────────
user_id              | UUID      | PRIMARY KEY                    | Unique user identifier
user_name            | VARCHAR   | NOT NULL, MAX 255              | Display name (e.g., "Birendra")
cohort_id            | UUID      | FOREIGN KEY → Cohorts          | Which cohort they belong to (nullable)
is_demo_user         | BOOLEAN   | DEFAULT false                  | Mark demo users for capstone
created_at           | TIMESTAMP | DEFAULT now()                  | User signup timestamp
updated_at           | TIMESTAMP | DEFAULT now(), auto-update     | Last profile update

---

### Table 2: DailyState (UNIFIED CHECK-IN)

**Purpose:** Captures user's daily state once. All wheels read from this table.
Column Name           | Type      | Constraints                    | Notes
──────────────────────┼───────────┼────────────────────────────────┼─────────────────────────────
daily_state_id        | UUID      | PRIMARY KEY                    | Unique per check-in
user_id               | UUID      | FOREIGN KEY → Users            | Which user checked in
check_in_date         | DATE      | COMPOSITE KEY (user_id, date)  | One row per user per day
energy_level          | ENUM      | (Low, Medium, High)            | Universal: all wheels need this
time_available_mins   | INT       | (2, 5, 10)                     | Universal: how much time today?
stress_score          | INT       | 1-10, nullable                 | Wheel 3: mental health input
stress_trigger        | VARCHAR   | Work/Family/Body/Sleep/Unknown | Wheel 3: why stressed?
activity_level        | ENUM      | (Easy, Moderate, Hard), NULL   | Wheel 1: future merge
nutrition_target_cals | INT       | nullable                       | Wheel 2: future merge
created_at            | TIMESTAMP | DEFAULT now()                  | When check-in was completed
updated_at            | TIMESTAMP | auto-update                    | When data was last updated
UNIQUE CONSTRAINT: (user_id, check_in_date)

**Key insight:** For capstone, only `stress_score` and `stress_trigger` are populated. `activity_level` and `nutrition_target_cals` stay NULL. When Wheels 1-2 launch, this table expands to capture all data in one check-in.

---

### Table 3: ResetPlans

**Purpose:** AI-generated reset recommendations (Wheel 3)
Column Name        | Type      | Constraints                    | Notes
───────────────────┼───────────┼────────────────────────────────┼────────────────────────────
reset_plan_id      | UUID      | PRIMARY KEY                    | Unique plan identifier
user_id            | UUID      | FOREIGN KEY → Users            | Who this plan is for
daily_state_id     | UUID      | FOREIGN KEY → DailyState       | Which check-in triggered this
plan_date          | DATE      | NOT NULL                       | When plan was generated
reset_title        | VARCHAR   | NOT NULL, MAX 255              | Plan name (e.g., "2-Minute Box Breathing")
reset_json         | JSON      | NOT NULL                       | {steps: [], why: "", follow_up: ""}
duration_mins      | INT       | (2, 3, 5, 10)                  | How long the reset takes
reasoning          | TEXT      | NOT NULL                       | Why this reset (e.g., "High stress + low time")
agent_name         | VARCHAR   | DEFAULT "reset-plan-agent"     | Which agent generated this
created_at         | TIMESTAMP | DEFAULT now()                  | Generation timestamp

**Example `reset_json`:**
```json
{
  "steps": [
    "Inhale for 4 counts",
    "Hold for 4 counts",
    "Exhale for 4 counts",
    "Hold for 4 counts",
    "Repeat 4 times"
  ],
  "why": "High stress (8/10) + low time (5 min). You need quick downshift, not 20-min meditation.",
  "follow_up": "I'll ask if this helped later."
}
```

---

### Table 4: ResetLogs

**Purpose:** Track whether user completed reset + if it helped (Wheel 3)
Column Name         | Type      | Constraints                    | Notes
────────────────────┼───────────┼────────────────────────────────┼──────────────────────
reset_log_id        | UUID      | PRIMARY KEY                    | Unique feedback entry
user_id             | UUID      | FOREIGN KEY → Users            | Who completed/skipped
reset_plan_id       | UUID      | FOREIGN KEY → ResetPlans       | Which plan they executed
log_date            | DATE      | NOT NULL                       | When they logged this
completion_status   | ENUM      | (done, skipped, too_hard)      | What happened
was_helpful         | ENUM      | (yes, no, not_sure), nullable  | Did it help?
user_notes          | TEXT      | nullable                       | Any additional context
created_at          | TIMESTAMP | DEFAULT now()                  | Feedback timestamp

---

### Table 5: Cohorts

**Purpose:** Define cohort groups (e.g., "IronMind June Capstone")
Column Name       | Type      | Constraints                    | Notes
──────────────────┼───────────┼────────────────────────────────┼──────────────────────
cohort_id         | UUID      | PRIMARY KEY                    | Unique cohort identifier
cohort_name       | VARCHAR   | NOT NULL, MAX 255              | Display name (e.g., "Active Bhidus")
cohort_owner_id   | UUID      | FOREIGN KEY → Users            | Who created the cohort
challenge_goal    | VARCHAR   | NOT NULL, MAX 500              | Goal (e.g., "20 resets in 30 days")
start_date        | DATE      | NOT NULL                       | Challenge start date
end_date          | DATE      | nullable                       | Challenge end date
created_at        | TIMESTAMP | DEFAULT now()                  | Cohort creation timestamp
updated_at        | TIMESTAMP | auto-update                    | Last update

---

### Table 6: CohortMembers

**Purpose:** Map users to cohorts (N:M relationship)
Column Name         | Type      | Constraints                    | Notes
────────────────────┼───────────┼────────────────────────────────┼──────────────────────
cohort_member_id    | UUID      | PRIMARY KEY                    | Unique membership entry
cohort_id           | UUID      | FOREIGN KEY → Cohorts          | Which cohort
user_id             | UUID      | FOREIGN KEY → Users            | Which user
display_name        | VARCHAR   | NOT NULL, MAX 255              | How they appear in cohort (e.g., "Bhaskar")
joined_at           | TIMESTAMP | DEFAULT now()                  | When they joined
UNIQUE CONSTRAINT: (cohort_id, user_id) — user can't join same cohort twice

---

### Table 7: CohortProgress

**Purpose:** Daily rollup of cohort completion metrics (read-time calculated)
Column Name              | Type      | Constraints                    | Notes
────────────────────────┼───────────┼────────────────────────────────┼──────────────────────
cohort_progress_id      | UUID      | PRIMARY KEY                    | Unique record per day per cohort
cohort_id               | UUID      | FOREIGN KEY → Cohorts          | Which cohort
progress_date           | DATE      | NOT NULL                       | Which date
completed_resets_count  | INT       | NOT NULL, DEFAULT 0            | Resets marked "done" today
total_members_count     | INT       | NOT NULL, DEFAULT 0            | Total members in cohort
team_nudge_message      | TEXT      | nullable                       | Encouragement message
team_nudge_sent_at      | TIMESTAMP | nullable                       | When nudge was sent
UNIQUE CONSTRAINT: (cohort_id, progress_date) — one row per cohort per day

**Note:** `completed_resets_count` is calculated at read time:
```sql
SELECT COUNT(*) 
FROM ResetLogs 
WHERE cohort_id = X 
AND log_date = progress_date 
AND completion_status = 'done'
```

---

## Data Model Diagram
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                      IRONMIND DATA MODEL                            │
│                   (Capstone + Merge-Ready)                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                          ┌──────────────┐
                          │    Users     │
                          │──────────────│
                          │ user_id (PK) │
                          │ user_name    │
                          │ cohort_id(FK)│◄──────┐
                          │ is_demo_user │       │
                          └──────┬───────┘       │
                                 │               │
                ┌────────────────┼───────────────────────┐
                │                │                       │
                │                │                       │
                ▼                ▼                       ▼
        ┌──────────────┐  ┌──────────────┐      ┌──────────────┐
        │ DailyState   │  │ ResetPlans   │      │CohortMembers │
        │──────────────│  │──────────────│      │──────────────│
        │daily_state_id│  │reset_plan_id │      │cohort_member │
        │user_id (FK)  │  │user_id (FK)  │      │cohort_id (FK)│
        │check_in_date │  │daily_state_id│──┐   │user_id (FK)  │
        │energy_level  │  │   (FK)       │  │   │display_name  │
        │time_available│  │plan_date     │  │   │joined_at     │
        │stress_score  │  │reset_title   │  │   └──────┬───────┘
        │stress_trigger│  │reset_json    │  │          │
        │activity_level│  │duration_mins │  │          │
        │nutrition_targ│  │reasoning     │  │          │
        │   (NULL)     │  │agent_name    │  │          │
        └──────┬───────┘  └──────┬───────┘  │          │
               │                 │          │          │
               │                 ▼          │          │
               │          ┌──────────────┐  │          │
               │          │  ResetLogs   │  │          │
               │          │──────────────│  │          │
               │          │reset_log_id  │  │          │
               │          │user_id (FK)  │  │          │
               │          │reset_plan_id─┘  │          │
               │          │  (FK)        │   │          │
               │          │log_date      │   │          │
               │          │completion_st│   │          │
               │          │was_helpful   │   │          │
               │          │user_notes    │   │          │
               │          └──────────────┘   │          │
               │                             │          │
               └─────────────────────────────┘          │
                                                        │
                          ┌─────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Cohorts    │
                   │──────────────│
                   │ cohort_id(PK)│
                   │ cohort_name  │
                   │cohort_owner_ │
                   │   id(FK)     │
                   │challenge_goal│
                   │start_date    │
                   │end_date      │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │CohortProgress│
                   │──────────────│
                   │cohort_progre-│
                   │   ss_id (PK) │
                   │ cohort_id(FK)│
                   │progress_date │
                   │completed_rst │
                   │total_members │
                   │team_nudge_msg│
                   └──────────────┘

---

## Foreign Key Relationships

### 1. Users → DailyState
- **Relationship:** One-to-Many
- **Meaning:** One user can have many daily check-ins (one per day)
- **Constraint:** `user_id` in DailyState → `user_id` in Users

### 2. DailyState → ResetPlans
- **Relationship:** One-to-One
- **Meaning:** One daily check-in triggers one reset plan
- **Constraint:** `daily_state_id` in ResetPlans → `daily_state_id` in DailyState

### 3. ResetPlans → ResetLogs
- **Relationship:** One-to-One
- **Meaning:** One plan gets one feedback entry (user either completes or doesn't)
- **Constraint:** `reset_plan_id` in ResetLogs → `reset_plan_id` in ResetPlans

### 4. Users → Cohorts (as owner)
- **Relationship:** One-to-Many
- **Meaning:** One user can own multiple cohorts (rare for capstone, but allowed)
- **Constraint:** `cohort_owner_id` in Cohorts → `user_id` in Users

### 5. Users ↔ Cohorts (via CohortMembers)
- **Relationship:** Many-to-Many
- **Meaning:** Many users can join many cohorts
- **Constraint:** Junction table `CohortMembers` links both

### 6. Cohorts → CohortProgress
- **Relationship:** One-to-Many
- **Meaning:** One cohort has one daily progress row per day
- **Constraint:** `cohort_id` in CohortProgress → `cohort_id` in Cohorts

---

## Capstone Implementation Notes

### What's Populated (Wheel 3 Only)
✅ Users: All fields
✅ DailyState: stress_score, stress_trigger, energy_level, time_available_mins
❌ DailyState: activity_level, nutrition_target_cals (NULL)
✅ ResetPlans: All fields
✅ ResetLogs: All fields
✅ Cohorts: All fields
✅ CohortMembers: All fields
✅ CohortProgress: All fields

### What's NOT Built (Deferred)
- Activity planning agents (Wheel 1)
- Nutrition planning agents (Wheel 2)
- Activity logs (Wheel 1)
- Nutrition logs (Wheel 2)
- Integration logic between wheels

### Read-Time Calculation (CohortProgress)
Do **NOT** pre-calculate `completed_resets_count`. Instead, query at read time:

```javascript
// When user clicks /cohort screen
const completedToday = await db.query(`
  SELECT COUNT(*) as count
  FROM ResetLogs
  WHERE cohort_id = ${cohortId}
  AND log_date = TODAY()
  AND completion_status = 'done'
`);

// Display in UI
updateCohortProgress(completedToday);
```

**Why:** Keeps things simple, no background jobs, real-time data.

---

## Future Roadmap: Wheels 1-2 Merge

### When Wheel 1 Launches
```diff
DailyState table:
  + activity_level (ENUM: Easy/Moderate/Hard)
  [Previously NULL, now populated by activity check-in]

/checkin form:
  + Ask: "What's your energy level?" (universal, already there)
  + Ask: "How much time do you have?" (universal, already there)
  + Ask: "What's your stress?" (Wheel 3, already there)
  + Ask: "What's your planned activity intensity?" (NEW, Wheel 1)

Three agents run in parallel:
  └─ reset-plan-agent (Wheel 3) reads stress_score, energy_level, time
  └─ activity-plan-agent (Wheel 1) reads activity_level, energy_level, time
  └─ (Nutrition planning deferred to Wheel 2)

Evening summary shows both:
  "You checked in at stress 8. AI suggested box breathing.
   You also reported easy activity today. AI adjusted your movement plan."
```

### When Wheel 2 Launches
```diff
DailyState table:
  + nutrition_target_calories (INT)
  [Previously NULL, now populated by nutrition check-in]

/checkin form:
  + Ask: All previous Qs
  + Ask: "What's your nutrition goal today?" (NEW, Wheel 2)

Three agents run in parallel:
  └─ reset-plan-agent (Wheel 3)
  └─ activity-plan-agent (Wheel 1)
  └─ nutrition-plan-agent (Wheel 2)

Evening summary shows all three:
  "Today: stress 8→box breathing, easy activity→walk, 2000 cal target→log meals."
```

---

## Table Creation Instructions

### Option A: AirTable (Recommended for Capstone)
1. Create AirTable base: `IronMind_Capstone`
2. Create 7 tables (one per sheet)
3. Define fields in each table (match column names above)
4. Add sample data (5-8 demo users from Active Bhidus)
5. Export as JSON for backup

### Option B: PostgreSQL
```sql
-- Run these migrations to create all tables
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  cohort_id UUID REFERENCES cohorts(cohort_id),
  is_demo_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ... [repeat for remaining 6 tables]
```

---

## Integration Points

### Phase 1 (Solo Loop)
- `/checkin` form creates `DailyState` row
- `reset-plan-agent` reads `DailyState`, creates `ResetPlans` row
- `/reset` screen displays `reset_json` from `ResetPlans`
- `/complete` form creates `ResetLogs` row

### Phase 2 (Cohort)
- `/cohort` screen queries `CohortMembers` + `ResetLogs`
- Read-time calculation of `completed_resets_count`
- Display team nudge from `CohortProgress`

### Phase 4 (Demo)
- Show live data in tables (AirTable or DB)
- Explain schema during capstone presentation
- Highlight merge-ready architecture (Wheels 1-2 slots are visible)

---

## References

- **Capstone MVP Spec:** `IronMind_Capstone_MVP_Spec.md`
- **Main PRD:** Notion doc (link your PRD here)
- **GitHub Repo:** `github.com/birendrasingh007/lakshya-ironmind`

---

**Version History**
- v1.0 (Jun 8, 2026): Initial schema, capstone-focused
