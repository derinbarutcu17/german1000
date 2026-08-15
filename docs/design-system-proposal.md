# German 1000 — design-system proposal

This is a refinement proposal, not a mandate to replace the current visual language. The current paper/ink/blue/green direction is worth preserving. The goal is to make it more explicit, accessible, and reusable while the product foundations are repaired.

## Design principles

1. **Quiet surface, strong task:** the interface should feel calm until a learner needs to act.
2. **German is the hero:** the German word or sentence gets the strongest typographic emphasis; supporting English should remain clear but secondary.
3. **State is explicit:** known, again, correct, incorrect, unavailable, loading, and complete need visible and semantic differences.
4. **Editorial precision over decoration:** a display treatment is valuable only when it improves recall, comprehension, or confidence.
5. **One source of truth:** design tokens, learning state, and content metadata should each have one authoritative layer.

## Current system to preserve

| Role | Current direction | Recommendation |
| --- | --- | --- |
| Canvas | `--paper: #f7f8f8` | Keep as the primary light canvas. |
| Ink | `--ink: #17202a` | Keep as primary content text. |
| Muted text | `--muted: #68747d` | Keep for secondary text after checking each size/contrast pair. |
| Soft muted | `--soft-muted: #87929a` | Restrict to large text, metadata with sufficient size, or non-text decoration. |
| Action blue | `--accent: #1d77d6` | Keep for large labels, icons, and action surfaces; choose a darker semantic text/link value for small text. |
| Learning green | `--green: #1f8564` | Keep the role but verify it against its soft surface and never use color alone. |
| Corrective red | `--red: #b64f49` | Keep the role but pair with icon/text and verify contrast. |
| UI type | Geist is loaded; Arial is active | Choose one active UI family and connect it to semantic variables. |
| Editorial type | Georgia is used for context | Keep only if it is a deliberate editorial role. |

## Token layers

### Primitive tokens

Primitive values should live in one place and should not be copied into component rules.

```css
:root {
  --color-ink-950: #17202a;
  --color-ink-700: #4f5c66;
  --color-ink-600: #68747d;
  --color-ink-500: #87929a;
  --color-paper-50: #f7f8f8;
  --color-white: #ffffff;
  --color-line-200: #d9e0e4;
  --color-blue-700: #155fae;
  --color-blue-600: #1d77d6;
  --color-blue-50: #eaf4ff;
  --color-green-700: #176b50;
  --color-green-600: #1f8564;
  --color-green-50: #eaf7f2;
  --color-red-700: #963d39;
  --color-red-600: #b64f49;
  --color-red-50: #fff0ed;
}
```

The exact values should be finalized with a contrast checker. The important rule is that small text uses a semantic value chosen for text contrast, not the same bright value used for a large decorative accent.

### Semantic tokens

```css
:root {
  --surface-canvas: var(--color-paper-50);
  --surface-raised: var(--color-white);
  --surface-action: var(--color-blue-600);
  --surface-action-subtle: var(--color-blue-50);
  --surface-positive: var(--color-green-50);
  --surface-negative: var(--color-red-50);

  --text-primary: var(--color-ink-950);
  --text-secondary: var(--color-ink-700);
  --text-tertiary: var(--color-ink-600);
  --text-on-action: var(--color-white);
  --text-positive: var(--color-green-700);
  --text-negative: var(--color-red-700);
  --text-link: var(--color-blue-700);

  --border-subtle: var(--color-line-200);
  --border-focus: var(--color-blue-700);
  --border-positive: var(--color-green-600);
  --border-negative: var(--color-red-600);
}
```

### Spacing and shape

Use a small set of composable values rather than one-off gaps:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 80px;

  --radius-control: 6px;
  --radius-card: 10px;
  --radius-pill: 999px;
  --border-thin: 1px;
  --focus-ring: 3px;
}
```

The existing editorial square/low-radius look should remain the default. Use pills for tags and compact filters, not for every control. Avoid introducing a heavy claymorphism layer simply because a benchmark recommends it; it would compete with the current quiet study surface.

## Type roles

| Role | Use | Starting guidance |
| --- | --- | --- |
| `display-word` | Main German lemma | `clamp(3rem, 7vw, 5.4rem)`, tight line-height, strong weight, no forced uppercase. |
| `display-section` | Main page heading | `clamp(2rem, 4vw, 3.5rem)`, compact line-height. |
| `body` | Explanations and method copy | 16–18px, 1.5–1.65 line-height, readable measure. |
| `body-german` | Sentence prompts/examples | Same readable size, `lang="de"`, optional editorial face only if intentional. |
| `label` | Filters, buttons, status | 13–15px; never use the softest muted token below contrast. |
| `meta` | Rank, progress, source labels | 11–13px, mono or small sans, high enough contrast. |
| `mono-rank` | Rank numbers and structured values | Use the loaded mono face consistently. |

The practice word should be visually dominant without being the only way to find the task. The reveal button, prompt label, and progress should remain discoverable in the reading order.

## Component contracts

### `TopBar`

- Real links for primary navigation.
- Sticky behavior with a visible focus target below it.
- Compact mark variant at narrow widths with an accessible full name.
- No horizontal overflow; flex children use `min-width: 0`.
- Progress is a labeled `progressbar`, not an unlabeled decorated div.

### `PracticeCard`

States: `prompt`, `revealed`, `again-selected`, `known-selected`, `complete`, `storage-unavailable`, `audio-unavailable`.

- Keep the German word in the DOM before English support text.
- Audio button announces its action and availability.
- Reveal changes a stable region rather than causing the whole card to jump unpredictably.
- Confidence actions explain their consequence in accessible text.

### `WordCard`

- Stable card height is not required, but the grid should tolerate long examples.
- Rank, type, lemma, gloss, and learning status have distinct text roles.
- Expansion uses native details or an equivalent disclosure pattern.
- Hover lift is optional and disabled for reduced motion.

### `ExerciseChoiceGroup`

- Use native radios or a fully compliant radio-group pattern.
- Keep all four choices reachable in a predictable order.
- Disable or lock choices after the answer only if the UI communicates why.
- Feedback has a short status line plus a detailed explanation; only the short status is live-announced.

### `Feedback`

Variants: `success`, `error`, `info`, `warning`.

- Use icon + text + border/surface; never color alone.
- Replace repeated literal border colors with semantic tokens.
- Prefer a subtle top or full outline for responsive consistency over a detector-triggering single-side rule where it does not add meaning.

### `Filters`

- Every field has a visible label or a correctly associated accessible name.
- Search scope is explicit: lemma only, or lemma + explanation/examples.
- Selects have a clear reset path.
- On narrow widths, controls stack without fixed minimums that exceed the viewport.

## Responsive model

Use these as test contracts rather than as assumptions:

| Width | Expected behavior |
| ---: | --- |
| 280px | No horizontal scroll; compact brand; controls stack; long German words wrap safely. |
| 320px | Same as 280px with comfortable control targets and no clipped placeholders. |
| 375px | Mobile baseline; two-column or single-column decisions remain intentional. |
| 768px | Tablet layout; filters may return to a row if each control can shrink. |
| 1024px | Comfortable tool layout; secondary shell should not dominate. |
| 1440px | Three-column Explore grid and generous reading measure. |

Rules:

- Set `min-width: 0` on flex/grid children that should shrink.
- Prefer `width: min(100%, var(--measure))` to fixed minimums.
- Use `overflow-x: clip` only as a last-resort guard after fixing the child causing overflow.
- Keep interactive targets at or above the project’s chosen touch target size.
- Allow German words and examples to wrap without clipping.

## Motion model

Default motion should be restrained and purposeful:

- 150–200ms for hover/pressed feedback.
- 200–300ms for reveal/feedback transitions when the content change benefits from continuity.
- Animate opacity and transforms before layout properties.
- Progress fill uses a transform-based inner bar with a stable track.
- Smooth scroll is opt-in and disabled for reduced-motion users.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

The override should be paired with a meaningful static state; it should not hide content or make completion ambiguous.

## Accessibility contract

- One `h1` per view; heading levels reflect structure rather than visual size.
- A skip link appears before the persistent header.
- Main navigation uses links with current-location semantics.
- German content has `lang="de"` at the smallest useful span.
- Progress uses the progressbar role and value attributes.
- Quiz choices use radios or a compliant radio group.
- Correct/incorrect result has a polite live region.
- Focus-visible rings are never removed; sticky headers do not cover the focused target.
- Color is paired with text, icon, or shape.
- Audio controls state whether speech is available.
- Storage and content errors are actionable and announced.

## Content-system contract

Each publishable word should be able to answer:

1. What is the lemma and inflected form?
2. What is the part of speech?
3. What is the primary sense in this context?
4. Is there an alternate sense that should be shown?
5. Is the example natural and grammatically correct?
6. Who reviewed it and when?
7. How does learner state change after Again, I know, correct, and incorrect?

If the product cannot answer those questions, it should label the item as a frequency reference rather than a verified lesson.
