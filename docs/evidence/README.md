# Evidence gallery

These are viewport screenshots captured during the 2026-08-15 local browser audit. They are intentionally kept in the repository so each finding can be reviewed against the state that produced it.

## Practice and persistence

![Returning-user hydration error](screenshots/03-returning-hydration-error.png)

Returning progress triggers a React hydration error in the development session.

![Practice skips rank 002](screenshots/14-practice-skips-rank-002.png)

Completing rank `#001` advances to `#003` and leaves conflicting progress indicators.

## Explore

![Explore baseline](screenshots/05-explore-viewport.png)

![Explore search](screenshots/06-explore-search.png)

![Explore all results](screenshots/07-explore-all-1000.png)

The baseline and search flows are usable; the all-results state is visually long and mounts an unbounded result DOM.

## Exercises and method

![Meaning exercise](screenshots/08-exercise-meaning.png)

![Sentence context exercise](screenshots/09-exercise-context-correct.png)

![Method sources](screenshots/10-method-sources.png)

## Responsive states

![Home at 375px](screenshots/11-home-mobile-375.png)

![Explore at 375px](screenshots/12-explore-mobile-375.png)

![Explore at 280px](screenshots/13-explore-mobile-280-overflow.png)

The 375px layouts are coherent; the 280px Explore state clips content and overflows horizontally.
