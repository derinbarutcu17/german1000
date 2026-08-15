# German 1000 — sentence sources

The frequency inventory is kept in [`app/words.ts`](../app/words.ts). It contains surface forms from the Google Books Ngram Corpus and does not contain sentence context.

The bilingual examples in [`app/data/tatoeba-examples.json`](../app/data/tatoeba-examples.json) come from the Tatoeba German–English sentence and link exports. Each sourced example keeps a sentence URL in `sourceRef`, so the originating sentence can be inspected. Tatoeba's contributors and licensing information remain attached to the source sentence; the app does not alter those sentences.

The remaining examples are short local context templates in [`app/data/example-content.ts`](../app/data/example-content.ts). They are used only for forms that need a controlled construction or did not have enough usable bilingual source sentences. They are marked `context-template` in the record model and are covered by the same exact-form and placeholder checks.

This content layer is static at build time. The deployed site does not call Tatoeba or any external service at runtime.
