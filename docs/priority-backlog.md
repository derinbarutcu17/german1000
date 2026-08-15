# German 1000 — prioritized fix backlog

This backlog turns the audit into an implementation sequence. IDs map to [`design-audit.md`](design-audit.md). Work should proceed top to bottom unless a dependency is explicitly called out.

## Release gates

The product should not be treated as release-ready until these are true:

- The daily practice queue never skips a word, never reports contradictory totals, and has an explicit completed state.
- Returning users hydrate without a React mismatch, and storage failures are recoverable.
- The reviewed vocabulary data has a clear source, sense, part-of-speech, and editorial status.
- Method claims match the implemented scheduling behavior.
- Main views are addressable, refreshable, and navigable with browser history.
- Progress, answer choices, result feedback, language metadata, and skip navigation work with assistive technology.
- The Explore all-results path stays bounded and responsive.
- 280px, 320px, 375px, tablet, and desktop checks pass without horizontal overflow.

## Wave 1 — correctness and trust

### B-01 — Rebuild practice as a deterministic state machine

**Maps to:** G100
**Owner:** learning-loop implementation
**Priority:** P1
**Depends on:** none

Define an explicit session model rather than deriving position from a mutable filtered array.

Suggested shape:

```ts
type ReviewState = {
  status: "new" | "learning" | "known";
  dueAt: string | null;
  intervalDays: number;
  streak: number;
  attempts: number;
  lastReviewedAt: string | null;
};

type PracticeSession = {
  ids: number[];
  position: number;
  total: number;
  phase: "prompt" | "revealed" | "complete";
};
```

**Acceptance:** rank #001 → rank #002; “Again” does not lose the card; last card reaches a completion state; session totals remain stable; unit tests cover all branches.

### B-02 — Add a versioned, hydration-safe storage adapter

**Maps to:** G101, G110
**Owner:** state/persistence
**Priority:** P1
**Depends on:** B-01

Move all localStorage access behind a small adapter with schema versioning, safe parse/stringify, and an explicit client hydration phase. Keep the server render deterministic.

**Acceptance:** no mismatch on reload; malformed JSON resets safely; private-mode/quota exceptions do not crash the UI; reset requires confirmation or supports undo; storage key and schema are documented.

### B-03 — Establish the content source of truth and review workflow

**Maps to:** G103
**Owner:** editorial/data
**Priority:** P1
**Depends on:** none

Separate word records from generated presentation defaults. Add fields for part of speech, primary sense, alternate senses where needed, example, example translation, provenance, reviewer, review status, and notes.

Run a first QA pass over the records called out in [`content-audit.md`](content-audit.md), then expand to all 1,000 records. Treat context-dependent forms as a distinct editorial class rather than forcing one English gloss.

**Acceptance:** no record is published with an unreviewed primary gloss; suspicious form/translation pairs are flagged; every visible example has a provenance or reviewer field.

### B-04 — Align the method story with the actual scheduler

**Maps to:** G102
**Owner:** product/content
**Priority:** P1
**Depends on:** B-01, B-03

Choose one honest product contract:

1. Implement a small scheduler with due dates and review outcomes; or
2. Reframe the method as rank-ordered daily practice and remove adaptive/spaced claims.

**Acceptance:** a user can understand how a known word returns, how an “Again” answer changes it, and whether exercises influence review state.

## Wave 2 — navigation and semantics

### B-05 — Convert main views into URL-backed navigation

**Maps to:** G104
**Owner:** information architecture
**Priority:** P1
**Depends on:** none

Use route segments or a URL query for Practice, Explore, Exercises, and Method. Prefer real links in the main navigation. Decide which search/filter/pagination values belong in the URL.

**Acceptance:** direct links work; refresh preserves view; browser back/forward restores the view; active navigation is exposed semantically; view changes move focus to a meaningful heading without trapping users.

### B-06 — Make progress and exercise feedback accessible

**Maps to:** G105
**Owner:** accessibility/component system
**Priority:** P1
**Depends on:** B-01, B-05

Implement a progressbar with value attributes, a native radio-group or equivalent for one-answer choices, a polite result status, and `lang="de"` around German content. Add a skip link before the sticky header.

**Acceptance:** keyboard and screen-reader pass for Practice, Explore filters, and both exercise modes; result is announced once; audio buttons communicate availability; no essential state exists only in color.

### B-07 — Add explicit empty, loading, error, and completion states

**Maps to:** G100, G101, G106, G111
**Owner:** product surface
**Priority:** P1/P2
**Depends on:** B-01, B-02

Document and design state variants for: no cards due, all cards known, malformed data, storage unavailable, speech unavailable, no Explore matches, and exercise list exhausted.

**Acceptance:** each state has a clear heading, explanation, next action, and no dead end; completion never falls through to the first or last word.

## Wave 3 — responsive, motion, and performance

### B-08 — Remove narrow-width overflow

**Maps to:** G107
**Owner:** layout system
**Priority:** P2
**Depends on:** B-05

Fix `min-width` interactions in the search/filter row, add `min-width: 0` to shrinkable children, and test `280`, `320`, `375`, `768`, `1024`, and `1440` widths.

**Acceptance:** `document.scrollWidth <= window.innerWidth` at all supported widths; no clipped placeholder or action; filter controls retain usable tap targets.

### B-09 — Add reduced-motion and transform-based progress movement

**Maps to:** G108, G117
**Owner:** visual system
**Priority:** P2
**Depends on:** B-06

Replace width animation with a transform-based fill where practical. Add a `prefers-reduced-motion: reduce` layer that disables smooth scroll, hover translation, and non-essential transitions.

**Acceptance:** reduced-motion users see state changes without animated travel; progress remains accurate; motion is limited to explicit properties.

### B-10 — Bound Explore rendering

**Maps to:** G106
**Owner:** performance/component system
**Priority:** P1
**Depends on:** B-05

Keep pagination as the default. If all-results is retained, use virtualization or incremental rendering, and announce the result count without mounting thousands of controls.

**Acceptance:** all-results interaction remains responsive; the DOM and memory budget are documented; keyboard and screen-reader traversal remain practical.

### B-11 — Simplify secondary-view shell behavior

**Maps to:** G112
**Owner:** product design
**Priority:** P2
**Depends on:** B-05

On Explore, Exercises, and Method, shorten the hero into a route header or collapse it after navigation. Preserve the brand and stats where they support context, but prioritize the active tool.

**Acceptance:** the first meaningful tool heading and controls appear within the initial viewport on desktop and mobile; the Practice landing view retains its larger welcome treatment.

## Wave 4 — visual system and editorial quality

### B-12 — Normalize semantic color tokens and contrast

**Maps to:** G109, G116
**Owner:** design system
**Priority:** P2
**Depends on:** B-06

Keep the current palette direction, but define primary/secondary/tertiary text, action, success, error, border, and surface roles. Reserve soft muted colors for large text or decoration. Add automated contrast checks for each role pair.

**Acceptance:** all normal text role pairs meet the chosen contrast target; error/success states remain distinguishable without color alone; no repeated status literals remain in component CSS.

### B-13 — Resolve font roles

**Maps to:** G113
**Owner:** typography system
**Priority:** P2
**Depends on:** none

Choose whether Geist is the UI face. If Georgia remains, name it as an editorial/context role. Define display, body, label, mono/meta, and German-word roles with size, weight, line-height, and tracking.

**Acceptance:** CSS uses semantic font variables; fallbacks are intentional; the practice word, sentence prompt, metadata, and body copy have a documented relationship.

### B-14 — Make compact branding intentional

**Maps to:** G118
**Owner:** brand/layout
**Priority:** P3
**Depends on:** B-11

Create a compact mark variant for narrow headers with an accessible full label. Do not rely on clipping or incidental text shortening.

**Acceptance:** visual mark and accessible name remain stable at 280–375px; the compact mark is documented as a component state.

### B-15 — Add sharing metadata after identity lock

**Maps to:** G119
**Owner:** brand/metadata
**Priority:** P3
**Depends on:** B-13, B-14

Add an Open Graph image, canonical title/description, and theme-color metadata aligned with the final system.

## Wave 5 — test and release hardening

### B-16 — Expand automated coverage around the contract

**Maps to:** G114
**Owner:** quality engineering
**Priority:** P2
**Depends on:** B-01 through B-10

Add:

- state-model unit tests for queue transitions and storage migration;
- browser tests for first visit, returning visit, Again/I know, completion, Explore filters, no results, show-all, and both exercise modes;
- accessibility assertions for names, roles, live regions, language metadata, and focus target;
- responsive checks for scroll width at the defined breakpoints;
- content checks for duplicate ranks, missing fields, suspicious glosses, and unreviewed records.

**Acceptance:** a pull request cannot regress the practice loop, hydration path, essential semantics, or supported-width overflow without a failing test.

### B-17 — Clarify optional starter/deployment surfaces

**Maps to:** G115
**Owner:** repository maintenance
**Priority:** P2
**Depends on:** B-16

Document the active runtime surface and the optional D1/Drizzle/dispatch integrations. Rename package metadata when appropriate. Keep deployment identifiers out of the public source unless they are intentionally part of the project configuration.

**Acceptance:** a new contributor can distinguish active site code, optional integrations, generated output, local-only scripts, and deployment configuration in under five minutes.
