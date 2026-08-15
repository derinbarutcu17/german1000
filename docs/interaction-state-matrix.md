# German 1000 — interaction and state matrix

This matrix inventories the important surfaces and the states they need to support. “Current” describes the inspected implementation; “target” is the behavior to build toward.

## Global shell

| Surface | Current | Risk | Target state | Acceptance |
| --- | --- | --- | --- | --- |
| Primary navigation | Buttons mutate local `tab`; URL remains `/`. | No deep link, refresh, or browser-history behavior. | Real links or URL-backed tabs with current-location state. | Direct links, refresh, and back/forward work. |
| Sticky header | Persistent top bar with progress. | Focus target can be hidden below the sticky bar; progress is not a semantic progressbar. | Header remains sticky; view heading receives focus after navigation; progress exposes values. | Keyboard and screen-reader navigation passes. |
| Compact brand | Text reduces to `de` at 375px. | Accessible full name and visual brand variant are implicit. | Explicit compact mark with full accessible name. | No clipping at 280–375px. |
| Focus | CSS has `:focus-visible` outline. | Full traversal was not verified in this browser session; skip link is absent. | Skip link, visible focus, logical order, no focus traps. | Keyboard journey recorded at desktop and mobile. |
| Reset | Immediate local progress reset. | Destructive action has no confirmation or undo. | Confirm with item count/consequence or show undo. | User can recover from accidental activation. |
| Storage failure | Direct localStorage read/write. | Private mode, quota, malformed JSON, and schema changes can fail. | Safe adapter with explicit storage-unavailable state. | Site remains usable without persistence. |

## Practice surface

| State | Current behavior | Target behavior | Acceptance |
| --- | --- | --- | --- |
| First load | Shows a practice card and reveal action. | Same, with explicit session position and total. | `1 / 10` is meaningful and announced. |
| Audio ready | Speech button is available. | Same, with voice/language metadata. | Audio action has a clear accessible name. |
| Audio unavailable | Speech function may no-op while control remains active. | Disabled or clearly labeled unavailable control plus written pronunciation path. | No silent failure. |
| Prompt | Large German word, rank, type, gloss context hidden. | German first; audio and reveal are adjacent; no reliance on color. | Reading order matches visual order. |
| Revealed | Explanation and examples appear; confidence actions appear. | Reveal region updates predictably and keeps focus useful. | Keyboard focus does not jump unexpectedly. |
| Again | Changes learning status and advances through derived daily list. | Keeps item in a documented review queue or reschedules it. | No item disappears unintentionally. |
| I know it | Observed skip from `#001` to `#003`; header/denominator conflict. | Advances exactly one stable session position. | `#002` is next; totals remain correct. |
| Final card | Current fallback can show a word after queue exhaustion. | Explicit completion state with review summary and next action. | No fallback card after completion. |
| Returning user | Progress read during initial state and can mismatch server render. | Server-safe render, hydrated state, storage version. | Reload has no hydration error. |

## Explore

| State | Current behavior | Target behavior | Acceptance |
| --- | --- | --- | --- |
| Baseline | 1,000 records; 12 cards per page; pagination. | Same with route and query state. | Refresh preserves page/filter/search. |
| Search | Search `Haus` returns 7 results including records matching supporting copy. | Label search scope and match behavior. | User can predict why a result matched. |
| Rank/type filter | Selects narrow the result set. | Labels remain associated and reset is clear. | Keyboard/screen-reader labels are present. |
| No results | Not fully exercised in the captured journey. | Dedicated empty state with clear query and reset action. | No blank grid or dead end. |
| Clear | Clears search/filter state. | Restores baseline and announces result count. | Focus remains on search or moves intentionally. |
| Show all | Mounts 1,000 cards and about 6,010 buttons. | Keep pagination or virtualize. | Bounded DOM and responsive navigation. |
| Card details | Native `details` expands examples. | Preserve native disclosure with stable summary names. | Expand/collapse works by keyboard. |
| Hover | Cards lift slightly. | Keep as optional affordance, disabled under reduced motion. | No state depends on hover. |
| Long content | Generated examples can vary in length. | Cards accommodate long copy and preserve alignment. | No clipped text or action collision. |

## Exercises

| State | Current behavior | Target behavior | Acceptance |
| --- | --- | --- | --- |
| Meaning mode | English cue plus four button choices. | Radio group with a clearly labeled question. | Screen reader identifies group and choices. |
| Sentence context mode | German sentence with blank plus four choices. | Same with German language metadata. | Pronunciation and language are correct. |
| Unselected | Four choices are available. | Clear instruction and no accidental selection. | Focus order is stable. |
| Wrong answer | Shows `The answer is ...` plus explanation/examples. | Short live status plus detailed visible explanation. | Status announced once. |
| Correct answer | Shows `Correct.` plus explanation/examples. | Same, with explicit next action and progress update. | User knows whether answer affected learning state. |
| After answer | Next exercise button appears. | Choices lock or remain available according to documented behavior. | No double-submission ambiguity. |
| Mode switch | Meaning/context control changes exercise generator. | Preserve or reset position intentionally and explain it. | Progress denominator stays understandable. |
| Exhausted bank | Not fully verified. | Completion state with option to restart or change mode. | No blank or undefined question. |

## Method

| State | Current behavior | Target behavior | Acceptance |
| --- | --- | --- | --- |
| Article reading | Three long explanatory sections. | Clear heading hierarchy and readable measure. | Heading outline is logical. |
| Sources | Six external links and caveat. | Links have descriptive names and safe external behavior. | Each source is identifiable without surrounding layout. |
| Claim/model mismatch | Copy implies spaced/adaptive behavior. | Copy is the product contract. | Method text is accurate after scheduler decision. |
| Mobile reading | Inherits shared shell and long page. | Focused route header and comfortable measure. | First heading is quickly reachable. |

## Responsive state grid

| Width | Practice | Explore | Exercises | Method |
| ---: | --- | --- | --- | --- |
| 280 | Compact brand; word wraps; controls stack; no overflow. | Search/filter stack and placeholder remains visible. | Choices remain full-width and readable. | Headings and links wrap naturally. |
| 320 | Same with comfortable target sizes. | No horizontal scrollbar. | Feedback does not push next action off-screen. | Source links wrap without clipping. |
| 375 | Current baseline is visually good. | Current baseline is usable. | Confirm all states in browser. | Confirm long copy measure. |
| 768 | Two-column opportunities without squeezed controls. | Filters may be a row. | Feedback and prompt have balanced measure. | Method can use a wider reading column. |
| 1440 | Spacious card and stats. | Three-column results, bounded list. | Centered task with supporting context. | Reading measure stays editorial, not full-width. |
