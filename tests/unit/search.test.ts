import assert from "node:assert/strict";
import test from "node:test";
import { records } from "../../app/data/records";
import { buildExploreParams, filterRecords, normalizeExploreQuery } from "../../app/lib/search";

test("normalizes shareable Explore state and drops invalid values", () => {
  const query = normalizeExploreQuery(new URLSearchParams("q=%C3%BCber&type=not-a-type&page=-4&size=999"));
  assert.deepEqual(query, { q: "über", type: "all" });
  assert.equal(buildExploreParams(query).toString(), "q=%C3%BCber");
});

test("intersects search and word-type filters", () => {
  const query = normalizeExploreQuery(new URLSearchParams("q=schon&type=adverb"));
  const matches = filterRecords(records, query);
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.word, "schon");
});

test("keeps the complete index available without pagination", () => {
  const query = normalizeExploreQuery(new URLSearchParams());
  assert.equal(filterRecords(records, query).length, 1000);
});
