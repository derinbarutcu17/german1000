import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/words.ts", import.meta.url), "utf8");
const ranks = [...source.matchAll(/\{ rank: (\d+), word: /g)].map((match) => Number(match[1]));
const words = [...source.matchAll(/\{ rank: \d+, word: "([^"]+)"/g)].map((match) => match[1]);

assert.equal(ranks.length, 1000, "the source list must contain exactly 1,000 rows");
assert.equal(new Set(ranks).size, 1000, "source ranks must be unique");
assert.deepEqual(ranks, Array.from({ length: 1000 }, (_, index) => index + 1), "source ranks must be contiguous");
assert.equal(words.length, 1000, "every source row must expose a word");
assert.ok(words.every((word) => word.trim().length > 0), "source words must not be empty");

console.log("Content validation passed: 1,000 contiguous ranked forms.");
