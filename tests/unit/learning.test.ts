import assert from "node:assert/strict";
import test from "node:test";

import {
  AGAIN_DELAY_MINUTES,
  INTERVAL_LADDER_DAYS,
  advanceSession,
  applyReviewOutcome,
  completeSession,
  createInitialReviewState,
  formatReviewOutcome,
  getSessionRecord,
  intervalIndex,
  isReviewDue,
  migrateV1Progress,
  nextIntervalDays,
  recordExerciseAttempt,
  revealSession,
  selectDueRecords,
  sessionProgress,
  startPracticeSession,
  type PracticeSession,
  type ReviewState,
} from "../../app/lib/learning/index";

const NOW = "2026-08-15T12:00:00.000Z";
const records = (ranks: readonly number[]) =>
  ranks.map((rank) => ({ rank, word: `word-${rank}` }));

function state(overrides: Partial<ReviewState> = {}): ReviewState {
  return { ...createInitialReviewState(), ...overrides };
}

test("exposes the deliberate interval ladder and caps at its last rung", () => {
  assert.deepEqual([...INTERVAL_LADDER_DAYS], [1, 3, 7, 14, 30, 60]);
  assert.equal(AGAIN_DELAY_MINUTES, 10);
  assert.equal(nextIntervalDays(0), 1);
  assert.equal(nextIntervalDays(1), 3);
  assert.equal(nextIntervalDays(7), 14);
  assert.equal(nextIntervalDays(60), 60);
  assert.equal(nextIntervalDays(500), 60);
  assert.equal(intervalIndex(0), -1);
  assert.equal(intervalIndex(14), 3);
});

test("applies Again to a new card without mutating its input", () => {
  const initial = createInitialReviewState();
  const next = applyReviewOutcome(initial, "again", NOW);

  assert.deepEqual(initial, createInitialReviewState());
  assert.equal(next.status, "learning");
  assert.equal(next.dueAt, "2026-08-15T12:10:00.000Z");
  assert.equal(next.intervalDays, 0);
  assert.equal(next.streak, 0);
  assert.equal(next.attempts, 1);
  assert.equal(next.correctAttempts, 0);
  assert.equal(next.lastResult, "again");
});

test("moves new, learning, and known cards through the confidence ladder", () => {
  const known = applyReviewOutcome(createInitialReviewState(), "known", NOW);
  assert.equal(known.status, "known");
  assert.equal(known.intervalDays, 1);
  assert.equal(known.dueAt, "2026-08-16T12:00:00.000Z");
  assert.equal(known.streak, 1);
  assert.equal(known.correctAttempts, 1);

  const knownAgain = applyReviewOutcome(known, "known", "2026-08-16T12:00:00.000Z");
  assert.equal(knownAgain.intervalDays, 3);
  assert.equal(knownAgain.dueAt, "2026-08-19T12:00:00.000Z");
  assert.equal(knownAgain.streak, 2);

  const learning = applyReviewOutcome(
    state({ status: "learning", dueAt: NOW, attempts: 2 }),
    "known",
    NOW,
  );
  assert.equal(learning.status, "known");
  assert.equal(learning.intervalDays, 1);
  assert.equal(learning.streak, 1);
  assert.equal(learning.attempts, 3);

  const learningAgain = applyReviewOutcome(learning, "again", NOW);
  assert.equal(learningAgain.status, "learning");
  assert.equal(learningAgain.intervalDays, 0);
  assert.equal(learningAgain.streak, 0);
  assert.equal(learningAgain.attempts, 4);
  assert.equal(learningAgain.correctAttempts, learning.correctAttempts);
});

test("records exercise attempts without silently scheduling mastery", () => {
  const dueAt = "2026-08-18T12:00:00.000Z";
  const known = state({ status: "known", dueAt, intervalDays: 3 });
  const attempted = recordExerciseAttempt(known, "correct", NOW);

  assert.equal(attempted.status, "known");
  assert.equal(attempted.dueAt, dueAt);
  assert.equal(attempted.intervalDays, 3);
  assert.equal(attempted.attempts, 1);
  assert.equal(attempted.correctAttempts, 1);
  assert.equal(attempted.lastResult, "correct");
  assert.deepEqual(known, state({ status: "known", dueAt, intervalDays: 3 }));
});

test("normalizes malformed review state to a safe new state", () => {
  const malformed = { status: "known", attempts: "many" } as unknown as ReviewState;
  const next = applyReviewOutcome(malformed, "known", NOW);

  assert.equal(next.status, "known");
  assert.equal(next.intervalDays, 1);
  assert.equal(next.attempts, 1);
  assert.equal(isReviewDue(malformed, NOW), true);
});

test("selects due records before new records with deterministic tie-breaking", () => {
  const progress = {
    1: state({ status: "learning", dueAt: "2026-08-15T11:00:00.000Z" }),
    2: state({ status: "known", dueAt: "2026-08-16T12:00:00.000Z" }),
    3: state({ status: "learning", dueAt: "2026-08-15T10:00:00.000Z" }),
    4: state({ status: "known", dueAt: "2026-08-15T10:00:00.000Z" }),
  };

  const selected = selectDueRecords(records([4, 3, 2, 1, 5, 6]), progress, NOW, 4);
  assert.deepEqual(
    selected.map((record) => record.rank),
    [3, 4, 1, 5],
  );
  assert.equal(
    selectDueRecords(records([2]), progress, NOW, 10).length,
    0,
    "future-due known records are not due",
  );
});

test("freezes the selected order and advances without reselecting from progress", () => {
  const session = startPracticeSession(records([1, 2, 3, 4]), {}, NOW, 3);

  assert.deepEqual([...session.ids], [1, 2, 3]);
  assert.equal(session.phase, "prompt");
  assert.deepEqual(sessionProgress(session), {
    completed: 0,
    total: 3,
    remaining: 3,
    percent: 0,
  });

  const first = getSessionRecord(session, records([1, 2, 3]));
  assert.equal(first.status, "active");
  if (first.status === "active") assert.equal(first.record.rank, 1);

  const revealed = revealSession(session);
  const second = advanceSession(revealed);
  assert.equal(second.phase, "prompt");
  assert.equal(second.position, 1);
  assert.deepEqual([...second.ids], [1, 2, 3]);

  const currentAfterExternalChange = getSessionRecord(second, records([1, 2, 3, 99]));
  assert.equal(currentAfterExternalChange.status, "active");
  if (currentAfterExternalChange.status === "active") {
    assert.equal(currentAfterExternalChange.record.rank, 2);
  }
});

test("completes exactly on the final advancement and is idempotent afterward", () => {
  let session: PracticeSession = startPracticeSession(records([1, 2]), {}, NOW, 2);
  session = advanceSession(session);
  assert.equal(session.phase, "prompt");
  session = advanceSession(session);

  assert.equal(session.phase, "complete");
  assert.equal(session.position, 2);
  assert.deepEqual(sessionProgress(session), {
    completed: 2,
    total: 2,
    remaining: 0,
    percent: 100,
  });
  assert.deepEqual(completeSession(session), {
    sessionId: session.sessionId,
    startedAt: NOW,
    completed: 2,
    total: 2,
    remaining: 0,
    percent: 100,
    complete: true,
  });
  assert.deepEqual(advanceSession(session), session);

  const current = getSessionRecord(session, records([1, 2]));
  assert.deepEqual(current, { status: "complete", completed: 2, total: 2 });
});

test("starts an empty session as complete and caps a requested session at ten cards", () => {
  const futureKnown = state({ status: "known", dueAt: "2026-08-16T12:00:00.000Z" });
  const empty = startPracticeSession(records([1]), { 1: futureKnown }, NOW, 10);
  assert.equal(empty.phase, "complete");
  assert.deepEqual(empty.ids, []);

  const bounded = startPracticeSession(records(Array.from({ length: 20 }, (_, index) => index + 1)), {}, NOW, 100);
  assert.equal(bounded.ids.length, 10);
  assert.equal(bounded.ids[0], 1);
  assert.equal(bounded.ids[9], 10);
});

test("migrates the v1 progress map without changing its known/learning counts", () => {
  const result = migrateV1Progress(
    JSON.stringify({ "1": "known", "2": "learning", "bad": "known", "3": "unclear" }),
    NOW,
  );

  assert.equal(result.source, "v1");
  assert.equal(result.migratedCount, 2);
  assert.equal(result.skippedCount, 2);
  assert.equal(Object.keys(result.snapshot.records).length, 2);
  assert.equal(result.snapshot.schemaVersion, 2);
  assert.equal(result.snapshot.updatedAt, NOW);
  assert.equal(result.snapshot.records[1].status, "known");
  assert.equal(result.snapshot.records[1].intervalDays, 1);
  assert.equal(result.snapshot.records[1].dueAt, "2026-08-16T12:00:00.000Z");
  assert.equal(result.snapshot.records[2].status, "learning");
  assert.equal(result.snapshot.records[2].dueAt, "2026-08-15T12:10:00.000Z");
});

test("migration safely handles empty, malformed, and duplicate-rank payloads", () => {
  const empty = migrateV1Progress(null, NOW);
  assert.equal(empty.source, "empty");
  assert.equal(empty.skippedCount, 0);
  assert.deepEqual(empty.snapshot.records, {});

  const invalid = migrateV1Progress("not json", NOW);
  assert.equal(invalid.source, "invalid");
  assert.equal(invalid.skippedCount, 1);
  assert.equal(invalid.warnings[0]?.reason, "invalid-payload");

  const duplicate = migrateV1Progress({ "01": "known", "1": "learning" }, NOW);
  assert.equal(duplicate.migratedCount, 1);
  assert.equal(duplicate.skippedCount, 1);
  assert.equal(duplicate.warnings[0]?.reason, "duplicate-rank");
});

test("formats review outcomes with their real consequences", () => {
  assert.deepEqual(formatReviewOutcome("again"), {
    label: "Again",
    consequence: "Review again in about 10 minutes.",
  });
  assert.deepEqual(formatReviewOutcome("known"), {
    label: "I know it",
    consequence: "Next review follows the interval ladder.",
  });
});
