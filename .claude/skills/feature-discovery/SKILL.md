---
name: feature-discovery
description: Interview the developer to turn a vague feature idea into a concrete, structured list of use cases and features, then write a discovery PRD + checklist into docs/specs/. Use when the idea is too fuzzy to write a spec directly, for either a new feature on an existing app or a brand-new app/package.
argument-hint: '[idea]'
metadata:
  version: '1.0.0'
---

# Feature Discovery

A guided interview that turns a vague feature idea into a clear, structured feature list — the seed for spec-driven implementation. This skill is discovery only: it does not prioritize/scope features (no MoSCoW, no MVP cuts) and does not author a full technical spec beyond the lightweight output described below.

## When to Use

- The developer has a rough idea for a new feature on an existing app (`apps/*`) but can't articulate the use cases yet.
- The developer wants to scope a brand-new app or package before any code exists.
- Explicitly invoked (e.g. `/feature-discovery`).

## Interview Flow

Act as an interviewer. Ask **one question at a time** and wait for the reply before moving on. Do not skip ahead or answer multiple steps at once.

1. **THE IDEA** — Ask the developer to describe the core idea and what problem it solves.
2. **THE SCOPE** — Ask whether this targets an existing app under `apps/*` (which one) or a brand-new app/package. If an existing app, read that app's relevant code and its section of `docs/conventions.md` before continuing, so later questions are grounded in what's actually there rather than generic.
3. **THE USE CASES** — Based on the idea and repo context, propose 3 candidate use cases. Ask the developer to choose, refine, or combine them.
4. **USER STORIES** — Write 3-4 Agile user stories ("As a... I want to... so that...") for the chosen use case(s). Ask for feedback and revise.
5. **GROUNDING CHECK** — Ask whether this needs any external tools/APIs/integrations, or whether it should rely purely on what's already in the repo (existing conventions, existing code, existing packages). Default assumption: no new external dependencies — reference what already exists.

## Output

After the interview, compile the results and write two files under `specs/<kebab-case-slug>/` (slug derived from the idea)
Do not write implementation code as part of this skill — its job ends at producing the discovery artifacts.
