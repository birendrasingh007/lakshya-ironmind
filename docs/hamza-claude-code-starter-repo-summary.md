# hamzafarooq/claude-code-starter — Repo Summary

> Source: https://github.com/hamzafarooq/claude-code-starter
> Analysed: 2026-04-18

---

## 1. Product Overview

`claude-code-starter` is the official companion repository for **"Claude Code in Practice"** — a hands-on Maven course taught by Hamza Farooq (Founder at Traversaal.ai, ex-Google, UCLA Anderson). The repo ships everything a student needs: module guides, assignments, CLAUDE.md templates, reusable skills, slash commands, and pre-built sub-agents. Each module builds on the last, taking students from setting up their first CLAUDE.md file all the way to running automated multi-agent pipelines that do competitor research, generate PRDs, and review specs — in a single prompt.

---

## 2. Problem It Solves

Product managers traditionally have no way to ship software without filing engineering tickets and waiting weeks. They also can't read unfamiliar codebases or automate repeatable knowledge work like writing PRDs and user stories. This repo gives PMs a structured, guided path to doing all of that themselves using Claude Code — with scaffolded assignments and pre-built tools so they're never starting from a blank page.

---

## 3. Who It's For

Non-technical product managers (and adjacent roles) who want to prototype, ship, and maintain real software products using Claude Code — without needing an engineering background.

---

## 4. How It Works (Non-Technical)

- You clone the repo, open a module folder, and follow the `README.md` assignment guide for that module.
- You install "skills" — pre-written prompt templates you trigger with a `/command` (e.g. `/prd-generator`) — directly into your Claude Code workspace.
- In later modules you build "sub-agents" — specialist AI instances Claude automatically hands work off to for things like research, code review, and copywriting.
- By Module 3 you chain those agents into a pipeline: one prompt triggers competitor research → PRD writing → spec review, all automatically.

---

## 5. Architecture Overview

- **Module-based layout**: each module lives in `module-N/` with its own `README.md`, `CLAUDE-template.md`, `.claude/skills/`, `.claude/commands/`, and `.claude/agents/` directories — fully self-contained.
- **Skills** (`.claude/skills/<name>/SKILL.md`): prompt-template files that Claude Code runs when you type `/command-name`; they share the main conversation context.
- **Sub-agents** (`.claude/agents/<name>.md`): isolated Claude instances with their own model, tools, and instructions; triggered automatically by Claude based on request matching, not by the user.
- **Browser automation via MCP**: Module 2 uses Brave MCP (not code) so Claude can browse live GitHub repos and YouTube URLs in real time during a conversation.

---

## 6. Key Technologies

| Technology | Role |
|---|---|
| **Claude Code CLI** (`@anthropic/claude-code`) | The AI assistant that reads files, runs skills, and delegates to agents — the core runtime for everything in this course |
| **CLAUDE.md** | Project context file that persists instructions, stack details, and preferences across Claude sessions |
| **Brave MCP** | Live browser protocol used in Module 2 to let Claude visit and read real web pages without writing scraping code |
| **Playwright** | Browser automation library mentioned in comparison docs; used externally but not implemented in this repo |
| **Node.js** | Required to install Claude Code via npm; no application code in the repo itself uses Node directly |
| **Maven** | Platform hosting the live cohort course; repo links to enrollment page throughout |

---

## 7. Notable Design Decisions

1. **No application code — only prompts and templates.** The repo contains zero Python, JS, or backend code. Every "deliverable" is a Markdown file that Claude Code interprets. This keeps the course accessible to non-engineers but means nothing here is deployable without Claude Code running.
2. **Skills vs. sub-agents are explicitly distinguished.** The README dedicates a full table to the difference (user-invoked vs. Claude-invoked, shared vs. isolated context). This is a pedagogical choice — most course repos wouldn't surface that distinction, but it's load-bearing for Module 3.
3. **Three real shipped apps are linked, not included.** `word-humanizer`, `seo-writer`, and `linkedin-growth` are separate repos — the course shows outputs but doesn't teach students to maintain production apps from within this repo, keeping scope contained.

---

## 8. How to Run It

1. Install Node.js (LTS) from nodejs.org
2. `npm install -g @anthropic/claude-code`
3. Set your API key: `export ANTHROPIC_API_KEY=sk-ant-...` (or subscribe to Claude Max at claude.ai/upgrade)
4. `git clone https://github.com/hamzafarooq/claude-code-starter.git && cd claude-code-starter/module-1`
5. Run `claude` — then open `module-1/README.md` for your first assignment

---

## 9. What's Missing or Incomplete

- **No tests or CI.** Nothing validates that skills or agent files are well-formed — a broken `SKILL.md` silently fails until a student runs it.
- **Brave MCP setup is not documented here.** Module 2 depends on it, but the repo assumes students get the setup instructions in class; the README only mentions it without setup steps.
- **Apps are external and not maintained in sync.** The three "built with Claude Code" apps are separate repos — there's no guarantee they match course content or are kept up to date as Claude Code evolves.

---

## 10. One-Line Summary

A structured course repo that teaches non-technical PMs to ship real products using Claude Code skills and sub-agents.
