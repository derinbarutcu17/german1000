# German 1000 — interaction and state matrix

The only state in the product is temporary UI state. The vocabulary records are static source data; no state below is persisted.

## Global shell

| Surface | States | Target behavior | Acceptance |
| --- | --- | --- | --- |
| Primary navigation | Current route / inactive route | Real links for Cards, Explore, and Exercises with current-page semantics. | Direct links, refresh, and back/forward work. |
| Sticky header | Desktop / narrow mobile | Brand and horizontally reachable nav; no progress bar or account state. | No clipping at 280px; active link is not color-only. |
| Focus | Keyboard focus / focus-visible | Skip link, visible outline, logical order, no traps. | Main content and native controls are reachable in order. |
| Footer | Static | Reassures the user that the list is ranked and no account is required. | No reset or destructive action is present. |

## Cards — landing flashcard deck

| State | Behavior | Acceptance |
| --- | --- | --- |
| Server-safe loading | Shows a small shuffling state before client-only randomization. | No hydration mismatch; no empty layout jump that hides the primary task. |
| Front | Shows one German form, rank, and reveal action. | The meaning and examples are not visible before reveal. |
| Revealed back | Shows gloss, explanation, usage note when present, and all three examples. | Focus moves to the revealed region; German text has `lang="de"`. |
| Show front | Hides the answer without changing the deck position. | The same word remains active and can be recalled again. |
| Next random card | Advances one position in the in-memory Fisher–Yates order and hides the next answer. | No record repeats before all 1,000 records have appeared. |
| Round complete | Appears after the user advances past card 1,000. | No undefined card or silent wrap; one clear “Shuffle all 1,000 again” action. |
| Reload | Recreates a new order from the complete static record set. | No local storage, cookie, database, or saved progress read/write. |

## Explore — one-page index

| State | Behavior | Acceptance |
| --- | --- | --- |
| Baseline | Renders all 1,000 records as one continuous single-column list. | 1,000 stable `#word-001` … `#word-1000` anchors; no pagination UI. |
| Search | Filters the existing list by searchable record text. | Result count updates in a live region; input stays usable at 280px. |
| Word type | Filters by the actual `WordKind` values in the dataset. | No invalid article/conjunction/pronoun values are offered. |
| Clear | Returns to the full index. | All 1,000 records are available again; no progress filter remains. |
| Card details | Native `details` reveals three examples. | Keyboard open/close works and examples remain in the document. |
| Long page | Browser scrolls the complete list; cards use content visibility for rendering help. | No horizontal overflow, clipped copy, or hidden actions. |
| No results | Dedicated empty state with one reset action. | No blank grid or dead end. |

## Exercises — randomized meaning bank

| State | Behavior | Acceptance |
| --- | --- | --- |
| Loading | Builds one randomized bank containing every record. | Loading is client-only and does not render a fake question. |
| Question | German word prompt and four native radio choices. | Exactly one correct choice; choices have unique labels and values. |
| Unselected | Check action is disabled until one radio is selected. | Native fieldset/legend semantics and visible focus remain intact. |
| Submitted correct | Locks choices and announces “Correct.” with the correct answer and examples. | Status is announced once; answer does not write to storage. |
| Submitted wrong | Locks choices and announces “Not quite.” with the correct answer and examples. | Wrong/correct state is not communicated by color alone. |
| Next question | Advances exactly one position and clears the previous selection. | Counter advances from `1 of 1,000` to `2 of 1,000` without wrapping. |
| Final question | Finish action moves to explicit completion. | No blank question or silent return to question one. |
| Shuffle again / reload | Builds a new 1,000-question order and resets score to zero. | Score and answer history are session-only. |

## Responsive matrix

| Width | Cards | Explore | Exercises |
| ---: | --- | --- | --- |
| 280 | Word and actions wrap cleanly. | Search stacks; one-column list has no horizontal overflow. | Choices, feedback, and next action remain full-width. |
| 375 | Hero and card retain generous spacing without clipping. | Rank, form, gloss, and disclosure remain readable. | Prompt and four choices keep a clear reading order. |
| 768 | Hero note and card controls can share space. | Long index remains one column with comfortable measure. | Question card has balanced prompt and answer measure. |
| 1440 | Spacious editorial hero and card. | Full page is still a readable index, not a dense grid. | Focused centered exercise with visible temporary count. |
