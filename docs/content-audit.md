# German 1000 — vocabulary and editorial-risk audit

This is a representative content audit based on static inspection of the 1,000-record source and the rendered learning surfaces. It is not a claim that every record is incorrect. The point is that the current data model and generation strategy make errors easy to publish and hard for a learner to detect.

## Editorial verdict

The dataset should be treated as **unreviewed learning content** until every visible sense and example has a source or reviewer. Frequency rank is useful for organizing a list, but it does not validate translation, part of speech, inflection, register, example quality, or pedagogical order.

## Representative high-risk records

| Rank | Form | Current gloss | Risk | Editorial action |
| ---: | --- | --- | --- | --- |
| 77 | `schon` | `beautiful` | Common form is usually “already”; the current gloss is likely a sense/form error without context. | Verify source sense and add a context-rich example. |
| 103 | `meine` | `think` | Could be confused with `meinen`; inflection and lemma need to be explicit. | Add lemma, part of speech, and correct inflection note. |
| 137 | `gibt` | `are` | Form is context-dependent and commonly appears in “there is/are” constructions; a single gloss is misleading. | Use a construction note and an example that carries the sense. |
| 161 | `soll` | `target` | Likely confusion between a modal form and a noun sense. | Verify lemma and sense; do not publish without grammatical metadata. |
| 994 | `gewissen` | `conscience` | Highly context-dependent inflection/adjective/noun relationship. | Add source context and distinguish the intended lemma/sense. |

These are review flags, not final linguistic judgments. A German editor should confirm the intended corpus context before changing them.

## Structural risks

### 1. Single-gloss records flatten polysemy

The UI presents one primary English gloss for each item. That is acceptable only when the sense is stable and the context supports it. Function words, modal verbs, inflected forms, and common polysemous words need either a short usage note or a sentence that disambiguates them.

### 2. Generated explanations can manufacture confidence

`app/page.tsx` contains `defaultExamples` and `makeRecord`, which provide generic explanations/examples for many records. Templates are useful for scaffolding, but a generated sentence that merely contains a word is not evidence that the sentence is grammatical, idiomatic, or the right sense.

### 3. Only a small notes map carries human context

The hand-authored notes map is much smaller than the full dataset. That creates a dangerous visual equivalence: reviewed records and generated records look like the same quality tier.

### 4. Exercises inherit the same content risk

Meaning and sentence-context exercises draw from the record bank. If a gloss is wrong or underspecified, an exercise can mark a learner wrong for choosing the natural translation. Exercise quality cannot be separated from data QA.

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

1. Import the 1,000 records into a review table.
2. Check duplicate ranks, duplicate surface forms, missing glosses, missing examples, and impossible metadata.
3. Flag likely form/lemma conflicts (`meine`/`meinen`, modal forms, article/pronoun forms, adjective endings).
4. Review the highest-frequency 200 records first because they carry the most learning impact.
5. Review all records used as exercise answers and distractors.
6. Verify each sentence for grammar, naturalness, translation, and intended sense.
7. Mark each record with reviewer and date.
8. Keep generated text as an explicit scaffold state, never as an indistinguishable final state.

## Content-language requirements

- German words and sentences should carry `lang="de"` so assistive technology and speech tools choose appropriate pronunciation.
- English glosses should be concise but not falsely precise.
- Context notes should explain constructions such as “there is/are,” modal verbs, separable verbs, and inflected forms.
- Examples should not rely on color or italics alone to indicate the target word.
- If a word has multiple common senses, the exercise should state which sense is being tested.

## Release gate for data

The site can ship a “reference preview” before all 1,000 records are edited only if the UI clearly labels the data as an in-progress source and does not frame generated explanations as verified lessons. A learning release should require the editorial fields and review status above.
