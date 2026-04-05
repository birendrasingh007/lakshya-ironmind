# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lakshya-ironmind** is a Personalized Health & Habit Co-Pilot — a React + Tailwind + Claude API prototype that demonstrates the core AI Plan Generation + Human Approval workflow.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

## Setup

Copy `.env.example` to `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

The API key is exposed to the browser via `dangerouslyAllowBrowser: true` — this is intentional for prototype use only.

## Architecture

**Single-page React app** (Vite + Tailwind). No router, no backend.

**5-step flow managed in `src/App.jsx`:**
1. `checkin` → `src/components/CheckIn.jsx` — energy/sleep/mood/goals form
2. `strava` → `src/components/StravaPreview.jsx` — mock Strava data display
3. `generating` → `src/components/Generating.jsx` — streams Claude response in real-time
4. `review` → `src/components/PlanReview.jsx` — approve / edit / regenerate
5. `approved` → `src/components/Confirmation.jsx` — locked plan + nudge schedule preview

**Claude API call** lives entirely in `src/api/claude.js`. It uses streaming (`client.messages.stream`) with `claude-opus-4-6` so the user sees the plan build token-by-token. The `onChunk` callback updates React state on each delta event.

**Mock Strava data** is defined inline in `App.jsx` (`MOCK_STRAVA`). Replace with a real Strava OAuth integration when moving beyond prototype.

**Plan parsing** in `PlanReview.jsx`: Claude returns `## section` headers and `- bullet` items. `parsePlan()` splits this into structured sections rendered as color-coded cards. Falls back to raw `<pre>` text if parsing yields nothing.
