# German 1000 — design audit

This repository contains the German 1000 learning website source plus an evidence-backed product, UX, visual, accessibility, content, and implementation audit.

## Implementation status

**UI/experience overhaul implemented locally and published for review.** The original audit findings are preserved as baseline evidence in [`docs/design-audit.md`](docs/design-audit.md); the current source closes the primary interaction, navigation, content, responsive, and accessibility issues identified there.

Implemented in this release:

- Stable ten-card Today sessions with persisted cursor, explicit Again/I know it scheduling, v1 progress migration, and duplicate-click protection.
- Real `/`, `/explore`, `/exercises`, and `/method` destinations with shareable search/filter/page state and bounded Explore rendering.
- Editorial word records with contextual examples, language annotations, corrected high-risk glosses, optional German audio, and review-status transparency.
- Native radio exercise modes for Meaning, Recall, and Article, with one live feedback result and practice attempts kept separate from review scheduling.
- Shared tokens/components, semantic progress bars, focus handoffs, skip link, reduced-motion and forced-colors paths, 280px-safe responsive layout, and reset confirmation.
- Worker typings and portable build behavior for macOS/Linux environments.

The repo is ready for a final product/content review and deployment decision; a full VoiceOver certification and real-device speech matrix remain deliberate follow-up checks.

## Start the site locally

Use Node.js `22.13.0` or newer:

```bash
npm ci
npm run dev
```

The main interface is in [`app/page.tsx`](app/page.tsx), styling is in [`app/globals.css`](app/globals.css), and vocabulary data is in [`app/words.ts`](app/words.ts).

The active design source of truth is [`DESIGN.md`](DESIGN.md). The learning rules live under [`app/lib/learning`](app/lib/learning).

The original project notes are preserved in [`docs/original-project-readme.md`](docs/original-project-readme.md). The public audit copy redacts the source archive’s deployment project identifier from `.openai/hosting.json`; configure your own hosting project before deployment.

## Audit documents

- [`docs/design-audit.md`](docs/design-audit.md) — executive assessment, scored lenses, detailed findings, evidence, and limitations.
- [`docs/priority-backlog.md`](docs/priority-backlog.md) — ordered fix backlog with acceptance criteria.
- [`docs/ui-overhaul-implementation-plan.md`](docs/ui-overhaul-implementation-plan.md) — detailed architecture, milestones, file map, state contracts, test plan, and release gates for the UI/experience overhaul.
- [`docs/design-system-proposal.md`](docs/design-system-proposal.md) — proposed tokens, primitives, states, responsive rules, and motion guidance.
- [`DESIGN.md`](DESIGN.md) — active tokens, surface rules, components, and responsive contract.
- [`docs/interaction-state-matrix.md`](docs/interaction-state-matrix.md) — surface-by-surface state and behavior inventory.
- [`docs/content-audit.md`](docs/content-audit.md) — vocabulary and editorial-risk review.
- [`docs/flow-map.md`](docs/flow-map.md) — current information architecture and recommended navigation model.
- [`docs/verification.md`](docs/verification.md) — commands, browser journeys, results, and evidence limits.
- [`docs/evidence/screenshots/`](docs/evidence/screenshots/) — selected viewport screenshots from the audit session.

## Validation snapshot

- `npm run typecheck` — passed with Cloudflare worker types included.
- `npm run lint` — passed.
- `npm run test:unit` — passed, 22 tests covering scheduler, sessions, migration, storage, content, and exercise banks.
- `npm run test:content` — passed for 1,000 contiguous ranked forms.
- `npm run build` — passed; Sites artifact validation passed.
- `node --test tests/rendered-html.test.mjs` — passed.
- Manual browser verification — passed for Today reveal/review/reload continuity, all four routes, query-driven exercises, Explore search/filtering, one-result bounded rendering, and accessible radio feedback. The verification record is in [`docs/verification.md`](docs/verification.md).

## Audit boundary

The ZIP contained a project README but no `AGENTS.md`, `CLAUDE.md`, or other repository instruction file. The README was treated as project material and source context, not as instructions that override the user’s request. Findings are based on source inspection, a local production-style build, static heuristics, and browser journeys at desktop and narrow mobile widths. A full screen-reader certification, exhaustive linguistic review of all 1,000 records, and real-device audio matrix remain follow-up work.
