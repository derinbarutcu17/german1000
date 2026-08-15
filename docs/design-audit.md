# German 1000 — comprehensive design and product audit

**Audit date:** 2026-08-15
**Source:** `/Users/derin/Downloads/german1000-source.zip`
**Audit status:** Needs changes before release
**Score:** 8/20 — major overhaul required before the core learning loop is trustworthy

## Executive assessment

German 1000 has a clear idea: turn a ranked vocabulary list into a calm daily practice surface, an explorable reference, lightweight exercises, and a method page. The strongest part is the editorial direction: generous paper-colored space, restrained blue/green accents, large German words, and a readable progression from prompt to explanation.

The product is not yet safe to scale as a learning tool. The most serious failures are not cosmetic. The “I know it” action can skip a rank, returning users can see a hydration error, the spaced-learning promise is not backed by a spaced-repetition model, and the data layer contains representative translation mistakes. Those issues undermine trust at the exact moment the user is trying to build a habit.

The next work should be sequenced around state correctness and content integrity, then semantics and responsive behavior, and only then broader visual refinement. The current design language is good enough to preserve while those foundations are repaired.

## Scope and method

The audit combined the following lenses:

- Product Design audit: journey, task flow, information architecture, responsive states, and evidence capture.
- Design Director / redesign review: incumbent visual system, hierarchy, component states, and cross-surface coherence.
- Better UI, layout, typography, colors, accessibility, and writing: spacing, type roles, contrast, focus, motion, labels, and error language.
- UI/UX Pro Max: pattern and state benchmarks for learning products, responsive widths, feedback, and navigation.
- Impeccable technical audit: accessibility, performance, responsive behavior, theming, and implementation integrity.
- Web Interface Guidelines review: semantics, keyboard/focus behavior, reduced motion, forms, content structure, and interaction feedback.

Evidence came from source inspection, a local build, static linting and detector checks, and browser journeys at 1440px, 375px, and 280px widths. Screenshots are saved in [`evidence/screenshots/`](evidence/screenshots/).

The audit is intentionally evidence-backed, but it is not a full screen-reader certification, a full linguistic review of all 1,000 entries, or a real-device audio compatibility matrix.

## Scorecard

| Lens | Score | Assessment |
| --- | ---: | --- |
| Accessibility | 2/4 | Good native controls and visible focus CSS, but missing progress semantics, live feedback, German language metadata, skip navigation, and correct single-choice semantics. |
| Performance | 1/4 | The normal view is modest, but “Show all 1,000” creates 1,000 cards, roughly 6,010 buttons, and a 135,126px document with no virtualization. |
| Responsive behavior | 2/4 | 375px is usable and visually coherent; 280px overflows horizontally because the search field retains a 280px minimum and the layout does not fully shrink. |
| Theming and visual system | 2/4 | The paper/ink/blue/green system is coherent and tokenized in places, but status colors and feedback colors are repeated literals, contrast is marginal or failing for some small text, and dark mode is absent. |
| Implementation integrity | 1/4 | The source is buildable and the main surface is understandable, but core progression, hydration, content generation, navigation, and test coverage are not reliable enough for release. |
| **Total** | **8/20** | **Major overhaul required before release.** |

## Strengths to preserve

- The visual voice is distinct without being visually noisy: paper background, dark ink, a blue action color, and green learning reinforcement create a memorable but calm surface.
- The main practice card has a strong reveal rhythm: German word → audio → reveal meaning → explanation/examples → confidence action.
- Native HTML details are used for expandable examples, which is a good accessibility and progressive-enhancement choice.
- Buttons are generally real buttons with useful names, and the stylesheet includes a strong `:focus-visible` outline.
- The site handles `speechSynthesis` voice discovery through `voiceschanged`, which is better than assuming voices are available immediately.
- Explore has search, rank/type filters, pagination, a clear action, and an explicit “Show all” escape hatch.
- The method page includes source links and an important caveat about corpus-based ranking versus a pedagogical syllabus.
- The 375px layout preserves the brand, hierarchy, and action order without collapsing into a cramped desktop layout.
- The build, lint, artifact validation, and rendered HTML smoke test all pass when invoked through macOS-compatible underlying commands.

## Severity model

- **P0 — stop-ship:** data loss, security, or a core path that cannot be used.
- **P1 — release blocker:** the product teaches, navigates, or records the wrong thing, or a major path is materially inaccessible or unstable.
- **P2 — important:** a meaningful quality, responsive, performance, or maintainability problem that should be fixed before broad rollout.
- **P3 — polish:** a lower-risk refinement that improves consistency or future flexibility.

Tracked findings: **0 P0, 7 P1, 11 P2, 2 P3**.

## P1 findings — release blockers

### G100 — “I know it” skips the next rank

**Where:** `app/page.tsx:685-714`
**Evidence:** [`14-practice-skips-rank-002.png`](evidence/screenshots/14-practice-skips-rank-002.png)

**Observed:** Starting clean, rank `#001` is completed with “I know it.” The header reports `1/1,000`, but the daily card advances to rank `#003`, while the session indicator reports `2 / 10` and the completion line still reads `0% complete`.

**Why it matters:** The product silently loses a word and presents contradictory progress. A learning product cannot ask users to trust its sequence if the primary action changes the sequence incorrectly.

**Likely cause:** `mark()` increments `sessionIndex` after rebuilding `daily`; `current` then reads the already-advanced item. The daily list also uses `daily.length` as the fallback denominator even after a rank is removed.

**Fix direction:** Make the session an explicit state machine. Capture the completed item, update its status, derive the next item from the same stable session list, and separately track `sessionPosition` and `sessionTotal`.

**Acceptance criteria:**

- Completing rank `#001` shows rank `#002` next.
- The daily denominator remains `10` for a full first session.
- Completing the final card shows an explicit completion state instead of a fallback word.
- “Again” and “I know it” have deterministic, tested transitions.
- A unit or browser test covers first card, middle card, last card, and an empty queue.

### G101 — Returning users can trigger a React hydration error

**Where:** `app/page.tsx:580, 653-667`
**Evidence:** [`03-returning-hydration-error.png`](evidence/screenshots/03-returning-hydration-error.png)

**Observed:** After progress is saved, reloading the same origin renders a dev error overlay. The server produces `0` progress while the client’s initial render reads `1` from `localStorage`; React reports a hydration mismatch and regenerates the tree.

**Why it matters:** Returning to practice is the primary habit loop. A hydration failure can cause visual flicker, broken state, console noise, and production-only divergence that is difficult to diagnose.

**Fix direction:** Initialize the progress state to a server-safe default, then hydrate from storage in an effect with an explicit `isHydrated` gate. Wrap storage reads and writes in a safe adapter that handles private mode, quota errors, malformed JSON, and schema migration.

**Acceptance criteria:**

- A returning-user reload produces no hydration warning or error.
- The first client frame has a deliberate loading or neutral progress state.
- Malformed storage falls back to a clean state without crashing.
- Storage failures leave the learning surface usable and expose a non-blocking notice.

### G102 — Spaced-learning language overpromises the implementation

**Where:** `app/page.tsx:685-714`, method copy in the same file
**Evidence:** [`10-method-sources.png`](evidence/screenshots/10-method-sources.png)

**Observed:** The method story describes an adaptive, spaced approach, while the implementation stores only a lightweight learning/known status and session progress. There is no due date, interval, ease, streak, attempt count, or review schedule. Exercise answers do not update the practice model.

**Why it matters:** This is a product-trust issue, not just a missing feature. Users are told that the system will bring words back intelligently, but the current behavior is a ranked list with a daily slice.

**Fix direction:** Either implement a minimal honest scheduler or change the method copy to describe the current ranked practice accurately. If implementing, define the smallest model first: `status`, `dueAt`, `interval`, `streak`, `lastReviewedAt`, and `attempts`.

**Acceptance criteria:**

- The method page and the actual algorithm describe the same behavior.
- A reviewed word has a persisted next-review date.
- Exercise success/failure either updates the scheduler or is explicitly outside the scheduler’s scope.
- A visible review queue can be explained in one short paragraph.

### G103 — Representative vocabulary records contain high-risk gloss errors

**Where:** `app/words.ts`
**Evidence:** static inspection of representative records; examples are visible through Explore and Practice.

**Observed examples:** rank 77 `schon` is glossed as “beautiful” rather than its common “already”; rank 103 `meine` is glossed as “think”; rank 137 `gibt` is glossed as “are”; rank 161 `soll` is glossed as “target”; rank 994 `gewissen` is glossed as “conscience.” These may be context-dependent forms, but the current single-gloss presentation gives no context that would make several of them safe.

**Why it matters:** A visually polished learning product with wrong or contextless translations actively teaches mistakes. The dataset is the product.

**Fix direction:** Add an editorial source of truth with part of speech, inflection, sense, register, example provenance, and reviewer status. Do not use generated templates as the default explanation for every word.

**Acceptance criteria:**

- Every record has a reviewed primary sense and part of speech.
- Context-dependent forms show a short context note or a context-rich example.
- Examples are reviewed for grammar, translation, and naturalness.
- A data QA report flags duplicate ranks, duplicate lemmas, missing fields, suspicious gloss patterns, and unreviewed records.

### G104 — Main views are stateful tabs without URLs or browser history

**Where:** `app/page.tsx:1, 734`
**Evidence:** Explore, Exercises, and Method are rendered through client state; [`05-explore-viewport.png`](evidence/screenshots/05-explore-viewport.png) and [`10-method-sources.png`](evidence/screenshots/10-method-sources.png)

**Observed:** The top navigation uses buttons that mutate a local `tab` state. The URL remains `/`, there are no deep links, and browser back/forward cannot restore a view. Tab changes also leave the large hero and stats content in the page, increasing scroll overhead.

**Why it matters:** A reference tool needs shareable and revisitable locations. The current structure makes refreshes, bookmarks, browser history, and assistive navigation less predictable.

**Fix direction:** Use URL-backed view state (`/`, `/explore`, `/exercises`, `/method`) or real route segments. Preserve the current visual shell, but make navigation actual links and manage focus/scroll when the view changes.

**Acceptance criteria:**

- Each main view has a stable URL.
- Browser back/forward restores the previous view.
- Refreshing a view preserves it.
- Navigation has an active link state and a predictable focus target.
- Explore search, filters, and pagination are either URL-backed or intentionally documented as ephemeral.

### G105 — Dynamic feedback and quiz choices need stronger semantics

**Where:** `app/page.tsx:576-577, 629-643, 746`
**Evidence:** [`08-exercise-meaning.png`](evidence/screenshots/08-exercise-meaning.png), [`09-exercise-context-correct.png`](evidence/screenshots/09-exercise-context-correct.png)

**Observed:** The progress bar is a plain `div` with `aria-label` but no `role="progressbar"` or value attributes. Exercise choices use `aria-pressed` even though they represent one answer from a set. Wrong/correct feedback is inserted visually without a live-region announcement. The document language is `en` and no German spans carry `lang="de"`.

**Why it matters:** Screen-reader users may not know what changed, how far they have progressed, or how the answer set behaves. Speech tools also need language metadata to pronounce German reliably.

**Fix direction:** Use a real progressbar with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`; use a radio-group pattern or native radios for one-of-four answers; add a concise `role="status"` or `aria-live="polite"` result; set `lang="de"` on German words/sentences and use a skip link.

**Acceptance criteria:**

- A screen reader can identify progress and its current value.
- A user can determine which answer set is active and whether the answer was correct.
- Result text is announced once, without duplicating the full explanation.
- German pronunciation is exposed with correct language metadata.
- A keyboard user can skip the persistent header and reach the current task.

### G106 — “Show all 1,000” is an unbounded rendering path

**Where:** `app/page.tsx` Explore rendering; [`07-explore-all-1000.png`](evidence/screenshots/07-explore-all-1000.png)

**Observed:** The all-results state renders 1,000 cards, roughly 6,010 buttons, a 135,126px document, and a 1,425px body width in the 1440px session. A semantic click on the Exercises nav timed out while this full DOM was active; the interaction eventually succeeded through a lower-level node click.

**Why it matters:** The reference view becomes expensive precisely when the user asks for the full reference. Long DOMs degrade navigation, memory, screen-reader traversal, find-in-page, and mobile scrolling.

**Fix direction:** Prefer paginated results as the default. If “show all” is retained, use windowing/virtualization, a result count warning, and an accessible list that does not mount off-screen cards.

**Acceptance criteria:**

- 1,000 results do not mount 1,000 interactive cards at once.
- Navigation remains responsive after showing all.
- The all-results state has a bounded memory and DOM budget documented in a performance test.
- A screen reader can move through results without thousands of irrelevant controls.

## P2 findings — important follow-ups

### G107 — Narrow viewport overflow at 280px

**Where:** `app/globals.css:112-114, 228-239`
**Evidence:** [`13-explore-mobile-280-overflow.png`](evidence/screenshots/13-explore-mobile-280-overflow.png)

At 280px, the document reports a 300px body width and the search control remains clipped. The mobile rule sets `width: 100%` but does not remove the earlier `min-width: 280px`; combined with page padding this creates overflow. Add `min-width: 0` to shrinkable flex/grid children, use `width: min(100%, ...)`, and test 280/320/375px explicitly.

### G108 — No reduced-motion path

**Where:** `app/globals.css:20, 41, 57, 123`

The stylesheet uses smooth scrolling, progress width animation, button transitions, and hover transforms, but contains no `prefers-reduced-motion` override. Add a reduced-motion layer that disables smooth scrolling and non-essential transforms/transitions while preserving state changes.

### G109 — Small-text contrast is inconsistent

**Where:** `app/globals.css:3-16`; browser color calculation

Measured representative ratios: accent on paper `4.23:1`, soft muted on white `3.18:1`, green on green-soft `4.15:1`, muted on paper `4.50:1`. The first three are below the 4.5:1 small-text target. Darken the text roles or reserve those colors for larger text and non-text decoration. Do not solve this by making every surface darker; preserve the quiet paper system and adjust semantic text tokens.

### G110 — Reset is immediate and destructive

**Where:** `app/page.tsx:748-750`

“Reset local progress” clears the learning state immediately. Put the action behind a confirmation that states exactly what will be deleted, or provide an undo window. The control should remain keyboard- and screen-reader-clear about the consequence.

### G111 — Audio affordances do not expose unavailable speech

**Where:** `app/page.tsx:509-523`

Speech is a best-effort browser feature, but the audio controls remain active when speech synthesis is unavailable or a voice is not ready. Disable or relabel the control when unsupported, expose an error/status message if playback fails, and keep the written pronunciation path complete.

### G112 — Shared hero and stats create unnecessary scroll cost for secondary views

**Where:** `app/page.tsx` render structure; [`05-explore-viewport.png`](evidence/screenshots/05-explore-viewport.png)

Every tab keeps the large hero/stat shell above the active content. That makes Explore, Exercises, and Method feel like sections below a landing page rather than tools. Keep the brand shell, but collapse or shorten the hero after navigation, or give each tool a focused route-level header.

### G113 — Font and token system are only partially connected

**Where:** `app/layout.tsx:2-16`, `app/globals.css:16`

Geist is loaded but the global font token uses Arial, while the context prompt switches to Georgia. The result is a mixed type system without explicit role definitions. Choose one primary UI face, one optional display/editorial face, and one mono/meta face; encode them as semantic tokens rather than relying on browser fallbacks.

### G114 — Automated coverage is too thin for a learning loop

**Where:** `tests/rendered-html.test.mjs`

The existing test validates development-preview metadata but does not cover progression, storage hydration, navigation, exercise feedback, filters, empty states, responsive overflow, speech failure, or content integrity. Add focused unit tests for the state model and browser tests for the critical flows before visual refinement.

### G115 — Starter and deployment residue makes the public repo less legible

**Where:** `package.json`, `package-lock.json`, `.openai/hosting.json`, generated folders excluded from this copy

The lockfile retains starter naming, and the project includes optional D1/Drizzle/dispatch surfaces that the current learning UI does not use. Keep the source intact for now, but document what is active versus optional, rename the package when the scope is intentional, and supply a deployment-specific hosting config outside the public audit copy.

### G116 — State colors and feedback borders need semantic tokens

**Where:** `app/globals.css:129, 161-163`

Learning states and feedback colors are repeated as literals, and the detector flags the 3px single-side feedback border as a generic visual pattern. This is not a stop-ship issue, but semantic tokens and a clearer feedback component would improve consistency and make contrast review easier.

### G117 — Progress animation transitions a layout property

**Where:** `app/globals.css:41`

The progress bar animates `width`. Prefer a transform-based fill with a stable track, then disable that motion under reduced-motion. This keeps the visual movement without asking layout to recalculate the bar width during the animation.

## P3 findings — polish

### G118 — Small-brand behavior is not explained in the system

At 375px the header intentionally reduces the brand to “de.” This works as a compact mark, but the behavior should be an explicit responsive brand variant with an accessible full name rather than an incidental text clip.

### G119 — Metadata could better support sharing

`app/layout.tsx` has title, description, and favicon metadata, but no Open Graph image or explicit theme-color metadata. Add these after the visual identity settles so shared links communicate the same calm editorial system.

## Journey audit

### 1. First-time practice

**Current flow:** load → read word → play audio → reveal meaning → choose Again/I know.
**Good:** clear single-task hierarchy and visible next action.
**Risk:** progress semantics are weak, “I know it” skips rank #002, and the first exercise/learning model is not clearly connected.
**Target:** make each daily card a deterministic state machine with a stable position, explicit completion, and honest progress.

### 2. Returning practice

**Current flow:** load saved progress from local storage during initial render.
**Risk:** hydration mismatch and storage failure paths.
**Target:** server-safe first render, explicit hydration state, schema-versioned storage adapter, and a recoverable storage notice.

### 3. Explore

**Current flow:** open secondary view → search/filter → paginate or show all → expand examples.
**Good:** filters and pagination are discoverable; card anatomy is consistent.
**Risk:** every secondary view inherits the landing-page shell; search matches examples/explanations in ways that may surprise users; show-all creates an unbounded DOM.
**Target:** route-level reference view, clearly labeled search scope, bounded result rendering, and empty/loading/error states.

### 4. Exercises

**Current flow:** choose Meaning or Sentence context → choose one of four answers → see feedback → next.
**Good:** the two modes are easy to understand and feedback includes explanation/examples.
**Risk:** choice semantics, live feedback, progress, and scheduler integration are incomplete.
**Target:** accessible radio-group interaction, concise announced result, retry/next behavior, and an explicit relationship to practice progress.

### 5. Method

**Current flow:** read three method sections → open six sources → inspect caveat.
**Good:** the caveat prevents false precision and the sources make the story auditable.
**Risk:** the method claims are stronger than the current scheduler implementation.
**Target:** make the method page the contract for the actual product behavior.

## Visual system assessment

### Layout and alignment

The desktop grid uses a sensible max width and consistent section gutters. The main weakness is not misalignment within individual cards; it is hierarchy across views. The large header/hero/stats block persists above tools that need a focused working context. The 280px failure is a concrete flex-sizing problem rather than a conceptual grid problem.

### Typography

The oversized German word creates a strong learning focal point. Metadata is appropriately compact, but 10–12px labels are used with muted colors that do not always meet contrast targets. The loaded Geist font is not the active global face, and the Georgia context prompt is not framed as a deliberate editorial role. Establish type roles before adding more expressive display treatment.

### Color and contrast

The paper/ink/blue/green palette is the right foundation. Keep blue for primary actions and links, green for success/known states, red for corrective feedback, and neutral ink for content. Adjust small-text semantic tokens; do not use soft accent colors as body text. Add a contrast check to CI for the semantic token set.

### Components and surfaces

Cards, pills, filters, answer choices, and details blocks share a recognizable vocabulary. The feedback card’s left border and repeated literal colors should be consolidated into a `Feedback` component with explicit `success`, `error`, and `info` variants. Buttons need a documented state set: default, hover, pressed, focus-visible, disabled, loading, and unavailable-audio.

### Motion and interaction

The interaction timing is generally restrained. The key issue is coverage, not excess: there is no reduced-motion path, and progress uses a layout property. Prefer small opacity/transform changes for reveal and answer feedback, keep transitions on explicit properties, and make the movement optional.

## Content and learning-model assessment

The ranked list is a useful organizing device, but rank is not the same as curriculum. The UI should distinguish:

1. corpus frequency or list rank;
2. learner state;
3. review scheduling;
4. grammatical and contextual information.

Currently those concepts are visually close but behaviorally under-modeled. The content audit in [`content-audit.md`](content-audit.md) proposes a review workflow that makes a word’s sense, part of speech, example, and confidence visible to editors before the data is treated as teaching material.

## Recommended next sequence

1. Repair the practice state machine and add tests around all queue transitions.
2. Make storage hydration safe and resilient.
3. Freeze the current content surface while the dataset receives editorial QA.
4. Decide whether to implement a minimal scheduler or rewrite the method copy honestly.
5. Convert tabs to URL-backed navigation and simplify the secondary-view shell.
6. Repair progress/quiz/live-region/language semantics.
7. Remove narrow-width overflow and add reduced-motion behavior.
8. Bound Explore rendering with pagination or virtualization.
9. Normalize tokens, fonts, semantic colors, and component states.
10. Add browser, accessibility, and content-integrity coverage before visual polish.

The detailed implementation-ready version is [`priority-backlog.md`](priority-backlog.md).
