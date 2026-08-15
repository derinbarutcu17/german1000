import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { records } from "../app/data/records.ts";

const source = await readFile(new URL("../app/words.ts", import.meta.url), "utf8");
const ranks = [...source.matchAll(/\{ rank: (\d+), word: /g)].map((match) => Number(match[1]));
const words = [...source.matchAll(/\{ rank: \d+, word: "([^"]+)"/g)].map((match) => match[1]);

assert.equal(ranks.length, 1000, "the source list must contain exactly 1,000 rows");
assert.equal(new Set(ranks).size, 1000, "source ranks must be unique");
assert.deepEqual(ranks, Array.from({ length: 1000 }, (_, index) => index + 1), "source ranks must be contiguous");
assert.equal(words.length, 1000, "every source row must expose a word");
assert.ok(words.every((word) => word.trim().length > 0), "source words must not be empty");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExactWord(sentence, word) {
  return new RegExp(`(?:^|[^\\p{L}\\p{M}\\p{N}])${escapeRegExp(word)}(?=$|[^\\p{L}\\p{M}\\p{N}])`, "iu").test(sentence);
}

const placeholderPattern = /(?:häufiges Wort|hörst oder liest|Prüfe die Funktion|Achte auf den Kontext)/iu;
const sourceCounts = {};
for (const record of records) {
  assert.equal(record.examples.length, 3, `${record.word} must have three examples`);
  assert.equal(new Set(record.examples.map((example) => example.de)).size, 3, `${record.word} must have distinct German examples`);
  for (const example of record.examples) {
    assert.ok(example.de.trim() && example.en.trim(), `${record.word} must have non-empty bilingual examples`);
    assert.ok(hasExactWord(example.de, record.word), `${record.word} must appear as an exact form in every example`);
    assert.ok(!placeholderPattern.test(example.de + " " + example.en), `${record.word} must not use placeholder example copy`);
    assert.match(example.sourceKind, /^(?:tatoeba|context-template)$/u);
    if (example.sourceKind === "tatoeba") {
      assert.match(example.sourceRef ?? "", /tatoeba\.org\/en\/sentences\/show\/\d+/u, `${record.word} Tatoeba examples need a sentence reference`);
    }
    sourceCounts[example.sourceKind] = (sourceCounts[example.sourceKind] ?? 0) + 1;
  }
}

console.log(`Content validation passed: 1,000 contiguous forms and ${records.length * 3} sentence examples (${JSON.stringify(sourceCounts)}).`);
