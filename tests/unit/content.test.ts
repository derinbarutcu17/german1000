import assert from "node:assert/strict";
import test from "node:test";
import { buildExerciseBank } from "../../app/lib/exercises";
import { records } from "../../app/data/records";

test("surfaces a complete, contiguous vocabulary index", () => {
  assert.equal(records.length, 1000);
  assert.deepEqual(records.map((record) => record.rank), Array.from({ length: 1000 }, (_, index) => index + 1));
  assert.equal(new Set(records.map((record) => record.rank)).size, 1000);
  assert.ok(records.every((record) => record.word.trim() && record.gloss.trim() && record.examples.length === 3));
});

test("gives every surface form distinct bilingual sentence examples", () => {
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const record of records) {
    const exactWord = new RegExp(`(?:^|[^\\p{L}\\p{M}\\p{N}])${escapeRegExp(record.word)}(?=$|[^\\p{L}\\p{M}\\p{N}])`, "iu");
    assert.equal(new Set(record.examples.map((example) => example.de)).size, 3, record.word);
    for (const example of record.examples) {
      assert.ok(example.de.trim() && example.en.trim(), record.word);
      assert.match(example.de, exactWord, record.word);
      assert.ok(!/(?:häufiges Wort|hörst oder liest|Prüfe die Funktion|Achte auf den Kontext)/iu.test(example.de + " " + example.en), record.word);
      assert.match(example.sourceKind, /^(?:tatoeba|context-template)$/u, record.word);
    }
  }
});

test("does not surface quoted-word fallback examples", () => {
  const quotedWordTemplate = /\b(?:das Wort|the word)\s+["“][^"”]+["”]/iu;
  for (const record of records) {
    for (const example of record.examples) {
      assert.doesNotMatch(`${example.de} ${example.en}`, quotedWordTemplate, record.word);
    }
  }
});

test("keeps known source gloss hazards corrected in the surfaced records", () => {
  const byWord = new Map(records.map((record) => [record.word, record]));
  assert.match(byWord.get("schon")?.gloss ?? "", /already|soon/);
  assert.match(byWord.get("meine")?.gloss ?? "", /my|mean/);
  assert.match(byWord.get("gibt")?.gloss ?? "", /gives|there is/);
  assert.match(byWord.get("soll")?.gloss ?? "", /should|supposed/);
  assert.match(byWord.get("gewissen")?.gloss ?? "", /certain/);
});

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

test("builds a randomized question bank covering every record", () => {
  const bank = buildExerciseBank(records, records.length, seededRandom(1));
  assert.equal(bank.length, 1000);
  assert.deepEqual(new Set(bank.map((item) => item.record.rank)), new Set(records.map((record) => record.rank)));

  for (const item of bank) {
    assert.equal(item.options.filter((option) => option.correct).length, 1);
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options.map((option) => option.value)).size, 4);
    assert.equal(new Set(item.options.map((option) => option.label)).size, 4);
  }

  const secondBank = buildExerciseBank(records, records.length, seededRandom(2));
  assert.notDeepEqual(
    bank.slice(0, 25).map((item) => item.record.rank),
    secondBank.slice(0, 25).map((item) => item.record.rank),
  );
});
