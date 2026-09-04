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
  assert.ok(matches.length > 0);
  assert.ok(matches.some((record) => record.word === "schon"));
  assert.ok(matches.every((record) => record.kind === "adverb"));
});

test("searches sentence context and ignores accents", () => {
  const sentenceMatches = filterRecords(records, normalizeExploreQuery(new URLSearchParams("q=application")));
  assert.ok(sentenceMatches.some((record) => record.word === "innerhalb"));

  const accentMatches = filterRecords(records, normalizeExploreQuery(new URLSearchParams("q=uber")));
  assert.ok(accentMatches.some((record) => record.word === "über"));
});

test("ranks exact word matches ahead of sentence-context matches", () => {
  const matches = filterRecords(records, normalizeExploreQuery(new URLSearchParams("q=gehen")));
  assert.ok(matches.length > 1);
  assert.equal(matches[0]?.word, "gehen");
});

test("keeps function, name, number, and other filters distinct", () => {
  for (const type of ["function", "name", "number", "other"] as const) {
    const matches = filterRecords(records, normalizeExploreQuery(new URLSearchParams(`type=${type}`)));
    assert.ok(matches.length > 0, type);
    assert.ok(matches.every((record) => record.kind === type), type);
  }
});

test("keeps the complete index available without pagination", () => {
  const query = normalizeExploreQuery(new URLSearchParams());
  assert.equal(filterRecords(records, query).length, 1000);
});
