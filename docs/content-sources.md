# German 1000 — sentence sources

The frequency inventory is kept in [`app/words.ts`](../app/words.ts). It contains surface forms from the Google Books Ngram Corpus and does not contain sentence context.

The deployed examples are compiled from the reviewed sentence bank in [`GERMAN-1000-EXAMPLES.txt`](../GERMAN-1000-EXAMPLES.txt) into [`app/data/corrected-examples.ts`](../app/data/corrected-examples.ts). Each entry contains three German sentences in explicit A2, B2, and C1 order, plus a matching English support translation for the web interface. The German sentence bank is the editorial source of truth; the compiled module is the runtime data source.

The older Tatoeba export in [`app/data/tatoeba-examples.json`](../app/data/tatoeba-examples.json) and generator utilities in [`app/data/example-content.ts`](../app/data/example-content.ts) remain in the repository as source material and fallback infrastructure. Corrected records are marked `context-template` in the runtime model and are covered by the exact-form, translation, and placeholder checks.

This content layer is static at build time. The deployed site does not call Tatoeba or any external service at runtime.
