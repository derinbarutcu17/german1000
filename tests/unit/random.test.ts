import assert from "node:assert/strict";
import test from "node:test";
import { shuffle } from "../../app/lib/random";

test("shuffles a copy without losing or mutating records", () => {
  const source = [1, 2, 3, 4, 5];
  const result = shuffle(source, () => 0.25);

  assert.deepEqual(source, [1, 2, 3, 4, 5]);
  assert.notStrictEqual(result, source);
  assert.deepEqual([...result].sort((left, right) => left - right), source);
  assert.notDeepEqual(result, source);
});
