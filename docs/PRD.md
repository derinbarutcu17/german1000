# German1000 — Redesign PRD (v1 draft)

**Status:** Draft for review
**Date:** 2026-08-26
**Owner:** Derin (product + design) with Hermes (implementation support)
**Scope of change:** Mobile-focused redesign of all visible surfaces. No contract change.

---

## 1. Summary

German1000 is a stateless, frequency-first German vocabulary instrument: 1,000 most
frequent word forms, one shuffled deck, one searchable index, one exercise round.
The product works and is shipped via GitHub Pages. The redesign exists to make the
mobile experience feel as deliberate as the idea: tuned typography, comfortable
touch, quiet motion that guides rather than decorates, and one coherent visual voice
across all three surfaces.

The product contract stays untouched. No accounts, no saved progress, no database
writes, no scheduling.

## 2. Problem statement

- The current interface was validated and hardened primarily at desktop widths.
  On a phone it works but does not feel designed: reading rhythm, touch targets,
  and the reveal interaction are not tuned for a one-handed session.
- Motion is nearly absent. The learning loop (reveal, answer, advance) is the
  product's core beat and currently has no animation language of its own.
- Visual decisions are tokenized in DESIGN.md, but the surfaces do not yet all
  follow one mobile-first reading order.

## 3. Goals

1. Make all three surfaces (Cards, Explore, Exercises) feel native on a phone:
   comfortable type scale, 44px+ touch targets, safe-area handling, no horizontal
   overflow down to 320px.
2. Give the core loop a coherent motion language using supplied animation code,
   guided by the 12 animation principles: purpose, <300ms interactions, easing
   roles, staging, reduced-motion support.
3. Preserve the current visual voice (quiet editorial instrument: paper, ink,
   restrained blue, blackletter wordmark) while evolving it where mobile needs
   a different treatment.
4. Keep statelessness intact and all existing tests green.
5. Add privacy-conscious visitor and usage analytics, ready to wire into a
   Vercel deployment (planned as a separate milestone after the redesign).

## 4. Non-goals

- Accounts, sign-in, profiles, multi-device sync.
- Saved progress, streaks, persisted scores, spaced repetition, daily queue.
- The former Method route, Today scheduler, learner-status filters, pagination.
- Content changes to the 1,000 records or example sentences.
- Backend/worker changes. If the deployment worker or DB files are unused by
  the static surfaces, they are out of scope.
- Desktop redesign. Desktop must not regress, but the design effort targets
  mobile first; desktop follows only where shared chrome requires it.

## 5. Audience and usage context

- Self-directed German learners, English UI, casual daily use.
- Primary context (assumed, to confirm): phone, short sessions, often one-handed,
  often in motion (commute). Session length is minutes, not an hour.
- No onboarding, no tutorial: the product must be self-explanatory at first open.

## 6. Product invariants (must not regress)

- One round uses every one of 1,000 records exactly once, then offers a fresh shuffle.
- Reload is a clean start. No cookies, no local storage, no server writes.
- The German word is shown before its explanation (recall first, verify second).
- Explore is one continuous, searchable, type-filterable document; examples live
  behind native disclosures.
- Exercises are one randomized multiple-choice round of 1,000 questions with four
  unique choices; nothing is recorded.
- Real links for the three destinations, current location in the URL.
- The end of a deck says exactly what happened and offers one shuffle action.

## 7. Scope by surface

### 7.1 Shared shell (header, footer, layout)

- Since this is a mobile redesign: header must compact gracefully at 375px and
  below. **Decision:** the top nav links are replaced on mobile by a fixed
  bottom pill (liquid glass circle that grows into the pill: Cards / Explore /
  Exercises). Desktop keeps the existing top nav unchanged. The mobile header
  shrinks to the brand mark only.
- Footer keeps attribution (Built by Derin) and stays unobtrusive.

### 7.2 Cards (`/`)

- The hero/landing copy block: **Decision:** kept, but shrunk on mobile. Both
  the header and the landing text tighten at small widths, and the hero
  carries the entrance animation.
- The reveal interaction is the emotional core: flip/reveal motion must feel
  deliberate, not decorative.
- Thumb-reach: primary action (Reveal / Next) should live in the bottom half
  of the screen on mobile.
- Position display: **Decision:** keep the current framing
  (Card 001 / 1,000) on mobile with tabular numerals; it must never shift
  layout while updating.
- Completion state: clear message + one shuffle action, motion-light.

### 7.3 Explore (`/explore`)

- Search + type filter remain the only controls; keep them stateless and
  shareable via URL.
- 1,000-row continuous scroll must stay smooth on a phone; no virtualization
  unless profiling proves it is needed.
- Row tap targets and typography tuned for thumb scrolling.

### 7.4 Exercises (`/exercises`)

- Question, choices, action, feedback must fit one compact reading group on
  a phone (per DESIGN.md).
- Choice rows: 44px+ touch targets, clear pressed feedback, instant (<=150ms)
  state change.
- Score display tabular, non-competitive with the question.
- Correct/wrong feedback: motion exists but with a static cue (color + label).

## 8. Motion and interaction requirements

- Rules (from animation-principles, apply to every animation):
  - Purpose: communicates state, guides attention, or gives feedback. Nothing
    decorative.
  - Durations: interactions under 300ms; feedback around 150ms.
  - Easing: entrances ease-in, exits ease-out; springs settle with zero wobble.
  - One focal motion per moment; stagger groups by ~100ms where entering as a set.
  - Respect prefers-reduced-motion: skip or shorten decorative motion; keep
    essential state changes legible without motion.
  - Settled frame must equal the static design exactly (no settled-frame drift).
- Supplied animation code from Derin gets integrated here; anything that
  conflicts with the rules above is flagged for decision, not silently accepted.

## 9. Visual direction

- Usable mobile-first evolution of the existing DESIGN.md voice, not a rebrand:
  paper background, ink text, restrained blue accent, green only for correct
  feedback, blackletter wordmark only as brand mark.
- DESIGN.md is the source of truth and will be updated as decisions land.
- Mobile-specific tweaks allowed by directive: larger relative type, tighter
  spacing at small widths, thumb-zone placement of actions, safe-area insets.

## 10. Quality floor

- At least 44x44px touch targets; 16px input text on mobile (no iOS zoom).
- 320px width and 200% zoom: no horizontal scroll, no clipped content.
- Visible :focus-visible ring on every interactive element.
- 4.5:1 body text contrast, 3:1 large/secondary text.
- Semantic HTML, real buttons/links, aria-live for the reveal and exercise
  feedback, accessible names for icon-only controls.
- prefers-reduced-motion honored everywhere.
- No layout shift on reveal, advance, or score changes (tabular numerals).

## 11. Performance constraints

- Static pages, no client-side fetching for the core surfaces unless already
  present.
- Explore with all 1,000 rows visible must stay responsive; render only what
  is needed if profiling shows jank.
- Keep bundle lean: reuse the project's fonts (Geist, Geist Mono, brand face)
  and components; no new heavy animation library unless Derin's animation code
  requires one (decision documented).

## 12. Analytics and usage tracking (planned, wired later)

Goal: see how many people visit and how they use the core loop, without
breaking the stateless contract or requiring consent banners.

Requirements:

- **Visitor metrics:** pageviews per route, unique visitors, device class
  (mobile/tablet/desktop), coarse location (country only), referrer breakdown.
- **Usage events:** card revealed, card advanced, exercise answer (correct /
  wrong), exercise round completed, deck completed. Event names must be
  stable and documented; no per-user identity, no saved state.
- **Privacy:** cookieless and EU-safe (no consent banner needed). No PII, no
  fingerprinting, no cross-site tracking. Aggregate counts only. Every
  tracking decision must keep the product stateless.
- **Implied default:** Vercel Web Analytics (+ Speed Insights) since the
  deployment target is Vercel; custom events via `track()` on client-side
  actions. Self-hosted alternative (Umami/Plausible) if Derin prefers
  keeping the data off Vercel. Vendor decision goes in open questions.
- **No analytics on the build path:** tracking must not affect the static
  contract, must respect reduced-motion/performance budgets, and must never
  gate the UI.

## 13. Success criteria

There is no telemetry in this product, so success is judged qualitatively:

- On a phone, the reveal and exercise loops are one-thumb comfortable and the
  motion reads as intentional at 10% speed replay.
- All three surfaces pass the quality floor checks at 320/375/390px and desktop
  does not regress.
- Visual decisions all trace back to DESIGN.md; no orphan tokens or colors.
- Full validation suite passes: typecheck, lint, unit, content, build,
  rendered-html.

## 14. Out of scope (explicit)

- Method route, Today scheduler, filters, pagination, persistence (per README).
- New learning features (audio, SRS, stats) unless Derin adds them here.
- GitHub Pages workflow changes and release mechanics.
- Vercel deployment and analytics wiring: planned, set up as a separate
  milestone after the redesign ships. The PRD only fixes the requirements
  the design must not break.
- Content/data edits.

## 15. Risks

- Statelessness limits retargeting: can't customize for returning users. Chosen
  product truth; do not add state to solve it.
- Motion can make a learning tool feel gimmicky quickly. The rules in section 8
  are the guardrail; anything that breaks them needs explicit sign-off.
- Mobile-first may require restructuring the landing hero; needs a decision
  before implementation.

## 16. Decisions and open questions

Resolved:

1. **Mobile nav:** top nav links are replaced on mobile by a fixed bottom
   liquid-glass pill (circle that grows into Cards / Explore / Exercises);
   desktop keeps the existing top nav. No bottom tab bar.
2. **Landing hero:** kept, but the header and landing text shrink on mobile;
   the hero carries the animation.
3. **Cards framing:** Card 001 / 1,000 stays on mobile (tabular numerals).

Still open:

4. Visual voice: evolve in place (paper/ink/blue stays), or does the redesign
  shift the palette/typography more broadly? References will answer this.
5. Any animation code incoming that changes the motion rules above (new
  library, longer arcs)? Flag at intake.
6. Analytics vendor: Vercel Web Analytics (default, cookieless) or self-hosted
  Umami/Plausible? And confirm the usage event list (reveal, advance, answer
  correct/wrong, round completions) matches what you want to see.

---

*Next step after sign-off: design brief + reference teardown, then visual
exploration, then implementation in the repo with browser verification at
375px and desktop.*
