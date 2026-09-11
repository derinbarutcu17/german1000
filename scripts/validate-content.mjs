import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { records } from "../app/data/records.ts";

const source = await readFile(new URL("../app/words.ts", import.meta.url), "utf8");
const ranks = [...source.matchAll(/\{ rank: (\d+), word: /g)].map((match) => Number(match[1]));
const words = [...source.matchAll(/\{ rank: \d+, word: "([^"]+)"/g)].map((match) => match[1]);
const bankSource = await readFile(new URL("../GERMAN-1000-EXAMPLES.txt", import.meta.url), "utf8");
const bankLines = bankSource.split(/\r?\n/u).filter((line) => line.length && !line.startsWith("#"));
const correctedBank = [];
for (let i = 0; i < bankLines.length; i += 4) {
  const [, a2, b2, c1] = bankLines.slice(i, i + 4);
  correctedBank.push({ A2: a2.slice(4), B2: b2.slice(4), C1: c1.slice(4) });
}

assert.equal(ranks.length, 1000, "the source list must contain exactly 1,000 rows");
assert.equal(new Set(ranks).size, 1000, "source ranks must be unique");
assert.deepEqual(ranks, Array.from({ length: 1000 }, (_, index) => index + 1), "source ranks must be contiguous");
assert.equal(words.length, 1000, "every source row must expose a word");
assert.ok(words.every((word) => word.trim().length > 0), "source words must not be empty");
assert.equal(correctedBank.length, 1000, "the corrected TXT bank must contain 1,000 entries");

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
  const bankRecord = correctedBank[record.rank - 1];
  for (const level of ["A2", "B2", "C1"]) {
    const example = record.examples.find((item) => item.level === level);
    assert.equal(example?.de, bankRecord[level], `${record.word} ${level} must match the corrected TXT bank`);
  }
}

console.log(`Content validation passed: 1,000 contiguous forms and ${records.length * 3} sentence examples (${JSON.stringify(sourceCounts)}).`);
