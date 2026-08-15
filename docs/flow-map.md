# German 1000 — information architecture and flow map

## Current model

The current product is one client-rendered route with four stateful views. The shared hero, stats, and footer stay in the page while the active content changes.

```mermaid
flowchart TD
  Root["/ — client-rendered shell"] --> Hero["Hero + stats"]
  Hero --> Practice["Practice tab"]
  Hero --> Explore["Explore tab"]
  Hero --> Exercises["Exercises tab"]
  Hero --> Method["Method tab"]
  Practice --> Reveal["Reveal meaning"]
  Reveal --> Again["Again"]
  Reveal --> Know["I know it"]
  Again --> Practice
  Know --> Practice
  Explore --> Search["Search + rank/type filters"]
  Search --> Page["Paginated results"]
  Search --> All["Show all 1,000"]
  Page --> Details["Expand examples"]
  All --> Details
  Exercises --> Meaning["Meaning mode"]
  Exercises --> Context["Sentence context mode"]
  Meaning --> Answer["Answer → feedback → next"]
  Context --> Answer
  Method --> Sources["Six sources + caveat"]
  Footer["Footer reset"] --> Reset["Clear local progress"]
```

## Recommended model

The visual language can remain a shared shell, but the tools should become addressable destinations with explicit state.

```mermaid
flowchart TD
  Shell["Shared shell"] --> Today["/ — Today"]
  Shell --> Explore2["/explore"]
  Shell --> Exercises2["/exercises"]
  Shell --> Method2["/method"]
  Today --> Session["Stable practice session"]
  Session --> Review["Review outcome"]
  Review --> Scheduler["Persist due date + learner state"]
  Explore2 --> Query["URL: q, rank, type, page"]
  Query --> Results["Bounded result list"]
  Exercises2 --> Mode["URL or local mode"]
  Mode --> ExerciseState["Accessible answer state"]
  ExerciseState --> Scheduler
  Method2 --> Contract["Explains the actual method"]
```

## Navigation principles

- Use real links for primary destinations.
- Keep the current view in the URL.
- Keep search, filters, and page in the URL if sharing and refresh matter.
- When a view changes, focus a meaningful heading or landmark.
- Keep the Practice landing surface spacious, but give secondary tools a route-level header so the task starts sooner.
