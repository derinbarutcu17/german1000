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

test("keeps known source gloss hazards corrected in the surfaced records", () => {
  const byWord = new Map(records.map((record) => [record.word, record]));
  assert.match(byWord.get("schon")?.gloss ?? "", /already|soon/);
  assert.match(byWord.get("meine")?.gloss ?? "", /my|mean/);
  assert.match(byWord.get("gibt")?.gloss ?? "", /gives|there is/);
  assert.match(byWord.get("soll")?.gloss ?? "", /should|supposed/);
  assert.match(byWord.get("gewissen")?.gloss ?? "", /certain/);
});

for (const mode of ["meaning", "word", "article"] as const) {
  test("builds a deterministic " + mode + " exercise bank", () => {
    const bank = buildExerciseBank(records, mode, 12);
    assert.equal(bank.length, 12);
    for (const item of bank) {
      const correct = item.options.filter((option) => option.correct);
      assert.equal(correct.length, 1);
      assert.equal(new Set(item.options.map((option) => option.value)).size, item.options.length);
      assert.ok(item.options.length === (mode === "article" ? 3 : 4));
    }
  });
}
