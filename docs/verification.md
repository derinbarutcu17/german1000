# German 1000 — verification record

## Environment

- Audit date: 2026-08-15.
- Source archive: `/Users/derin/Downloads/german1000-source.zip`.
- Local test copy: extracted into a disposable workspace and then copied into this repository without generated build/runtime folders.
- Browser widths exercised: 1440px, 375px, and 280px.
- The local dev server was tested on both a fresh origin and a returning origin to separate first-visit behavior from persisted state.

## Post-overhaul verification

The historical browser journeys below are intentionally retained as baseline evidence from before implementation. The current implementation was rechecked after the overhaul.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | PASS | Full app, Worker, and D1 type surface checked with `@cloudflare/workers-types`. |
| `npm run lint` | PASS | Zero ESLint errors or warnings. |
| `npm run test:unit` | PASS | 25 tests: scheduler, frozen sessions, migration, storage, content, and exercise banks. |
| `npm run test:content` | PASS | 1,000 contiguous, unique ranks. |
| `npm run build` | PASS | Vinext production build and Sites artifact validation completed on macOS without GNU `timeout`. |
| `npm run build:github-pages` | PASS | Production route snapshots for `/`, `/explore/`, `/exercises/`, and `/method/` completed with project-prefixed assets and a `.nojekyll` marker. |
| GitHub Pages deployment | PASS | The Pages workflow completed successfully from `main`; live URL: https://derinbarutcu17.github.io/german1000-design-audit/ |
| Route smoke | PASS | `/`, `/explore`, `/exercises?mode=meaning`, `/exercises?mode=word`, `/exercises?mode=article`, and `/method` return HTML; unknown route returns 404. |
| Today interaction | PASS | Reveal → I know it advances `#001` to `#002`; reload preserves the same session cursor. |
| Exercise interaction | PASS | Article radio group exposes native choices and one live correct-feedback result. |
| Explore interaction | PASS | Search/filter query state renders one matching card and stays within the viewport at the active desktop width. |

Manual browser screenshots were captured for the rebuilt Today, Explore, and Exercises surfaces during this verification pass. A full VoiceOver certification, exact six-width viewport matrix, and real-device speech matrix remain follow-up release checks rather than being represented as passed here.

## Historical baseline build and static checks

| Check | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS | Installed dependencies; npm emitted non-blocking warnings about deprecated packages/blocked install scripts. |
| `npm run lint` | PASS | No lint errors. |
| `bash scripts/sites-env.sh -- node_modules/.bin/vinext build` | PASS | Production-style build completed. |
| `bash scripts/sites-env.sh -- bash scripts/validate-artifact.sh` | PASS | Sites artifact validation completed. |
| `node --test tests/rendered-html.test.mjs` | PASS | One rendered HTML smoke test passed. |
| `npm test` | ENVIRONMENT LIMIT | Wrapper requires GNU `timeout`, which is not available on the macOS environment. Underlying build, artifact validation, and rendered HTML test passed independently. |
| Impeccable detector | REVIEW | Flagged a single-side feedback border and a width transition. |

## Browser journeys

### Practice — fresh user

1. Loaded the homepage.
2. Verified the hero, stats, practice card, audio control, and reveal action.
3. Revealed the meaning and verified explanation/examples plus Again/I know actions.
4. Selected I know it.
5. Observed header `1/1,000`, `0% complete`, daily `2 / 10`, and current rank `#003`.

**Result:** FAIL — rank `#002` is skipped and progress indicators disagree. See [`14-practice-skips-rank-002.png`](evidence/screenshots/14-practice-skips-rank-002.png).

### Practice — returning user

1. Saved progress through the primary practice action.
2. Reloaded the same origin.
3. Observed the React development error overlay and console hydration mismatch: server value `0`, client value `1`.

**Result:** FAIL — storage is read during initial render. See [`03-returning-hydration-error.png`](evidence/screenshots/03-returning-hydration-error.png).

### Explore — baseline, search, and full list

1. Opened Explore at desktop width.
2. Verified 1,000 results, search, rank/type filters, pagination, and card disclosures.
3. Searched `Haus`; observed 7 results, including records matching supporting explanation/example text.
4. Cleared the search and selected Show all 1,000.
5. Measured 1,000 cards, roughly 6,010 buttons, 135,126px document height, and 1,425px body width.

**Result:** PARTIAL — baseline and pagination are usable; all-results path is unbounded. See [`05-explore-viewport.png`](evidence/screenshots/05-explore-viewport.png), [`06-explore-search.png`](evidence/screenshots/06-explore-search.png), and [`07-explore-all-1000.png`](evidence/screenshots/07-explore-all-1000.png).

### Exercises — meaning and sentence context

1. Opened Meaning mode and verified the four-choice answer layout.
2. Selected a wrong answer and verified corrective text, explanation, and examples.
3. Advanced to the next exercise.
4. Switched to Sentence context mode.
5. Selected the correct answer and verified correct feedback and explanation.

**Result:** PARTIAL — visual interaction works; progress semantics, choice roles, live feedback, and scheduler integration need repair. See [`08-exercise-meaning.png`](evidence/screenshots/08-exercise-meaning.png) and [`09-exercise-context-correct.png`](evidence/screenshots/09-exercise-context-correct.png).

### Method

1. Opened Method.
2. Verified three method sections, six source links, and the corpus-ranking caveat.

**Result:** PASS visually, but the behavioral claims need to be aligned with the actual scheduler. See [`10-method-sources.png`](evidence/screenshots/10-method-sources.png).

### Responsive

1. Loaded the homepage at 375px.
2. Opened Explore and scrolled the result area.
3. Repeated Explore at 280px.
4. Measured body width greater than viewport width and observed clipped search content.

**Result:** PASS at 375px; FAIL at 280px due to horizontal overflow. See [`11-home-mobile-375.png`](evidence/screenshots/11-home-mobile-375.png), [`12-explore-mobile-375.png`](evidence/screenshots/12-explore-mobile-375.png), and [`13-explore-mobile-280-overflow.png`](evidence/screenshots/13-explore-mobile-280-overflow.png).

## Static accessibility observations

Observed positives:

- Native buttons and links are used for most actions.
- Audio buttons have accessible labels.
- A visible `:focus-visible` rule exists for buttons, links, inputs, selects, and summaries.
- Native `details` is used for expansions.

Observed gaps:

- `html lang="en"` with no `lang="de"` spans.
- No skip link.
- Progress track has `aria-label` but no progressbar role/value attributes.
- Answer buttons use `aria-pressed` rather than a radio-group model.
- Dynamic result feedback has no live-region semantics.
- Full keyboard traversal was not fully verifiable in this browser backend; it should be tested with a real keyboard and screen reader before sign-off.

## Static design and code observations

- `app/page.tsx` is a 753-line client component, so route-level and server-safe boundaries are not yet established.
- `app/globals.css` includes a 3px single-side feedback border and a width transition flagged by the Impeccable detector.
- There is no `prefers-reduced-motion` rule.
- The loaded Geist variables are not used as the active global font token; Arial is active and Georgia is used for the context prompt.
- The existing test suite is a rendered HTML smoke test, not a learning-loop contract test.

## Evidence limits

This record does not certify:

- full WCAG conformance;
- complete screen-reader behavior;
- all 1,000 translation records;
- real-device browser speech behavior;
- storage quota/private-mode behavior in every browser;
- dark mode, which the current site does not implement;
- production network/CDN performance.

The accessibility and UI review was cross-checked against the [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) and the local design-focused review skills available in the workspace.
