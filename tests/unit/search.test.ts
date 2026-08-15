import assert from "node:assert/strict";
import test from "node:test";
import { records } from "../../app/data/records";
import { buildExploreParams, filterRecords, normalizeExploreQuery, paginateRecords } from "../../app/lib/search";

test("normalizes shareable Explore state and drops invalid values", () => {
  const query = normalizeExploreQuery(new URLSearchParams("q=%C3%BCber&type=not-a-type&page=-4&size=999"));
  assert.deepEqual(query, { q: "über", status: "all", type: "all", page: 1, size: 12 });
  assert.equal(buildExploreParams(query).toString(), "q=%C3%BCber");
});

test("intersects search and word-type filters", () => {
  const query = normalizeExploreQuery(new URLSearchParams("q=schon&type=adverb"));
  const matches = filterRecords(records, query);
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.word, "schon");
});

test("paginates with a hard result bound", () => {
  const query = paginateRecords(records, 999, 48);
  assert.equal(query.pageCount, 21);
  assert.equal(query.page, 21);
  assert.equal(query.items.length, 40);
  assert.ok(query.items.length <= 48);
});
