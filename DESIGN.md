# German 1000 — active design system

This file is the implementation source of truth for the stateless vocabulary environment. The product is intentionally a tool users can open and play with immediately: no onboarding method story, account, database, daily queue, learner profile, or saved progress.

## Product posture

German 1000 is a quiet vocabulary studio: frequency-first, context-rich, and a little whimsical. It uses an editorial ink-and-paper palette, restrained blue wayfinding, and a small asterisk motif to make a large dataset feel inviting rather than mechanical.

The experience should feel:

- immediate: the landing page is the flashcard exercise;
- surprising: each tab load and shuffle creates a fresh order;
- complete: every round contains all 1,000 records;
- generous with context: explanations and examples are always close to the word;
- honest: nothing is described as saved, due, mastered, or tracked;
- usable at every viewport, including 280px.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Ink | `--ink` | `#18232c` |
| Supporting text | `--muted` | `#5f6d76` |
| Paper | `--paper` | `#f6f8f8` |
| Card | `--card` | `#ffffff` |
| Wayfinding | `--accent` | `#176bb4` |
| Wayfinding strong | `--accent-strong` | `#0e4d88` |
| Success feedback | `--green` | `#176b50` |
| Context warning | `--amber` | `#875d1d` |
| Incorrect feedback | `--red` | `#963f3b` |
| Structural line | `--line` | `#d7dfe3` |

Typography uses the bundled Geist variables through `--font-sans` and `--font-mono`. Headings use tight editorial tracking; body copy stays at a comfortable reading measure; metadata uses the mono face and uppercase labels sparingly.

## Surface rules

- The landing route is the primary flashcard exercise, not a Today dashboard.
- The landing deck is a Fisher–Yates permutation of all 1,000 records. It is created in the browser after the server-safe loading frame, lives in memory for that tab, and is replaced on reload, completion, or shuffle.
- The back of a flashcard contains the gloss, explanation, optional usage note, and all three examples. The front contains only the German form, rank/type context, audio, and reveal action.
- Exercises use one meaning question per record, four distinct answer labels, randomized question order, randomized options, and an explicit completion state at 1,000.
- Explore is one continuous, single-column index. Search and valid word-type filtering are ephemeral URL state; there is no page size, pagination, progress filter, or virtualized replacement for the scrollable document.
- Use native links for destinations, native radio inputs for one-of-many answers, and native `details` for examples in the long index.
- Use `lang="de"` on German words and example sentences. Dynamic changes get a concise `role="status"` announcement, and focus moves to a useful revealed or completed region.
- Never communicate a state with color alone. Answer text, labels, and live feedback remain present.
- Motion is limited to explicit transforms, backgrounds, and borders; reduced motion removes non-essential transitions and smooth scrolling.

## Shared components

- `SiteHeader`: brand, Cards/Explore/Exercises navigation, current-location state, and the static “1,000 forms · no account” note.
- `WordCard`: read-only rank, form, kind, gloss, explanation, editorial note, and native examples disclosure for Explore.
- `WordExamples`: three context examples; audio is available in the active flashcard and feedback surfaces and intentionally omitted from the 1,000-card index for page performance.
- `AudioButton`: optional German speech with an accessible label and a text-first interface when speech is unavailable.
- `FeedbackPanel`: one live correct/incorrect result with the correct answer.
- `Footer`: static reassurance that the vocabulary is ranked and no account is required.

## Responsive contract

- Desktop: spacious hero plus one large flashcard; Explore remains a single long reading column; Exercises center one focused question.
- Tablet: hero note and controls can stack; filter controls remain readable without forcing a horizontal scroll.
- Mobile: one-column cards, stacked actions and filters, horizontally reachable navigation, and no minimum content width beyond 280px.
- Every interactive control keeps a 44px minimum target and a visible focus treatment against the paper background.
- The 1,000-word Explore document may be long, but it must never become wider than the viewport or hide its disclosure controls.
