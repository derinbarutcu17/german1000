/**
 * Shared contracts for the learning domain.
 *
 * These types intentionally contain no browser, React, or vocabulary-data
 * dependencies. They are the boundary the future UI and persistence layers
 * can depend on without owning the learning rules themselves.
 */

export type DateInput = string | Date;

export type ReviewStatus = "new" | "learning" | "known";

export type ReviewOutcome = "again" | "known";

export type StorageStatus = "unavailable" | "empty" | "ready" | "invalid";

export type ExerciseResult = "correct" | "wrong";

export type LastResult = ReviewOutcome | ExerciseResult | null;

export type ReviewState = {
  status: ReviewStatus;
  dueAt: string | null;
  intervalDays: number;
  streak: number;
  attempts: number;
  correctAttempts: number;
  lastReviewedAt: string | null;
  lastResult: LastResult;
};

export type ProgressRecords = Readonly<Record<number, ReviewState>>;

export type ProgressSnapshot = {
  schemaVersion: 2;
  updatedAt: string;
  records: ProgressRecords;
};

export type RankedRecord = {
  readonly rank: number;
};

export type SessionPhase = "prompt" | "revealed" | "complete";

export type PracticeSession = {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly ids: readonly number[];
  readonly position: number;
  readonly phase: SessionPhase;
};

export type SessionProgress = {
  readonly completed: number;
  readonly total: number;
  readonly remaining: number;
  readonly percent: number;
};

export type SessionSummary = SessionProgress & {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly complete: boolean;
};

export type SessionRecordResult<T> =
  | {
      readonly status: "active";
      readonly record: T;
      readonly position: number;
    }
  | {
      readonly status: "complete";
      readonly completed: number;
      readonly total: number;
    }
  | {
      readonly status: "missing";
      readonly rank: number;
      readonly position: number;
    };

export type LegacyProgressStatus = "learning" | "known";

export type MigrationSource = "empty" | "v1" | "invalid";

export type MigrationWarningReason =
  | "invalid-payload"
  | "invalid-rank"
  | "invalid-status"
  | "duplicate-rank";

export type MigrationWarning = {
  readonly key: string;
  readonly reason: MigrationWarningReason;
};

export type MigrationResult = {
  readonly source: MigrationSource;
  readonly snapshot: ProgressSnapshot;
  readonly migratedCount: number;
  readonly skippedCount: number;
  readonly warnings: readonly MigrationWarning[];
};
