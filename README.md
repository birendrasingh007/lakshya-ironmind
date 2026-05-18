# 🛞 IronMind — Personalized AI Wellness Companion

> **Consistency beats talent.** An AI-powered accountability engine that adapts to your real life, nudges you at the right time, and learns from your patterns.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Lovable-blue?style=flat-square)](https://lakshya-mind-pilot.lovable.app/)
[![Full PRD](https://img.shields.io/badge/Full%20PRD-Notion-green?style=flat-square)](https://www.notion.so/IronMind-Personalized-AI-Wellness-Companion-2b4c3521993d808b9e50ec90feb60dd3?pvs=21)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

---

## 🚀 What is IronMind?

IronMind is **not another health app**. It's a **multi-agent AI system** that:

- 📊 **Reads your state** — Morning energy, available time, real constraints
- 🎯 **Generates realistic plans** — Not ideal plans, but plans that fit *your* life
- 🔔 **Nudges you smartly** — Right message, right time (not annoying, not too late)
- 🧠 **Learns from you** — Remembers your patterns, preferences, what works
- 🤝 **Brings accountability** — Solo apps fail; peer cohorts stick

Built for busy professionals (25–60) who know what to do but struggle with consistency.

---

## 📦 Current State: Module 1 (Activity Tracker)

**Status:** ✅ MVP Complete (April 2026)

### What's Built

4 specialized Claude Code agents working in sequence:

```
┌─────────────────┐
│ checkin-agent   │  (Haiku) — Your morning state
│ (Energy? Time?) │
└────────┬────────┘
         │
┌────────▼──────────────┐
│ plan-agent            │  (Sonnet) — Generate personalized plan
│ (Adapt to reality)    │
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│ [Human Approval]      │  You approve/edit/regenerate
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│ nudge-agent           │  (Haiku) — Smart reminders
│ (Time-aware nudges)   │
└────────┬──────────────┘
         │
┌────────▼──────────────────┐
│ summary-agent             │  (Sonnet) — Evening recap + learning
│ (Learn for tomorrow)      │
└───────────────────────────┘
```

### Key Features

| Feature | What It Does |
|---------|-------------|
| **Adaptive Planning** | Plans flex based on energy, time, constraints, previous effort, weekly progress |
| **Smart Nudging** | Context-aware reminders at optimal times (morning, midday, evening) |
| **Persistent Memory** | Learns your patterns over days/weeks/months (energy rhythms, intensity preferences) |
| **Human-in-the-Loop** | You control the plan: approve, edit, regenerate before executing |
| **Monthly History** | Tracks patterns over 30 days, generates milestone reports, seasonal trends |

### Tech Stack

- **AI Runtime:** Claude Code (Anthropic)
- **Models:** Claude Haiku 4.5 + Claude Sonnet 4.6
- **Frontend:** Lovable UI (React + Tailwind)
- **Backend:** Node.js + Vercel serverless
- **Memory:** Markdown files (persistent, git-friendly, privacy-first)
- **APIs:** Strava (coming Module 2), Calendar (future)

---

## 🗂️ Project Structure

```
lakshya-ironmind/
├── .claude/
│   ├── agents/                    # Sub-agent definitions
│   │   ├── checkin-agent.md
│   │   ├── plan-agent.md
│   │   ├── nudge-agent.md
│   │   └── summary-agent.md
│   └── memory/                    # Persistent agent memory
│       ├── checkin-agent/
│       ├── plan-agent/
│       ├── nudge-agent/
│       └── summary-agent/
├── frontend/                      # Lovable UI (React)
├── backend/                       # Node.js serverless functions
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md
│   ├── AGENTS.md
│   └── MEMORY.md
├── IronMind_Agents_Blueprint.md  # Agent design specs
├── IronMind_PRD_Complete.md      # Full product requirements
└── README.md                      # You are here
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- Claude API key ([get one here](https://console.anthropic.com/))
- Claude Code CLI (`npm install -g @anthropic/claude-code`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/birendrasingh007/lakshya-ironmind.git
   cd lakshya-ironmind
   ```

2. **Set up environment**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-[your-key]
   ```

3. **Create memory directories**
   ```bash
   mkdir -p .claude/memory/{checkin,plan,nudge,summary}-agent
   ```

4. **Start Claude Code**
   ```bash
   claude
   ```

5. **Test the agents**
   ```
   Morning check-in: I have 45 minutes, medium energy, 2 PM meeting.
   ```
   Claude should automatically delegate to `checkin-agent` and generate a plan!

---

## 📖 How It Works

### Agent Architecture

Each agent is a **self-contained Claude instance** with:
- **Description** — Trigger for automatic delegation
- **Model** — Right-sized for the task (Haiku for speed, Sonnet for reasoning)
- **Tools** — Only what it needs (Read, WebFetch, memory access)
- **Memory** — Persistent learning folder

### Memory System

Agents learn across sessions by storing markdown files:

```
.claude/memory/checkin-agent/
├── today.md              # Current check-in
├── week-history.md       # Last 7 days
├── month-history.md      # Last 30 days
└── patterns.md           # Energy/time trends

.claude/memory/plan-agent/
├── weekly-goals.md       # Current targets
├── strava-history.md     # Activity data
├── milestones.md         # Monthly/quarterly goals
├── today-plan.md         # Generated plan
└── progress-tracker.md   # Week-to-date
```

**Why markdown?**
- Human-readable (easy to debug)
- No database needed
- Agents can edit directly
- Git-friendly

### Workflow Example

**User:** "Morning check-in: Low energy, 30 minutes, no meetings"

**checkin-agent:**
```
Check-in Summary
- Energy: Low
- Time Available: 30 minutes
- Constraints: None
```

**plan-agent:**
```
Today's Plan
- Activity: 20-min gentle walk + 10-min stretching
- Duration: 30 minutes
- Intensity: Low (match your energy)
- Why: Recovery day after yesterday's effort

Progress Toward Weekly Goal
- Goal: 7000 steps/day
- Current: 4500 (need 2500 more)
- Suggestion: Evening walk after work
```

**User approves → nudge-agent sends reminders → summary-agent learns pattern**

---

## 🗺️ Roadmap

### Module 1: Activity Tracker ✅
**Status:** Complete (April 2026)
- Strava integration ⏳ (coming soon)
- Daily check-in, planning, nudging, summary

### Module 2: Nutrition 📍
**Timeline:** Q3 2026
- Food identification (Claude Vision)
- Withings scale integration
- Macro tracking + smart nudges
- New agents: `food-identifier-agent`, `nutrition-analyzer-agent`

### Module 3: Mental Health 🎯
**Timeline:** Q4 2026
- Stress check-in + breathing exercises
- Meditation + yoga flows
- **Group accountability cohorts** (the innovation)
- New agents: `stress-analyzer-agent`, `breathwork-guide-agent`, `cohort-nudge-agent`

---

## 🤝 Contributing

### For Developers

IronMind is **open for collaboration**. If you want to own a wheel or feature:

#### Wheel 2: Nutrition (Q3 2026)
*Looking for: Backend engineer + ML enthusiast*

- Food identification (Claude Vision fine-tuning)
- Macro estimation models
- Withings API integration
- Nutrition goal tracking

**What you'll learn:** Computer vision, biometric integration, API design, health data handling.

#### Wheel 3: Mental Health (Q4 2026)
*Looking for: Full-stack engineer + social product thinker*

- Cohort management system
- Group accountability features
- Meditation/yoga curation
- HRV analysis (optional deep-dive)

**What you'll learn:** Social product design, group dynamics, mental health considerations, real-time notifications.

### How to Contribute

1. **Read the PRD:** [Full Product Requirements (Notion)](https://www.notion.so/IronMind-Personalized-AI-Wellness-Companion-2b4c3521993d808b9e50ec90feb60dd3?pvs=21)
2. **Check issues:** Open issues on GitHub for tasks
3. **Pick a scope:** Entire agent, API integration, user flow, optimization, research
4. **DM to align:** `birendrasingh007@gmail.com` or find on LinkedIn
5. **No permission needed** — just alignment

### Contribution Ideas

- Own an entire agent (system prompt, testing, refinement)
- Build an API integration (Strava, Withings, Spotify)
- Design a user flow (cohort creation, group challenges)
- Optimize costs (better prompts, cheaper models)
- Research & POC (HRV stress detection, cohort dynamics)

---

## 📚 Documentation

- **[AGENTS.md](docs/AGENTS.md)** — Detailed agent specs, prompts, tools
- **[MEMORY.md](docs/MEMORY.md)** — Memory architecture, persistence patterns
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, data flow, integration points
- **[IronMind_Agents_Blueprint.md](IronMind_Agents_Blueprint.md)** — Complete agent design specs
- **[IronMind_PRD_Complete.md](IronMind_PRD_Complete.md)** — Full product requirements (also on [Notion](https://www.notion.so/IronMind-Personalized-AI-Wellness-Companion-2b4c3521993d808b9e50ec90feb60dd3?pvs=21))

---

## 🎬 Live Demo

**Lovable UI Prototype (Module 1):** [lakshya-mind-pilot.lovable.app](https://lakshya-mind-pilot.lovable.app/)

Features:
- Morning check-in form
- AI-generated plan display
- Plan approval/edit interface
- Evening summary view

---

## 🧠 Key PM Insight

**From Week 2 capstone learning:**

While automating repo analysis with Playwright, the browser crashed. Claude autonomously:
1. Tried Playwright 3x (failed)
2. Switched to raw GitHub fetch (partial)
3. Tried GitHub CLI (failed — not installed)
4. Fetched files directly (success)

**No instruction was given for fallbacks.**

This redefined how I think about AI:

> **Traditional AI:** Prompt → Output  
> **Agentic AI:** Goal → [Autonomous Problem-Solving] → Output

IronMind's agents don't follow scripts; they pursue goals and handle failures gracefully.

---

## 📊 Success Metrics

### Module 1 (Current)
- ✅ 4 agents working autonomously
- ✅ Memory persisting across sessions
- ✅ Human-in-the-loop approval working
- ⏳ Strava integration (in progress)
- ⏳ End-to-end demo ready for Apr 26 presentation

### Module 2 (Target)
- Users log meals 4+ days/week without friction
- Food plan adapts based on activity level
- Withings integration syncs daily

### Module 3 (Target)
- Users meditate/breathe 3+ days/week
- Cohort members report 65% higher follow-through
- Group challenges sustain engagement

---

## 🏗️ Built With

- [Claude Code](https://github.com/anthropics/anthropic-sdk-python) — AI agent runtime
- [Claude Haiku 4.5](https://www.anthropic.com/) — Fast, cost-efficient model
- [Claude Sonnet 4.6](https://www.anthropic.com/) — Reasoning, planning model
- [Lovable](https://lovable.dev/) — UI prototyping
- [Node.js](https://nodejs.org/) — Serverless backend
- [Vercel](https://vercel.com/) — Deployment

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Birendra Singh** (Veeru)  
*PM during the day, builder on weekends, dishwasher at home every night.*

- **Email:** birendrasingh007@gmail.com
- **GitHub:** [@birendrasingh007](https://github.com/birendrasingh007)
- **LinkedIn:** [Birendra Singh](https://linkedin.com/in/birendrasingh007)

---

## 💡 Inspired By

- Johann Hari's *Lost Connections* — Isolation as root cause
- James Clear's *Atomic Habits* — Small, consistent wins
- B.J. Fogg's *Behavior Design* — Motivation × Ability × Prompt
- Ferris's *The 4-Hour Body* — Measurement-driven self-optimization

---

## 🙏 Acknowledgments

- **Hamza Farooq** — Course instructor, mentor, believer
- **Gabriela de Queiroz** — Co-instructor, feedback
- **Friends and early users** — Babu, Bhaskar, Sankalan — validation and debugging

---

## 📞 Get Involved

**Have ideas? Want to build Wheel 2 or 3? Found a bug?**

- 📧 **Email:** birendrasingh007@gmail.com
- 🔗 **Notion PRD:** [Full requirements](https://www.notion.so/IronMind-Personalized-AI-Wellness-Companion-2b4c3521993d808b9e50ec90feb60dd3?pvs=21)
- 🌐 **Live Demo:** [Lovable](https://lakshya-mind-pilot.lovable.app/)
- 💬 **GitHub Issues:** [Open an issue](https://github.com/birendrasingh007/lakshya-ironmind/issues)

---

**Built April 2026 · Capstone: Claude Code in Practice (Hamza Farooq, Maven)**

*"Health is not a destination. It's a practice."*
