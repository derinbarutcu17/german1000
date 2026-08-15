import { isTimestamp } from "./time";
import type {
  ExerciseResult,
  LastResult,
  ReviewState,
  ReviewStatus,
} from "./types";

const REVIEW_STATUSES: readonly ReviewStatus[] = ["new", "learning", "known"];
const LAST_RESULTS: readonly Exclude<LastResult, null>[] = [
  "again",
  "known",
  "correct",
  "wrong",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isNullableTimestamp(value: unknown): value is string | null {
  return value === null || isTimestamp(value);
}

function isLastResult(value: unknown): value is LastResult {
  return value === null || LAST_RESULTS.includes(value as Exclude<LastResult, null>);
}

export function createInitialReviewState(): ReviewState {
  return {
    status: "new",
    dueAt: null,
    intervalDays: 0,
    streak: 0,
    attempts: 0,
    correctAttempts: 0,
    lastReviewedAt: null,
    lastResult: null,
  };
}

/** Runtime guard used at persistence and migration boundaries. */
export function isReviewState(value: unknown): value is ReviewState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    REVIEW_STATUSES.includes(value.status as ReviewStatus) &&
    isNullableTimestamp(value.dueAt) &&
    isNonNegativeInteger(value.intervalDays) &&
    isNonNegativeInteger(value.streak) &&
    isNonNegativeInteger(value.attempts) &&
    isNonNegativeInteger(value.correctAttempts) &&
    isNullableTimestamp(value.lastReviewedAt) &&
    isLastResult(value.lastResult)
  );
}

/** Return a detached valid state, or a safe new state for malformed input. */
export function normalizeReviewState(value: unknown): ReviewState {
  if (!isReviewState(value)) {
    return createInitialReviewState();
  }

  return { ...value };
}

export function isExerciseResult(value: unknown): value is ExerciseResult {
  return value === "correct" || value === "wrong";
}
