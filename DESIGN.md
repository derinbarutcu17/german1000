# German 1000 — active design system

This is the implementation source of truth for the first UI overhaul. The longer rationale and acceptance criteria remain in [`docs/ui-overhaul-implementation-plan.md`](docs/ui-overhaul-implementation-plan.md); this file describes what is now live in the code.

## Product posture

German 1000 is a quiet vocabulary studio: frequency-first, context-rich, and designed around returning. The interface uses an editorial structure with an ink-and-paper palette, restrained blue wayfinding, and green only for confirmed progress or correct retrieval.

The experience should feel:

- calm enough for a daily habit;
- explicit about what changes progress and what is only practice;
- generous with context without becoming a dense reference tool;
- direct at every viewport, including 280px.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Ink | `--ink` | `#18232c` |
| Supporting text | `--muted` | `#5f6d76` |
| Paper | `--paper` | `#f6f8f8` |
| Card | `--card` | `#ffffff` |
| Wayfinding | `--accent` | `#176bb4` |
| Wayfinding strong | `--accent-strong` | `#0e4d88` |
| Learning success | `--green` | `#176b50` |
| Revisit warning | `--amber` | `#875d1d` |
| Error/incorrect | `--red` | `#963f3b` |
| Structural line | `--line` | `#d7dfe3` |

Typography uses the bundled Geist variables through `--font-sans` and `--font-mono`. Headings use tight editorial tracking; body copy stays at a comfortable reading measure; metadata uses the mono face and uppercase labels sparingly.

## Surface rules

- Use a single clear primary action per surface.
- Keep the Today session at ten frozen IDs; do not derive the next card from the just-mutated progress array.
- Use native links for destinations and native radios for one-of-many answers.
- Keep cards bounded: Explore is paginated at 12/24/48 and never mounts all 1,000 records.
- Reveal content moves focus to the revealed region; review moves focus to the next word.
- Use `lang="de"` on German words and sentences.
- Never communicate a state with color alone: status labels, answer text, and live feedback are always present.
- Motion is limited to explicit transforms, backgrounds, and borders; reduced motion removes non-essential transitions and smooth scrolling.

## Shared components

- `SiteHeader`: route navigation, current-page state, and global known-word progress.
- `ProgressBar`: semantic `progressbar` with min/max/current values and transform-based fill from the left edge.
- `WordCard`: rank, word kind, learner status, sense note, examples, audio fallback, and bounded review actions.
- `AudioButton`: optional German speech; unavailable voices disable the control and expose a text label.
- `FeedbackPanel`: one live result announcement with the answer and contextual examples.
- `Footer`: local-progress reset with an explicit confirmation step.

## Responsive contract

- Desktop: two-column practice layout and three-column Explore grid.
- Tablet: practice collapses to one column; Explore becomes two columns.
- Mobile: one-column cards, stacked filters/actions, horizontally reachable navigation, no minimum content width beyond 280px.
- At every breakpoint, controls keep a 44px minimum target and focus remains visible against the paper background.
