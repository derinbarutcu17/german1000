import assert from "node:assert/strict";
import test from "node:test";
import { emptySession } from "../../app/lib/learning/session";
import {
  clearProgressSnapshot,
  readPracticeSession,
  readProgressSnapshot,
  writePracticeSession,
  writeProgressSnapshot,
} from "../../app/lib/learning/storage";

function installStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } as Storage;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
  return values;
}

test.afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

test("reads an empty browser as a safe new snapshot", () => {
  installStorage();
  const result = readProgressSnapshot("2026-08-15T12:00:00.000Z");
  assert.equal(result.status, "empty");
  assert.deepEqual(result.snapshot.records, {});
});

test("migrates the original v1 key and stores a v2 snapshot", () => {
  const values = installStorage({ "german-1000-progress-v1": JSON.stringify({ "1": "known" }) });
  const result = readProgressSnapshot("2026-08-15T12:00:00.000Z");
  assert.equal(result.status, "ready");
  assert.equal(result.migrated, true);
  assert.equal(result.snapshot.records[1]?.status, "known");
  assert.ok(values.has("german-1000-progress-v2"));
});

test("rejects malformed nested v2 records instead of trusting them", () => {
  installStorage({ "german-1000-progress-v2": JSON.stringify({ schemaVersion: 2, updatedAt: "2026-08-15T12:00:00.000Z", records: { "1": { status: "known" } } }) });
  const result = readProgressSnapshot("2026-08-15T12:00:00.000Z");
  assert.equal(result.status, "invalid");
  assert.deepEqual(result.snapshot.records, {});
});

test("round-trips and clears the frozen practice session", () => {
  installStorage();
  const session = emptySession();
  assert.deepEqual(writePracticeSession(session), { ok: true });
  assert.equal(readPracticeSession().session?.sessionId, session.sessionId);
  assert.deepEqual(clearProgressSnapshot(), { ok: true });
  assert.equal(readPracticeSession().session, null);
});

test("writes a progress snapshot through the browser adapter", () => {
  installStorage();
  const snapshot = { schemaVersion: 2 as const, updatedAt: "2026-08-15T12:00:00.000Z", records: {} };
  assert.deepEqual(writeProgressSnapshot(snapshot), { ok: true });
  assert.equal(readProgressSnapshot().status, "ready");
});
