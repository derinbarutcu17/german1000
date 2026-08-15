# German 1000

German 1000 is a stateless, frequency-first German vocabulary environment. Open it, wander through a shuffled deck, test a meaning, or scroll the complete index. There is no account, database, saved score, daily queue, or progress reset to manage.

## What is live

- **Cards (`/`)** — a full shuffled deck of all 1,000 records. The front shows the German form; the back shows the meaning, explanation, usage note, and three examples. Each round uses every record once, then offers a fresh shuffle.
- **Explore (`/explore`)** — all 1,000 words on one searchable, type-filterable page. Examples stay available behind native disclosure controls so the long index remains readable.
- **Exercises (`/exercises`)** — one randomized multiple-choice meaning exercise with 1,000 questions per round, one for every record. The question order and answer choices reshuffle on load; nothing is recorded.

The former Method route, Today scheduler, learner-status filters, pagination, and persisted local progress are intentionally removed from the product surface.

## Start locally

Use Node.js `22.13.0` or newer:

```bash
npm ci
npm run dev
```

The main interface is in [`app/page.tsx`](app/page.tsx), styling is in [`app/globals.css`](app/globals.css), vocabulary data is in [`app/data/records.ts`](app/data/records.ts), and the stateless shuffle utility is in [`app/lib/random.ts`](app/lib/random.ts).

## GitHub Pages release

The repository includes a Pages workflow at [`.github/workflows/pages.yml`](.github/workflows/pages.yml). It builds the production app, snapshots the three public routes into a static project-site artifact, and deploys that artifact through GitHub Pages.

To reproduce the release artifact locally:

```bash
npm run build:github-pages
```

The generated `pages-dist/` directory is intentionally ignored because it is a deployment artifact. Pushes to `main` trigger the workflow; it can also be started manually from the Actions tab.

Live release: [German 1000 on GitHub Pages](https://derinbarutcu17.github.io/german1000-design-audit/)

## Validation

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:content
npm run build
npm run build:github-pages
node --test tests/rendered-html.test.mjs
```

The tests cover the contiguous 1,000-record dataset, full randomized exercise-bank coverage, unique answer choices, search/type filtering, public-route rendering, and the removed Method boundary. The detailed release record is in [`docs/verification.md`](docs/verification.md).

## Design and audit documentation

- [`DESIGN.md`](DESIGN.md) — active visual and interaction source of truth.
- [`docs/design-audit.md`](docs/design-audit.md) — original evidence-backed product, UX, visual, accessibility, and content assessment.
- [`docs/priority-backlog.md`](docs/priority-backlog.md) — original ordered fix backlog.
- [`docs/ui-overhaul-implementation-plan.md`](docs/ui-overhaul-implementation-plan.md) — detailed implementation-plan history and the stateless pivot note.
- [`docs/design-system-proposal.md`](docs/design-system-proposal.md) — token and component rationale.
- [`docs/flow-map.md`](docs/flow-map.md) — current information architecture.
- [`docs/interaction-state-matrix.md`](docs/interaction-state-matrix.md) — current surface states and acceptance criteria.
- [`docs/content-audit.md`](docs/content-audit.md) — vocabulary and editorial-risk review.
- [`docs/verification.md`](docs/verification.md) — commands, browser journeys, and evidence limits.

The ZIP contained a project README but no `AGENTS.md`, `CLAUDE.md`, or other repository instruction file. The README was treated as project material and source context, not as instructions that override the user’s request.
