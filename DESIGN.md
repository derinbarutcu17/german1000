# German1000 design system

This is the visual and interaction source of truth for German1000. The product is a small, static learning instrument: the learner opens it, sees one useful word, retrieves its meaning, and keeps moving. The interface should feel calm, editorial, and quietly playful without asking the learner to decode the chrome.

## Product direction

**Direction: quiet editorial instrument.** Use a warm paper background, dark ink, a restrained blue action color, and the blackletter wordmark as the only expressive brand gesture. The content is the hero. Whitespace should separate decisions and reading groups, not create giant empty containers.

The learner’s primary jobs are:

1. Scan the current word and its meaning.
2. Make one answer choice with minimal visual noise.
3. Get immediate, legible feedback and continue.
4. Browse the full vocabulary without losing the page’s rhythm.

Avoid decorative labels, redundant explanations, oversized blank cards, dense all-caps copy, pill-shaped UI used everywhere, gradients, and state information that is not actionable.

## Typography rules

### Font roles

- `--font-sans` (Geist) is the default for body copy, headings, navigation, controls, and learning content.
- `--font-mono` is reserved for compact counters, ranks, and technical metadata. It is not a default display face.
- `--font-brand` (blackletter) is reserved for the `German1000` wordmark. It must not appear in learning content.

### Type scale

Use semantic roles rather than one-off sizes:

| Role | Use | Size / leading | Weight |
| --- | --- | --- | --- |
| Display | landing and completion headlines | `clamp(2.75rem, 6vw, 5rem)` / `0.98` | 600 |
| Page title | page-level headings | `clamp(2.5rem, 5vw, 4rem)` / `1.02` | 600 |
| Section title | supporting headings | `clamp(2rem, 4vw, 3.25rem)` / `1.05` | 550 |
| Word display | German vocabulary words | `clamp(2.75rem, 8vw, 7rem)` / `1.0` | 600 |
| Body | explanations and examples | `1rem` / `1.55` | 400–500 |
| Body small | supporting copy | `0.875rem` / `1.5` | 400–500 |
| Label | field labels and feedback labels | `0.75rem` / `1.35` | 600–700 |
| Meta | ranks and changing counters | `0.6875rem` / `1.35` | 600–700 |

All UI copy is written in sentence case. Do not type content in all caps. Uppercase styling is not a general-purpose hierarchy tool; if a small metadata label needs extra separation, use the mono face and modest letter spacing without changing the user’s case.

Headings use `text-wrap: balance`; descriptions use `text-wrap: pretty` where supported. Body text is capped around `60–75ch`. Body copy uses no letter-spacing adjustment. Display text may use a small negative value, never more than `-0.03em` by default. German words specifically use natural spacing (`0` to `-0.02em`) with normal kerning so umlauts and adjacent letters remain open and readable.

Changing values use tabular numerals. Inputs remain at least `16px` on narrow screens to avoid mobile browser zoom.

## Spacing rules

The base unit is 4px. Prefer these tokens in order:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`

- `4–8px`: icon-to-label and micro relationships.
- `12–16px`: control padding and related text lines.
- `24px`: separation between content groups.
- `32px`: card sections and page sub-groups.
- `48–64px`: page-level transitions and hero breathing room.

Cards use content-driven height. Do not use a large fixed or minimum height merely to create drama. The exercise card is a task surface: its question, choices, action, and feedback should fit in one compact reading group. Desktop card padding is `24–32px`; mobile padding is `16–20px`. Choice rows remain at least `44px` tall for comfortable input.

## Layout rules

- Shared content aligns to a consistent page edge and uses a readable max width.
- Exercises use one clear vertical flow: page title and score, question metadata, word, answer group, action and position, feedback.
- The correct and wrong counters live in one compact score card and never compete with the question.
- Navigation is sentence case, horizontally scrollable only when needed, and has a visible active and keyboard focus state.
- Explore remains one continuous, searchable document. Search results and word entries should not introduce unrelated panel chrome.
- At 320px wide and 200% zoom, content reflows without horizontal scrolling.

## Color and surfaces

Keep the established hex token format. The semantic roles are:

- `--paper`: page background.
- `--card`: raised reading surface.
- `--ink`: primary content and actions.
- `--muted` / `--soft-muted`: secondary and tertiary text.
- `--line` / `--line-strong`: structural separation and control borders.
- `--accent`: navigation, focus, links, and primary learning emphasis.
- `--green` / `--green-soft`: correct feedback only.
- `--red` / `--red-soft`: wrong feedback only.

Use one strong action color per view. Keep secondary controls neutral. Borders should provide structure; shadows should be soft and shallow. No gradients.

## Component rules

### Exercise card

The question is the visual anchor. The German word is a single large heading, centered only when that improves focus. The prompt is a short, sentence-case fieldset legend. Answer choices are native radio inputs with a full-row label, clear selected state, and a minimum 44px target. “Check answer” is disabled only until a choice is selected, then becomes the single primary action. After submission, preserve the choices and show concise feedback inline. “Next question” advances the shuffled in-memory round.

### Flashcard

The front shows rank, word type only when useful, the German word, and a direct reveal action. The back shows one plain-language gloss, explanation, and real sentence examples. Remove metadata that does not help recall. The front and back must not use audio or hidden voice controls.

### Explore entries

Each entry presents the word, gloss, one useful explanation, and expandable examples in context. Example sentences must be real German sentences with an English translation; do not use generic placeholder prose or self-referential template language.

## Interaction and accessibility

- Prefer native links, buttons, inputs, radio groups, and `details` elements.
- Every control has a visible or programmatic label and a minimum 40–44px hit area.
- Use `:focus-visible` with a 2–3px accent ring and preserve it in forced-colors mode.
- Do not rely on color alone for correct/wrong states; include text.
- Keep focus on the question heading when a new question loads so keyboard users understand the transition.
- Use `aria-live="polite"` for non-blocking round feedback and avoid noisy announcements.
- Respect `prefers-reduced-motion`; never use motion to communicate essential state.

## Copy rules

Use direct, useful language:

- “Choose the closest meaning.”
- “Check answer”
- “Next question”
- “Finish round”
- “Examples in context”

Avoid internal implementation language (“in-memory order”, “frequency-ranked forms”, “how exercises work”) in the learning flow. Mention the no-account/static behavior only where it is necessary for trust, not as persistent UI decoration.

## Review checklist

Before shipping a UI change, check:

- Is there one clear primary action?
- Can the learner understand the current state in one glance?
- Are headings in a logical visual and semantic hierarchy?
- Is any all-caps text doing real work, or is it decorative noise?
- Do German words have comfortable natural letter spacing at desktop and mobile sizes?
- Are card heights content-driven and the vertical gaps intentional?
- Are counters tabular and stable as they change?
- Does keyboard focus, reduced motion, 200% zoom, and 320px reflow work?
- Do the cards, Explore list, and Exercises page share the same type, spacing, border, and control language?
