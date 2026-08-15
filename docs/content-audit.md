# German 1000 — vocabulary and editorial-risk audit

This document records the content findings that led to the sentence-content overhaul. The original frequency list is still a 1,000-form surface inventory, not a dictionary or sentence corpus. The current release keeps that inventory static and adds a separate bilingual sentence layer so every displayed form is used in three distinct sentences.

## Current editorial status

The release now has a structural content gate: 1,000 records, 3,000 bilingual examples, exact surface-form usage, distinct German sentences, source metadata, and no known placeholder copy. 2,876 examples are linked to static Tatoeba German–English sentence data; 124 are local context templates for ambiguous or poorly covered forms. Frequency rank still does not validate a gloss, part of speech, register, or pedagogical order, so those remain editorial follow-up work.

## Representative pre-fix findings

The following rows were the visible failure cases before the new sentence layer. They remain useful regression fixtures, not current examples.

| Rank | Form | Former gloss | Former risk | Current treatment |
| ---: | --- | --- | --- | --- |
| 77 | `schon` | `beautiful` | The form was shown with generic meta-copy instead of a sentence. | Corrected gloss and three context sentences. |
| 103 | `meine` | `think` | The form was confused with `meinen` and had no real usage context. | Context sentences now show possessive and verb senses. |
| 137 | `gibt` | `are` | The form was generated as invalid infinitive copy. | Corrected construction note and `es gibt` examples. |
| 161 | `soll` | `target` | The modal form was treated as a noun-like item. | Corrected modal examples and sense note. |
| 994 | `gewissen` | `conscience` | The inflected adjective was misclassified and generated as a verb. | Corrected adjective kind, explanation, and sentence usage. |

These are review flags, not final linguistic judgments. A German editor should confirm the intended corpus context before changing them.

## Structural risks

### 1. Single-gloss records flatten polysemy

The UI presents one primary English gloss for each item. That is acceptable only when the sense is stable and the context supports it. Function words, modal verbs, inflected forms, and common polysemous words need either a short usage note or a sentence that disambiguates them.

### 2. Frequency data cannot manufacture context

The source list tells us which surface forms are frequent. It cannot supply a sentence, translation, sense, or part of speech. Those fields now live in `app/data/example-content.ts` and `app/data/tatoeba-examples.json`, rather than being silently invented by the page component.

### 3. Source coverage and local exceptions are explicit

Most examples retain a Tatoeba sentence reference. A small local set covers forms that need a controlled construction or were not usable in the export. Both paths are represented by `sourceKind`, and the validator makes missing or placeholder content fail the release check.

### 4. Exercises inherit the same content layer

Meaning exercises draw from the same record bank. If a gloss is wrong or underspecified, an exercise can still be pedagogically weak even when its sentences are valid. Gloss, part-of-speech, and sense review remain the next editorial layer.

## Recommended record schema

```ts
type VocabularyRecord = {
  rank: number;
  surface: string;
  lemma: string;
  partOfSpeech: string;
  gender?: "masculine" | "feminine" | "neuter" | "plural";
  primarySense: string;
  alternateSenses?: string[];
  usageNote?: string;
  exampleDe: string;
  exampleEn: string;
  source?: string;
  sourceContext?: string;
  reviewStatus: "unreviewed" | "editor-reviewed" | "native-reviewed";
  reviewedBy?: string;
  reviewedAt?: string;
};
```

The current UI does not need to show every field. It does need the source model so editorial tooling can distinguish a verified item from a scaffolded item.

## QA workflow

1. Keep `app/words.ts` as the raw 1,000-form inventory.
2. Keep sentence content in the static editorial/source layer, not in page components.
3. Validate duplicate ranks, missing glosses, missing bilingual examples, exact surface-form usage, distinct sentences, source references, and placeholder rejection.
4. Review the highest-frequency 200 records first because they carry the most learning impact.
5. Review all records used as exercise answers and distractors.
6. Verify each sentence for grammar, naturalness, translation, register, and intended sense.
7. Add reviewer status and dates when a human linguistic pass is completed.
8. Keep local context templates explicit; do not silently replace missing content with generic meta-copy.

## Content-language requirements

- German words and sentences should carry `lang="de"` so assistive technology and speech tools choose appropriate pronunciation.
- English glosses should be concise but not falsely precise.
- Context notes should explain constructions such as “there is/are,” modal verbs, separable verbs, and inflected forms.
- Examples should not rely on color or italics alone to indicate the target word.
- If a word has multiple common senses, the exercise should state which sense is being tested.

## Release gate for data

The static release gate currently requires all 1,000 records to have three distinct bilingual sentences containing the exact form, with no known placeholder language. The site should not add new generated fallback copy without extending the validator and reviewing the resulting content layer.

## Sentence source

The sourced examples are derived from Tatoeba's German–English sentence and link exports. Each sourced example retains a sentence reference in `app/data/tatoeba-examples.json`; repository-level attribution and the local-template boundary are documented in [`docs/content-sources.md`](content-sources.md).
