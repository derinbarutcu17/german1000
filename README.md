# German 1000 — design audit

This repository contains the German 1000 learning website source plus an evidence-backed product, UX, visual, accessibility, content, and implementation audit.

## Release verdict

**Needs changes before release.** The visual system is coherent and the core concept is promising, but the audit found several user-facing blockers:

- Completing “I know it” skips the next rank and can leave the daily set in an invalid state.
- Returning users can trigger a React hydration error because progress is read from `localStorage` during initial render.
- The 1,000-word dataset contains representative gloss and example problems that need editorial review.
- The four main views are client-side tabs without URL state, deep links, or browser-history behavior.
- Progress, quiz feedback, and answer choices need stronger screen-reader semantics.
- “Show all 1,000” renders roughly 1,000 cards and 6,000 controls at once.
- A 280px viewport has horizontal overflow, and motion has no reduced-motion path.

The complete issue register and evidence are in [`docs/design-audit.md`](docs/design-audit.md).

## Start the site locally

Use Node.js `22.13.0` or newer:

```bash
npm ci
npm run dev
```

The main interface is in [`app/page.tsx`](app/page.tsx), styling is in [`app/globals.css`](app/globals.css), and vocabulary data is in [`app/words.ts`](app/words.ts).

The original project notes are preserved in [`docs/original-project-readme.md`](docs/original-project-readme.md). The public audit copy redacts the source archive’s deployment project identifier from `.openai/hosting.json`; configure your own hosting project before deployment.

## Audit documents

- [`docs/design-audit.md`](docs/design-audit.md) — executive assessment, scored lenses, detailed findings, evidence, and limitations.
- [`docs/priority-backlog.md`](docs/priority-backlog.md) — ordered fix backlog with acceptance criteria.
- [`docs/ui-overhaul-implementation-plan.md`](docs/ui-overhaul-implementation-plan.md) — detailed architecture, milestones, file map, state contracts, test plan, and release gates for the UI/experience overhaul.
- [`docs/design-system-proposal.md`](docs/design-system-proposal.md) — proposed tokens, primitives, states, responsive rules, and motion guidance.
- [`docs/interaction-state-matrix.md`](docs/interaction-state-matrix.md) — surface-by-surface state and behavior inventory.
- [`docs/content-audit.md`](docs/content-audit.md) — vocabulary and editorial-risk review.
- [`docs/flow-map.md`](docs/flow-map.md) — current information architecture and recommended navigation model.
- [`docs/verification.md`](docs/verification.md) — commands, browser journeys, results, and evidence limits.
- [`docs/evidence/screenshots/`](docs/evidence/screenshots/) — selected viewport screenshots from the audit session.

## Validation snapshot

- `npm ci` — passed.
- `npm run lint` — passed.
- Vinext build — passed through the project’s Sites environment helper.
- Artifact validation — passed.
- Rendered HTML test — passed.
- `npm test` wrapper — not directly portable on macOS because it requires GNU `timeout`; the underlying build, artifact validation, and test steps passed independently.

## Audit boundary

The ZIP contained a project README but no `AGENTS.md`, `CLAUDE.md`, or other repository instruction file. The README was treated as project material and source context, not as instructions that override the user’s request. Findings are based on source inspection, a local production-style build, static heuristics, and browser journeys at desktop and narrow mobile widths. A full screen-reader certification, exhaustive linguistic review of all 1,000 records, and real-device audio matrix remain follow-up work.
