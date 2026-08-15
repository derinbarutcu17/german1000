# German 1000 — UI and experience overhaul implementation plan

**Status:** The original scheduler-oriented plan is historical; the active stateless pivot is implemented in the published codebase.
**Target:** Existing German 1000 Next/Vinext application
**Primary outcome:** Make German 1000 an immediate, whimsical 1,000-word environment that works without a database, account, or saved progress.

This plan is intentionally implementation-oriented. It converts the audit into a sequence of small, reviewable changes with explicit source files, state contracts, component responsibilities, test gates, and release criteria.

The active design-system summary is [`DESIGN.md`](../DESIGN.md). Post-implementation verification is recorded in [`docs/verification.md`](verification.md).

## Current implementation plan — stateless pivot

The user-facing product contract was narrowed after the original audit: remove the Method story and all persistence-oriented UI; make the landing page the flashcard exercise; make Exercises one randomized 1,000-question meaning bank; and make Explore one continuous 1,000-word page.

### Wave A — Remove false product promises

- Remove the Today label, daily count, global progress bar, review buttons, reset control, Method route, Method navigation, and learner-status filters.
- Remove the client learning store and its storage/scheduler tests once all production imports are gone.
- Keep editorial `reviewStatus` only when it helps explain source/content confidence; never present it as learner progress.

### Wave B — Build the ephemeral card deck

- Add a pure Fisher–Yates shuffle utility with injectable randomness for tests and `crypto.getRandomValues()` in the browser.
- Initialize the deck after the server-safe loading frame to prevent hydration mismatches.
- Shuffle the complete static `records` array, keep one in-memory position, reveal only the active record’s back, and stop explicitly after card 1,000.
- Expose gloss, explanation, usage note, and all three examples behind the active card. Reload and “Shuffle again” create a new order; neither reads nor writes persistence.

### Wave C — Build the complete exercise bank

- Generate one bank per page load with exactly one item for every record, independent of editorial review status.
- Use four distinct meaning labels per item, one correct and three randomized distractors; randomize both question and option order.
- Use native radio inputs, lock choices after submission, announce the result, show the correct answer and context, and finish at question 1,000 instead of wrapping.
- Keep the score and position in memory only; reload and shuffle reset them.

### Wave D — Make Explore one readable document

- Keep only ephemeral search and valid `WordKind` filtering in the URL.
- Render the complete filtered array in one single-column list; remove page size, page count, Previous, Next, and learner-status controls.
- Give every card a stable rank anchor and keep the three examples in native `details` disclosures.
- Remove per-card audio controls from the 1,000-item index to avoid thousands of speech listeners; active cards and exercise feedback retain audio.
- Use `content-visibility: auto` as a browser rendering hint without virtualizing away the document the user asked to scroll.

### Wave E — Verify and release

- Typecheck, lint, validate the 1,000 contiguous records, test seeded shuffles and unique choices, build production output, snapshot only the three public Pages routes, and assert `/method` is a real 404.
- Browser-check a landing reveal/next/reload loop, a 1,000-card Explore DOM at desktop and 280px, and an exercise answer/next loop from `1 of 1,000`.
- Push the verified change to `main` and wait for the GitHub Pages workflow before reporting the live URL.

The remainder of this document is retained as historical audit planning for the earlier persisted-learning direction. It is not the current product contract.

## Historical scheduler-oriented plan

### 1. Executive direction

Preserve the current editorial identity: a quiet paper canvas, dark ink, one primary blue action color, green learning reinforcement, large German words, and restrained borders. Rebuild the experience underneath that visual language around one reliable promise:

> Open German 1000, complete a clear ten-card session, understand why each answer is right, and know exactly what will return next.

The overhaul is therefore a product-system project with four parallel tracks:

1. **Learning correctness:** a stable practice session, honest review scheduling, safe persistence, and completion states.
2. **Information architecture:** real routes, URL-backed Explore state, focused tool headers, and predictable back/forward behavior.
3. **Interface system:** semantic tokens, reusable component states, accessible interactions, responsive rules, and intentional motion.
4. **Content trust:** reviewed vocabulary records, contextual senses, exercise-quality checks, and method copy that matches the algorithm.

Do not begin with a visual rewrite of `app/page.tsx`. The first implementation milestone is the state and content contract that the new UI will render.

## 2. Product brief for the implementation team

### Primary user

A self-directed German learner who wants a short, repeatable daily routine and a reliable reference for the most frequent forms. They may be on a phone, may return after several days, and may not know the difference between a corpus form, a lemma, a gloss, and a grammatical construction.

### Primary job

Complete one focused practice session without losing the place, then use Explore or Exercises to deepen understanding.

### Success action

The learner marks a word `Again` or `I know it`, sees a truthful next step, and can return later without the app contradicting itself.

### Product mode

German 1000 combines:

- **Operate:** complete a practice or exercise task;
- **Read:** understand explanations, examples, and method notes;
- **Experience:** build a calm study ritual around returning to the list.

Operate wins when these modes conflict. A beautiful screen that makes the next learning action unclear is a regression.

### Non-goals for this overhaul

- Do not migrate away from Next/Vinext, React, or the existing CSS approach.
- Do not introduce a full commercial LMS, accounts, social layer, streak gamification, or external analytics.
- Do not replace the paper/ink editorial direction with a generic dark dashboard, gradient-heavy marketing page, or claymorphism system.
- Do not claim a research-grade spaced-repetition algorithm in the first pass.
- Do not publish unreviewed generated explanations as if they were dictionary-quality content.
- Do not build a database-backed authoring system until the local content contract and review workflow are stable.

## 3. Current-to-target architecture

### Current architecture

The application is a single 753-line client component. It owns static data transformation, localStorage, daily selection, Explore search/filter state, exercise state, speech, navigation state, and all rendering in one file.

```text
app/page.tsx
├─ static notes and generated record construction
├─ speech synthesis helpers
├─ WordCard / WordExamples / AudioButton
├─ daily queue derived from progress + sessionIndex
├─ Explore filtering + pagination + show-all rendering
├─ Meaning and context exercise banks
├─ localStorage reads/writes
├─ top navigation tab state
└─ Practice / Explore / Exercises / Method markup
```

### Target architecture

```text
app/
├─ layout.tsx                         metadata, fonts, document language
├─ page.tsx                           Today route shell
├─ explore/page.tsx                   URL-backed Explore route
├─ exercises/page.tsx                 URL-backed Exercises route
├─ method/page.tsx                    Method route
├─ components/
│  ├─ AppShell.tsx                    shared landmarks and navigation
│  ├─ SiteHeader.tsx                  brand, links, progress
│  ├─ SkipLink.tsx                    keyboard bypass
│  ├─ ProgressBar.tsx                 semantic progressbar
│  ├─ AudioButton.tsx                 speech availability and feedback
│  ├─ PracticeCard.tsx                prompt/reveal/completion states
│  ├─ ReviewActions.tsx               Again/I know it contract
│  ├─ WordCard.tsx                    Explore result anatomy
│  ├─ WordExamples.tsx                disclosure and German language spans
│  ├─ FilterBar.tsx                   search, rank, type, reset
│  ├─ ResultSummary.tsx               result count and query scope
│  ├─ Pagination.tsx                  bounded result navigation
│  ├─ EmptyState.tsx                  no-results and no-due states
│  ├─ ExerciseModeSwitch.tsx          meaning/context navigation
│  ├─ ExerciseChoiceGroup.tsx         radio semantics and answer lock
│  ├─ FeedbackPanel.tsx               live status + detailed explanation
│  ├─ MethodSections.tsx               method content hierarchy
│  └─ Footer.tsx                      reset and product note
├─ data/
│  ├─ words.ts                         raw frequency source
│  ├─ word-records.ts                  normalized publishable records
│  ├─ editorial-notes.ts              reviewed overrides only
│  └─ exercise-fixtures.ts             vetted exercise cases
├─ lib/
│  ├─ learning/types.ts                domain contracts
│  ├─ learning/scheduler.ts            interval ladder and outcomes
│  ├─ learning/session.ts              stable daily session state
│  ├─ learning/storage.ts              versioned safe persistence
│  ├─ learning/migrations.ts           v1 → v2 storage migration
│  ├─ exercises/build-bank.ts          deterministic, QA-friendly banks
│  ├─ search/filter-records.ts         query and filter behavior
│  ├─ audio/speech.ts                  voice availability and playback
│  └─ url/view-state.ts                route/query parsing
└─ styles/
   ├─ tokens.css                       primitive, semantic, component tokens
   └─ components.css                   shared component rules
```

The route split is the most important structural change. It lets the server render stable content and keeps client state limited to the parts that actually need it.

## 4. Decisions to make once, before implementation

The implementation should not repeatedly reopen these questions. Record the decisions in `docs/product-brief.md` and `docs/state-contract.md` before Wave 1 coding.

### Decision A — Use a small honest scheduler

Implement a simple interval ladder, not SM-2 or a research claim:

```text
New + I know it       → known, due in 1 day, streak 1
Known + I know it     → next interval [1, 3, 7, 14, 30, 60] days
New/Known + Again     → learning, due in 10 minutes, streak 0
Learning + I know it  → known, due in 1 day, streak 1
Learning + Again      → learning, due in 10 minutes, attempts + 1
```

The exact ladder may be tuned later, but the first release must expose the real behavior in the Method copy. No word is silently “mastered” by a single multiple-choice answer.

### Decision B — Keep a stable ten-card session

At session start, select up to ten IDs and freeze their order in a `PracticeSession`. Marking a card must not rebuild the current list and move the cursor.

For the first implementation, `Again` updates the persisted due state and advances through the stable ten-card set. It does not repeat the card inside the same session. A later iteration can add a bounded revisit queue if user testing shows immediate repetition is valuable.

The UI must distinguish:

- `2 of 10 complete` — progress through the session snapshot;
- `1 due soon` — persisted scheduler state;
- `42 / 1,000 known` — overall mastery count.

### Decision C — Manual confidence remains the mastery action

Exercise results should record attempts and last result, but should not silently mark a word known. The Method page should say that Exercises test retrieval while Today’s confidence actions update the review schedule.

### Decision D — Remove unbounded “Show all” in the first release

Keep pagination as the default and replace “Show all 1,000” with one of:

- a bounded page-size selector (`12`, `24`, `48`); or
- an accessible “Load next 24” action.

If users genuinely need an all-record view later, add virtualization as a separate performance project. Do not ship a 6,000-control DOM as a convenience feature.

## 5. Work plan and sequencing

Effort bands assume one engineer with a design/product reviewer. They are planning estimates, not promises. Waves may overlap after their contracts are stable.

| Wave | Outcome | Effort band | Dependencies |
| --- | --- | ---: | --- |
| 0. Contract and baseline | Source-of-truth docs, baseline snapshots, test harness, decisions locked | 0.5–1 day | None |
| 1. Learning domain | Stable session, scheduler, storage migration, pure tests | 2–4 days | Wave 0 |
| 2. Routing shell | Real routes, shared landmarks, URL state, focus handoff | 1–3 days | Wave 0 |
| 3. Design system | Tokens, primitives, component contracts, contrast and motion rules | 1–3 days | Wave 0 |
| 4. Today | Reliable daily practice, reveal, audio, completion, storage states | 2–4 days | Waves 1–3 |
| 5. Explore | Bounded reference browsing, URL filters, empty states, cards | 2–4 days | Waves 2–3 |
| 6. Exercises | Accessible choices, feedback, mode state, vetted banks | 2–4 days | Waves 1–3, content QA |
| 7. Method and content | Honest method story, reviewed records, source/provenance UI | 2–5 days | Waves 1 and content work |
| 8. Responsive/accessibility | Narrow widths, keyboard/screen reader, reduced motion | 2–4 days | Waves 3–7 |
| 9. Performance and QA | DOM budget, route build, e2e/a11y/content tests, portable scripts | 2–4 days | Waves 4–8 |
| 10. Release | Final evidence, migration check, public handoff | 1–2 days | Wave 9 |

Critical path:

```text
Contract → Learning domain → Today shell → Accessibility/responsive QA → Release
       ↘ Routing shell → Explore/Exercises ↗
       ↘ Design system → all surfaces ↗
       ↘ Content schema → Method/Exercises ↗
```

## 6. Wave 0 — contract and baseline

### Deliverables

Create:

- `docs/product-brief.md`
- `docs/state-contract.md`
- `DESIGN.md` or `docs/design-system.md` as the active visual source of truth
- `tests/fixtures/` for known words, ambiguous forms, and exercise cases
- `docs/baseline/` with the existing desktop/mobile screenshots already captured in the audit

### Tasks

1. Freeze the current source snapshot on a branch named `ui-overhaul`.
2. Record the route decision: `/`, `/explore`, `/exercises`, `/method`.
3. Record the scheduler decision and the v2 storage schema before touching UI.
4. Decide whether `Again` is a schedule outcome only or also an in-session revisit. Use schedule-only for v1.
5. Add a lightweight `npm run typecheck` script using `tsc --noEmit`.
6. Add a cross-platform timeout runner so `npm test` works on macOS as well as Linux. Keep the existing Sites validation path for deployment.
7. Capture baseline measurements:
   - default home DOM node count;
   - Explore default DOM node count;
   - route build output size;
   - scroll width at 280/320/375/768/1024/1440;
   - hydration console errors on a returning user;
   - “Show all” DOM count as a regression reference, not as a target.
8. Add a short decision log to the plan whenever product behavior changes.

### Exit criteria

- The team can explain the practice state machine without reading UI code.
- Every audit blocker has an owner and a planned wave.
- The baseline can be re-run after each visual batch.
- No visual redesign begins while queue, storage, and content contracts are undecided.

## 7. Wave 1 — learning domain and persistence

### 7.1 Define domain types

Create `app/lib/learning/types.ts`:

```ts
export type ReviewStatus = "new" | "learning" | "known";

export type ReviewState = {
  status: ReviewStatus;
  dueAt: string | null;
  intervalDays: number;
  streak: number;
  attempts: number;
  correctAttempts: number;
  lastReviewedAt: string | null;
  lastResult: "again" | "known" | "correct" | "wrong" | null;
};

export type ProgressSnapshot = {
  schemaVersion: 2;
  updatedAt: string;
  records: Record<number, ReviewState>;
};

export type PracticeSession = {
  sessionId: string;
  startedAt: string;
  ids: number[];
  position: number;
  phase: "prompt" | "revealed" | "complete";
};
```

Rules:

- IDs are ranks only if rank uniqueness remains guaranteed; otherwise introduce a stable record ID.
- Dates are ISO strings in UTC.
- The scheduler is pure: input state + outcome + time → next state.
- UI components do not directly mutate `localStorage`.

### 7.2 Implement scheduler functions

Create `app/lib/learning/scheduler.ts` with pure functions:

- `createInitialReviewState()`
- `applyReviewOutcome(state, outcome, now)`
- `selectDueRecords(records, progress, now, limit)`
- `getNextDueAt(state)`
- `formatReviewOutcome(outcome)`

Test cases:

- New → Again.
- New → I know it.
- Learning → Again.
- Learning → I know it.
- Known at every interval rung → I know it.
- Known → Again resets streak and shortens due date.
- Missing/malformed state returns a safe new state.
- Future-due known items are not selected as due.
- Tied due dates resolve by rank so selection is deterministic.

### 7.3 Implement stable session functions

Create `app/lib/learning/session.ts`:

- `startPracticeSession(records, progress, now, limit)` returns a frozen ID order.
- `getSessionRecord(session, records)` returns the current record or a typed completion state.
- `advanceSession(session)` increments position without looking at newly derived progress.
- `completeSession(session)` returns summary data.
- `sessionProgress(session)` returns completed/total.

Important invariant:

```text
The current card is selected from session.ids[position], never from a fresh filtered array.
```

### 7.4 Implement versioned storage

Create `app/lib/learning/storage.ts` and `app/lib/learning/migrations.ts`.

Storage rules:

- Keep `german-1000-progress-v1` readable for migration.
- Write only `german-1000-progress-v2` after a successful parse/migration.
- Never access browser storage during server render.
- `readSnapshot()` returns `{ status: "unavailable" | "empty" | "ready" | "invalid", snapshot }`.
- `writeSnapshot()` returns a result object instead of throwing into React.
- Add a storage-unavailable banner that does not block practice.
- Reset requires confirmation text: “This clears your saved review states on this browser. It cannot be undone.”

### Exit criteria

- Unit tests prove rank `#001` advances to `#002`.
- The final card produces `phase: "complete"`; it never falls back to `records[0]`.
- A returning user has a stable server render followed by a deliberate hydrated state.
- v1 data migrates without changing known/learning counts.
- No component imports `window.localStorage` directly.

## 8. Wave 2 — routing and shell

### Route map

| Route | Purpose | URL state |
| --- | --- | --- |
| `/` | Today’s session | Session persisted locally; no query required |
| `/explore` | Searchable vocabulary reference | `q`, `band`, `kind`, `page`, optional `size` |
| `/exercises` | Retrieval practice | `mode=meaning|context`; exercise position is local state |
| `/method` | Method, source, and content caveat | None |

### Tasks

1. Replace the top navigation buttons with `next/link` links.
2. Move the Today markup into `app/page.tsx` and create the three secondary route pages.
3. Build `AppShell` around semantic landmarks:
   - skip link;
   - header/nav;
   - `main id="main-content"`;
   - route-level heading;
   - footer.
4. Use a route-level header for Explore, Exercises, and Method. Keep the larger hero only on Today.
5. Parse query parameters in a single `app/lib/url/view-state.ts` module.
6. Make invalid query values fall back to safe defaults and replace the URL only when necessary.
7. On route change, focus the route heading or a hidden announcement such as “Explore loaded.”
8. Preserve the current visual topbar, but allow the nav to shrink without horizontal overflow.
9. Make the brand a link to `/`, not a stateful button.

### Navigation acceptance

- Opening `/explore?q=Haus&band=1%E2%80%93100` reproduces the same result state after refresh.
- Browser back/forward restores route and query state.
- Directly opening `/exercises?mode=context` lands in context mode.
- The active nav link uses `aria-current="page"`.
- The current page heading receives focus without a visible focus jump behind the sticky header.
- No primary destination depends on React state existing in a parent page.

## 9. Wave 3 — design system and component foundation

### 9.1 Token architecture

Create a three-layer system in `app/styles/tokens.css`:

```text
Primitive values → semantic roles → component contracts
```

Primitive categories:

- ink, muted ink, paper, white, line, blue, green, red;
- spacing `4, 8, 12, 16, 24, 32, 48, 64, 80`;
- type sizes and line heights;
- radius values for controls, cards, and pills;
- border thickness, focus ring, shadow, duration, and easing.

Semantic roles:

- `surface-canvas`, `surface-raised`, `surface-action`, `surface-positive`, `surface-negative`;
- `text-primary`, `text-secondary`, `text-tertiary`, `text-on-action`, `text-positive`, `text-negative`, `text-link`;
- `border-subtle`, `border-focus`, `border-positive`, `border-negative`.

Component roles:

- `button-primary-*`, `button-subtle-*`, `input-*`, `card-*`, `feedback-*`, `progress-*`, `choice-*`.

Keep the current palette direction, but choose darker semantic text values where the audit measured small-text contrast below target. Never use a soft decorative accent as body text.

### 9.2 Typography

Use Geist as the active UI family because it is already loaded. Use Geist Mono for ranks and structured metadata. Keep Georgia only if the team explicitly approves it as the editorial sentence role; otherwise use the same UI family with a separate size/weight treatment.

Define these classes/tokens:

- `display-word`: large German lemma, tight line-height, safe wrapping;
- `display-section`: route headings;
- `body`: explanations and method copy, capped reading measure;
- `body-german`: examples and sentence prompts with `lang="de"`;
- `label`: buttons, filters, status labels;
- `meta`: rank and corpus metadata with tabular numerals.

Apply `text-wrap: balance` to headings and `text-wrap: pretty` to body copy where supported.

### 9.3 Component contracts

Every shared component gets a small spec before it is implemented:

| Component | Required states |
| --- | --- |
| `SiteHeader` | default, active route, narrow brand, focused link, sticky |
| `ProgressBar` | 0%, in progress, 100%, unavailable, reduced motion |
| `PracticeCard` | prompt, revealed, submitting, storage unavailable, complete |
| `ReviewActions` | available, pressed, disabled, confirmed |
| `AudioButton` | available, loading voice, unavailable, playback error, focused |
| `WordCard` | default, expanded, known, learning, action pending |
| `FilterBar` | baseline, query, filtered, empty, reset, narrow stacked |
| `ExerciseChoiceGroup` | unanswered, focused, selected, correct, wrong, locked |
| `FeedbackPanel` | correct, wrong, info, live status, expanded examples |
| `EmptyState` | no results, no due cards, completed set, storage issue |
| `Footer` | default, reset confirmation, reset completed |

Do not implement a new visual pattern directly inside a route if an existing component contract covers it.

### Exit criteria

- No component relies on one-off hardcoded color literals for state.
- All interactive components have default, hover, active, focus-visible, disabled, and unavailable behavior where relevant.
- Tokens are documented and used by the shared components.
- The component CSS can be reviewed independently from route logic.

## 10. Wave 4 — Today experience

### Target information hierarchy

1. Route heading: “Today” plus session progress.
2. Stable practice card with rank, word type, German word, audio, and prompt.
3. Reveal region with gloss, explanation, and examples.
4. Confidence actions with consequence labels.
5. Session progress callout.
6. Supporting guidance, audio/storage notes, and completion summary.

### Implementation tasks

1. Render the current card from `PracticeSession`, not from `daily[sessionIndex]`.
2. Add an explicit `phase` to prevent the completed state from falling through to a word.
3. On reveal:
   - set `revealed`;
   - focus the reveal heading or a stable reveal region;
   - announce “Meaning revealed” in a polite status region;
   - keep the German word and prompt visible.
4. On `Again` or `I know it`:
   - disable both actions while the state transition commits;
   - apply the scheduler outcome;
   - advance the session snapshot exactly once;
   - reset reveal state;
   - announce the next rank and remaining session count.
5. On completion:
   - show “Today’s set complete”;
   - summarize known/again outcomes;
   - show next due count or “Nothing else is due”;
   - provide links to Explore and Exercises;
   - keep a restart action separate from reset-all-progress.
6. Add a clean first-visit state when there are no due records.
7. Make the “German voice ready” indicator reflect actual support and expose the unavailable state without leaving a dead audio button.
8. Keep the hero’s larger editorial treatment only on `/`; secondary routes use a compact header.

### Today acceptance tests

- Fresh session: `#001 → #002 → #003` with no skip.
- “Again” changes due state but does not alter the current session order.
- Repeated click cannot advance twice.
- Refresh after every card preserves the session and progress summary.
- Final card always produces completion UI.
- Storage unavailable still permits the session and explains non-persistence.
- Audio unavailable still leaves a complete text-based learning path.

## 11. Wave 5 — Explore experience

### Target behavior

Explore is a reference tool, not a wall of cards. It should answer “What is this word, how is it used, and where does it sit in the list?” quickly.

### Implementation tasks

1. Move filters to URL state: `q`, `band`, `kind`, `page`, `size`.
2. Define search scope visibly: “Search words, meanings, explanations, and examples.” If this is too broad, split it into a search scope control rather than surprising users.
3. Add a result summary that includes query and filters in plain language.
4. Keep default pages bounded at 12 or 24 cards.
5. Replace `showAll` with a page-size selector or “Load next 24.” Prefer pagination for the first release because it is simpler to reason about with keyboard and screen readers.
6. Clamp invalid page numbers to the last valid page and update the URL.
7. Add an explicit no-results state:
   - “No words match `Haus`.”;
   - clear search;
   - reset all filters;
   - preserve the search field focus.
8. Keep native `details` for examples and add `aria-describedby` only where the summary needs additional context.
9. Keep card actions available, but label them with the word name: “Mark Haus as known.”
10. Use an accessible list/grid structure with a visible heading and result count.
11. Add a loading boundary for route/query transitions even if the first implementation is client-fast.

### Explore acceptance tests

- Search and filters survive refresh and shareable URLs.
- Search `Haus` reports the exact scope that produced the result set.
- No-results state is actionable and does not leave an empty grid.
- Default result view never mounts 1,000 cards.
- At 280/320/375px controls stack with no horizontal overflow.
- Card expansion, audio, and mark actions remain keyboard reachable.

## 12. Wave 6 — Exercises experience

### Target interaction model

Exercises should feel like a short check, not a quiz with ambiguous button semantics.

### Implementation tasks

1. Make Meaning and Sentence context route/query-backed modes.
2. Render the choices as a native `fieldset` with `legend` and radio inputs, or implement a fully compliant radio group with roving focus.
3. Before answer:
   - instruction says “Choose one answer.”;
   - all choices are available;
   - no correctness is communicated by color.
4. After answer:
   - lock the group or clearly offer retry according to the chosen product rule;
   - mark the chosen option and correct option with text/icon and color;
   - announce a short result in `role="status"`;
   - show explanation and examples below;
   - enable Next exercise.
5. Keep a separate `ExerciseAttempt` record for count, mode, word rank, result, and timestamp.
6. Do not mark a word known from one correct answer. Surface the contract in the “Why this format?” note.
7. Build exercise banks from reviewed content only when a record has an unambiguous sense and a valid distractor set.
8. Add an explicit “This question is being reviewed” fallback for insufficiently vetted items rather than generating an arbitrary question.
9. Make answer audio availability match the shared `AudioButton` contract.
10. On mode switch, reset result state intentionally and announce the new mode.

### Exercise acceptance tests

- Keyboard user can enter the group, choose one radio, submit or receive feedback, and advance.
- Screen reader hears “Correct” or “Incorrect” once.
- Wrong answer identifies the correct answer in text, not only color.
- Context exercise has exactly one defensible answer in the fixture set.
- Mode switch does not leave stale feedback attached to a new prompt.
- Exercises do not silently change mastery state.

## 13. Wave 7 — Method and content trust

### 13.1 Content schema

Normalize `app/words.ts` into publishable records with at least:

```ts
type VocabularyRecord = {
  rank: number;
  surface: string;
  lemma: string;
  partOfSpeech: string;
  gender?: "masculine" | "feminine" | "neuter" | "plural";
  primarySense: string;
  alternateSenses?: string[];
  usageNote?: string;
  exampleDe: string;
  exampleEn: string;
  source?: string;
  sourceContext?: string;
  reviewStatus: "unreviewed" | "editor-reviewed" | "native-reviewed";
  reviewedBy?: string;
  reviewedAt?: string;
};
```

Preserve the raw frequency input, but do not treat raw rank/gloss data as a finished lesson.

### 13.2 Editorial workflow

1. Add a `scripts/validate-content.mjs` checker.
2. Fail on duplicate rank, duplicate stable ID, missing surface, missing sense, missing example, or invalid review status.
3. Warn on likely form/lemma mismatches, suspicious one-word glosses, and examples that repeat the gloss mechanically.
4. Review the highest-frequency 200 records first.
5. Review every record used in an exercise bank.
6. Mark ambiguous forms with a usage note rather than forcing a single translation.
7. Keep generated examples out of the publishable “reviewed” state.

### 13.3 Method rewrite

The Method page should explain the real contract:

- rank is corpus frequency, not a complete curriculum;
- Today uses a local review schedule with a simple interval ladder;
- Again/I know it update the review schedule;
- Exercises record retrieval attempts but do not automatically mark mastery;
- translations are learning glosses, not full dictionary entries;
- examples are reviewed learning material, not raw corpus quotations unless provenance says otherwise.

### Content acceptance

- All visible records have a review status.
- High-risk samples from the audit are resolved or explicitly labeled context-dependent.
- Exercise fixtures contain only reviewed, unambiguous prompts.
- Method copy and visible UI labels match actual behavior.

## 14. Wave 8 — accessibility, responsive behavior, and motion

### Accessibility implementation checklist

1. Add a skip link before the header.
2. Use `lang="en"` on the document and `lang="de"` on German words/sentences.
3. Use real links for navigation.
4. Give every route one logical `h1` and preserve heading order.
5. Make progress:

```html
<div
  role="progressbar"
  aria-label="Overall vocabulary progress"
  aria-valuemin="0"
  aria-valuemax="1000"
  aria-valuenow="42"
  aria-valuetext="42 of 1,000 words marked known"
></div>
```

6. Use `role="status"` for concise reveal/result announcements.
7. Use radios for one-answer exercise choices.
8. Ensure focus is not hidden by the sticky header.
9. Keep the existing visible `:focus-visible` ring and connect its color to the semantic focus token.
10. Do not use color as the only signal for known/learning/correct/wrong.
11. Give audio controls an unavailable state and a written fallback.
12. Make reset consequences explicit and recoverable.

### Responsive implementation checklist

Test exact widths `280`, `320`, `375`, `768`, `1024`, and `1440`.

- Add `min-width: 0` to shrinkable flex/grid children.
- Remove the 280px search-field minimum at narrow widths.
- Allow nav labels and German words to wrap safely.
- Keep buttons at a usable touch target without forcing horizontal scroll.
- Stack filters and exercise choices before they become cramped.
- Keep the first meaningful route heading within the first viewport on secondary routes.
- Test 200% zoom and text expansion for long translations.
- Verify `document.documentElement.scrollWidth <= window.innerWidth`.

### Motion checklist

- Keep reveal, progress, and card feedback transitions on explicit properties.
- Replace progress width animation with a transform-based inner fill where practical.
- Add `prefers-reduced-motion: reduce` for smooth scrolling, hover lifts, disclosure rotation, and non-essential transitions.
- Do not delay answers or completion behind animation.
- Use motion to clarify state changes, not to decorate every card.

## 15. Wave 9 — performance and implementation quality

### Rendering plan

1. Server-render static route content and records where possible.
2. Keep client components limited to:
   - session interaction;
   - storage hydration;
   - query controls;
   - exercise answers;
   - speech.
3. Move record normalization out of the render path into a data module.
4. Avoid rebuilding all 1,000 records when one progress item changes.
5. Keep Explore bounded; do not add virtualization until a real all-results requirement exists.
6. Consider `React.memo` for `WordCard` only after measuring; do not add memoization everywhere by reflex.
7. Ensure route pages do not import speech or localStorage helpers on the server.

### Performance budgets

Use budgets as regression alarms, not absolute guarantees:

- default Today route mounts only the current card and its visible support content;
- default Explore mounts no more than the configured page size;
- no supported viewport has horizontal overflow;
- route transition does not create a visible blank state;
- no repeated O(1,000 × examples × controls) work on every keystroke;
- hydration console errors remain at zero;
- build output and client chunks are compared before and after the split.

### Portable scripts

Add or repair these scripts:

```json
{
  "typecheck": "tsc --noEmit",
  "test:unit": "node --import tsx --test tests/unit/**/*.test.ts",
  "test:e2e": "playwright test",
  "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
  "test:content": "node scripts/validate-content.mjs",
  "test:responsive": "playwright test tests/e2e/responsive.spec.ts",
  "test:quality": "npm run typecheck && npm run lint && npm run test:unit && npm run test:content && npm run test:e2e"
}
```

If adding `tsx` and Playwright, keep them dev-only and pin versions. If dependency growth becomes a concern, keep pure scheduler tests in `.mjs` and add only Playwright for browser journeys.

Rewrite `scripts/build-verified.sh` so it does not assume GNU `timeout` exists. A small Node watchdog (`scripts/run-with-timeout.mjs`) can provide the same bounded behavior on macOS and Linux while preserving the Sites artifact checks.

## 16. Test plan and acceptance matrix

### Unit tests

| Area | Required assertions |
| --- | --- |
| Scheduler | all outcome transitions, interval ladder, due selection, deterministic tie-breaks |
| Session | fixed IDs, no skip, reveal phase, completion, restart |
| Storage | v1 migration, malformed data, unavailable storage, write failure |
| URL state | parse valid/invalid query values, default state, page clamping |
| Search | scope, case folding, German characters, empty result, filter intersection |
| Content | duplicate rank, missing review fields, suspicious forms, exercise eligibility |
| Exercise bank | exactly one correct answer, four options, stable ordering, no duplicate distractors |

### Browser tests

1. Fresh Today session from rank #001 through completion.
2. Returning-user reload after one known and one learning record.
3. Storage unavailable fallback.
4. Reveal and focus/announcement behavior.
5. Again vs I know it.
6. Explore query/filter/pagination/empty state.
7. Explore page-size boundary; assert bounded card count.
8. Meaning exercise correct/wrong/next.
9. Sentence context exercise with reviewed fixtures.
10. Method route and source links.
11. Reset confirmation and cancellation.
12. Audio unavailable state.

### Accessibility tests

- Axe scan per route with no serious/critical violations.
- Keyboard-only path for every primary task.
- Screen-reader review of landmarks, headings, progress, choices, feedback, and language switching.
- Focus-visible screenshot/DOM checks after route changes and reveals.
- Reduced-motion browser context.

### Responsive tests

At each width, assert:

- no horizontal overflow;
- no clipped text or controls;
- nav remains reachable;
- search/filter controls have labels;
- practice and exercise actions remain in reading order;
- method source links wrap naturally.

## 17. Review checkpoints

Keep implementation reviewable by landing in this order:

1. **Checkpoint A — contracts only:** types, scheduler, storage adapter, pure tests.
2. **Checkpoint B — routes and shell:** real navigation, landmarks, focus handoff, no visual restyle yet.
3. **Checkpoint C — Today:** full state machine and completion path.
4. **Checkpoint D — tokens/primitives:** design system applied to shared components.
5. **Checkpoint E — Explore:** URL filters, bounded results, empty state.
6. **Checkpoint F — Exercises:** radio semantics, feedback, vetted fixtures.
7. **Checkpoint G — Method/content:** honest copy and reviewed data fields.
8. **Checkpoint H — quality pass:** responsive, motion, screen reader, performance, and build scripts.
9. **Checkpoint I — release candidate:** fresh/returning browser evidence, clean build, public handoff.

Each checkpoint should include:

- source files changed;
- screenshots at 1440px and 375px;
- keyboard notes;
- test results;
- known gaps;
- a short decision log entry if behavior changed.

## 18. Rollout and rollback

### Rollout

1. Work on `ui-overhaul` from the published audit commit.
2. Keep the current screenshots and audit docs unchanged as baseline evidence.
3. Land one checkpoint at a time.
4. Run the complete quality suite before merging each wave that changes state or routes.
5. Use a release candidate tag only after the acceptance matrix is green.
6. Re-run the returning-user migration test against a copy of the v1 storage payload.
7. Publish updated screenshots and a changelog with the release candidate.

### Rollback

- Git rollback is the primary safety mechanism; do not delete v1 storage until migration is proven.
- If the scheduler is wrong, keep the UI release but disable new scheduling only if the current state can still render safely; otherwise revert the entire domain wave.
- If content QA is incomplete, show review status and remove affected records from exercises rather than silently generating replacements.
- If a route breaks direct links, preserve `/` as Today and restore the previous client-shell navigation until the route fix is ready.

## 19. Definition of done

The overhaul is complete when all statements below are true:

### Product behavior

- The daily session is stable, deterministic, and complete.
- Again/I know it have explicit, documented scheduler consequences.
- Returning users see their state without hydration errors or flicker that hides progress.
- Exercises have a clear relationship to mastery and scheduling.

### Navigation and UI

- Today, Explore, Exercises, and Method are real destinations.
- Search/filter/pagination state is shareable and refreshable.
- Secondary views open directly on their tool content rather than repeating the full landing hero.
- Empty, error, loading, unavailable, and completion states exist for all major surfaces.

### Accessibility

- Keyboard path works without a mouse.
- Screen reader can identify headings, landmarks, progress, choices, feedback, and language.
- Focus is visible and never hidden behind the sticky header.
- Reduced-motion behavior is implemented.
- State is not communicated by color alone.

### Content

- Visible records have review status and contextual sense data.
- Exercise prompts and distractors are reviewed.
- Method copy matches the implemented scheduler and exercise contract.

### Quality

- No supported viewport has horizontal overflow.
- Explore rendering is bounded.
- Lint, typecheck, unit, content, accessibility, responsive, browser, build, and artifact checks pass.
- `npm test` works on macOS and Linux or documents a deliberate platform-specific alternative.
- The final public repository contains source, plan, evidence, and no generated dependency/build folders.
