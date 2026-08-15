import { dueAtForAgain, dueAtForKnown, nextIntervalDays } from "./intervals";
import { normalizeReviewState } from "./review-state";
import { compareTimestamps, toIsoTimestamp } from "./time";
import type {
  DateInput,
  ExerciseResult,
  ProgressRecords,
  ProgressSnapshot,
  RankedRecord,
  ReviewOutcome,
  ReviewState,
} from "./types";

export type ProgressLookup = ProgressRecords | ProgressSnapshot;

export type ReviewOutcomeCopy = {
  readonly label: string;
  readonly consequence: string;
};

function recordsFromProgress(progress: ProgressLookup): ProgressRecords {
  return "records" in progress ? progress.records : progress;
}

function stateForRank(progress: ProgressLookup, rank: number): ReviewState {
  const state = recordsFromProgress(progress)[rank];
  return state === undefined ? normalizeReviewState(undefined) : normalizeReviewState(state);
}

function dueSortValue(state: ReviewState): number {
  return state.dueAt === null ? Number.NEGATIVE_INFINITY : Date.parse(state.dueAt);
}

export function applyReviewOutcome(
  state: unknown,
  outcome: ReviewOutcome,
  now: DateInput,
): ReviewState {
  const current = normalizeReviewState(state);
  const reviewedAt = toIsoTimestamp(now);

  if (outcome === "again") {
    return {
      ...current,
      status: "learning",
      dueAt: dueAtForAgain(reviewedAt),
      intervalDays: 0,
      streak: 0,
      attempts: current.attempts + 1,
      lastReviewedAt: reviewedAt,
      lastResult: "again",
    };
  }

  if (outcome === "known") {
    const intervalDays = nextIntervalDays(current.intervalDays);

    return {
      ...current,
      status: "known",
      dueAt: dueAtForKnown(reviewedAt, current.intervalDays),
      intervalDays,
      streak: current.status === "known" ? current.streak + 1 : 1,
      attempts: current.attempts + 1,
      correctAttempts: current.correctAttempts + 1,
      lastReviewedAt: reviewedAt,
      lastResult: "known",
    };
  }

  return current;
}

/** Record retrieval performance without silently changing scheduling status. */
export function recordExerciseAttempt(
  state: ReviewState,
  result: ExerciseResult,
  now: DateInput,
): ReviewState {
  const current = normalizeReviewState(state);
  const attemptedAt = toIsoTimestamp(now);

  return {
    ...current,
    attempts: current.attempts + 1,
    correctAttempts: current.correctAttempts + (result === "correct" ? 1 : 0),
    lastReviewedAt: attemptedAt,
    lastResult: result,
  };
}

export function getNextDueAt(state: ReviewState): string | null {
  return normalizeReviewState(state).dueAt;
}

export function isReviewDue(state: ReviewState, now: DateInput): boolean {
  const current = normalizeReviewState(state);

  if (current.status === "new") {
    return true;
  }

  if (current.dueAt === null) {
    return current.status === "learning";
  }

  return compareTimestamps(current.dueAt, toIsoTimestamp(now)) <= 0;
}

/**
 * Select due/relearning records first, then unseen records. Both buckets are
 * deterministic: due time first, then rank; unseen records are rank ordered.
 * Duplicate or invalid ranks are ignored so callers never get an ambiguous
 * session snapshot.
 */
export function selectDueRecords<T extends RankedRecord>(
  records: readonly T[],
  progress: ProgressLookup,
  now: DateInput,
  limit = 10,
): T[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  if (safeLimit === 0) {
    return [];
  }

  const due: Array<{ record: T; state: ReviewState }> = [];
  const unseen: T[] = [];
  const seenRanks = new Set<number>();

  for (const record of records) {
    if (!Number.isInteger(record.rank) || record.rank <= 0 || seenRanks.has(record.rank)) {
      continue;
    }

    seenRanks.add(record.rank);
    const state = stateForRank(progress, record.rank);

    if (state.status === "new") {
      unseen.push(record);
    } else if (isReviewDue(state, now)) {
      due.push({ record, state });
    }
  }

  due.sort((left, right) => {
    const dueDifference = dueSortValue(left.state) - dueSortValue(right.state);
    return dueDifference || left.record.rank - right.record.rank;
  });
  unseen.sort((left, right) => left.rank - right.rank);

  return [...due.map(({ record }) => record), ...unseen].slice(0, safeLimit);
}

export function formatReviewOutcome(outcome: ReviewOutcome): ReviewOutcomeCopy {
  if (outcome === "again") {
    return {
      label: "Again",
      consequence: "Review again in about 10 minutes.",
    };
  }

  return {
    label: "I know it",
    consequence: "Next review follows the interval ladder.",
  };
}
