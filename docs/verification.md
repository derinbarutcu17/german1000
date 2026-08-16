# German 1000 — verification record

## Environment

- Audit date: 2026-08-15.
- Source archive: `/Users/derin/Downloads/german1000-source.zip`.
- Local implementation: `/Users/derin/Documents/Codex/2026-08-15/yeah-can-you-do-a-big/outputs/german1000-design-audit`.
- Browser checks: local Vite preview at 1280px and an explicit 280px viewport.
- Persistence contract: no production route imports a learning store, local-storage adapter, session scheduler, or Method page.

## Release gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | PASS | App and Worker type surface checked with strict TypeScript. |
| `npm run lint` | PASS | Zero ESLint errors or warnings. |
| `npm run test:unit` | PASS | 9 tests covering the contiguous dataset, exact bilingual sentence examples, seeded randomized 1,000-question bank, unique choices, shuffle integrity, sentence-aware search, accent handling, and full-index behavior. |
| `npm run test:content` | PASS | 1,000 contiguous forms and 3,000 distinct bilingual examples with exact surface-form usage and source metadata. |
| `npm run build` | PASS | Vinext production build and Sites artifact validation completed. |
| `npm run build:github-pages` | PASS | Static snapshots created for `/`, `/explore/`, and `/exercises/`; no Method snapshot is produced. |
| `node --test tests/rendered-html.test.mjs` | PASS | Three public routes render HTML; `/method` and an unknown route return 404. |
| GitHub Pages deployment | PASS | Release run `31899007085` completed successfully from `main` at content commit `97bc221`. |
| Browser console | PASS | No error-level messages during the local Cards, Explore, or Exercises checks. |

## Browser journeys

### Cards — landing flashcard

1. Loaded `/` at the default 1280px viewport.
2. Verified the “Cards” route, shuffled card counter, German front, and reveal action.
3. Selected “Reveal the back” and verified the meaning, explanation, and all three sentence examples.
4. Selected “Next random card” and verified the counter moved from `Card 001 / 1,000` to a fresh second card with the answer hidden.
5. Reloaded the route and verified it returned to `Card 001 / 1,000` with a new random record in the local run.

**Result:** PASS. The full no-repeat order and 1,000-record coverage are enforced by the shared Fisher–Yates shuffle and content tests; the browser journey covers the visible start/reveal/advance/reload contract.

### Explore — one-page 1,000-word index

1. Loaded `/explore` at 1280px.
2. Counted 1,000 `article` records and 1,000 stable rank anchors.
3. Confirmed there is no Previous, Next, Page, or progress control.
4. Measured `document.body.scrollWidth === window.innerWidth` at 1280px.
5. Set the viewport to 280px and repeated the count and width check.
6. Verified Search remains visible at 280px and the body width remains exactly 280px.

**Result:** PASS. The complete list is one continuous document, with native example disclosures and no horizontal overflow in the tested narrow viewport.

### Exercises — randomized 1,000-question meaning bank

1. Loaded `/exercises` and waited for the client-only bank to finish shuffling.
2. Verified `Question 1 of 1,000`, four native radio inputs, and no mode tabs.
3. Selected an answer and verified one live `Correct.` or `Not quite.` result, the correct answer, and context examples.
4. Selected “Next question” and verified `Question 2 of 1,000`.

**Result:** PASS. The unit contract additionally verifies all 1,000 ranks appear exactly once, each item has one correct answer, each choice label is unique, and two seeded orders differ.

### Removed surface

`/method` returns HTTP 404 in the local production server, and the Pages artifact contains no Method route. The old Today, progress, pagination, and reset surfaces are absent from the current navigation and production imports.

## Historical baseline

The original audit evidence remains in [`docs/design-audit.md`](design-audit.md) and [`docs/evidence/`](evidence/). Those screenshots and findings document the earlier persisted Today/scheduler implementation; they are baseline evidence, not claims about the current stateless UI.

## Evidence limits

This record does not certify:

- complete WCAG conformance or a full VoiceOver certification;
- real-device rendering across every browser;
- complete native-editorial review of every gloss, sentence, and translation;
- production CDN performance under a large number of concurrent visitors;
- dark mode, which the current site does not implement.

The implementation was reviewed against the local accessibility and design guidance available in the workspace. The `main` Pages workflow and live smoke check completed successfully: the public Cards, Explore, and Exercises routes reflect the stateless release, while `/method/` returns 404.
