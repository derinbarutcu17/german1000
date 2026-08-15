import { addDays, addMinutes, isTimestamp, toIsoTimestamp } from "./time";
import { createInitialReviewState, isReviewState } from "./review-state";
import type {
  DateInput,
  LegacyProgressStatus,
  MigrationResult,
  MigrationWarning,
  ProgressSnapshot,
  ReviewState,
} from "./types";

export const LEGACY_PROGRESS_STORAGE_KEY = "german-1000-progress-v1";
export const PROGRESS_STORAGE_KEY = "german-1000-progress-v2";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emptySnapshot(updatedAt: string): ProgressSnapshot {
  return {
    schemaVersion: 2,
    updatedAt,
    records: {},
  };
}

function migratedState(status: LegacyProgressStatus, now: string): ReviewState {
  const initial = createInitialReviewState();

  if (status === "known") {
    return {
      ...initial,
      status: "known",
      intervalDays: 1,
      dueAt: addDays(now, 1),
    };
  }

  return {
    ...initial,
    status: "learning",
    dueAt: addMinutes(now, 10),
  };
}

function invalidResult(
  updatedAt: string,
  key: string,
  reason: MigrationWarning["reason"],
): MigrationResult {
  const warning: MigrationWarning = { key, reason };
  return {
    source: "invalid",
    snapshot: emptySnapshot(updatedAt),
    migratedCount: 0,
    skippedCount: 1,
    warnings: [warning],
  };
}

function decodePayload(input: unknown):
  | { readonly source: "empty"; readonly payload: null }
  | { readonly source: "v1"; readonly payload: Record<string, unknown> }
  | { readonly source: "invalid"; readonly payload: null; readonly warning: MigrationWarning } {
  if (input === null || input === undefined || input === "") {
    return { source: "empty", payload: null };
  }

  if (typeof input === "string") {
    try {
      const parsed: unknown = JSON.parse(input);
      if (!isPlainRecord(parsed)) {
        return {
          source: "invalid",
          payload: null,
          warning: { key: "payload", reason: "invalid-payload" },
        };
      }
      return { source: "v1", payload: parsed };
    } catch {
      return {
        source: "invalid",
        payload: null,
        warning: { key: "payload", reason: "invalid-payload" },
      };
    }
  }

  if (!isPlainRecord(input)) {
    return {
      source: "invalid",
      payload: null,
      warning: { key: "payload", reason: "invalid-payload" },
    };
  }

  return { source: "v1", payload: input };
}

function parseRank(key: string): number | null {
  if (!/^\d+$/.test(key)) {
    return null;
  }

  const rank = Number(key);
  return Number.isSafeInteger(rank) && rank > 0 ? rank : null;
}

function isLegacyStatus(value: unknown): value is LegacyProgressStatus {
  return value === "learning" || value === "known";
}

/**
 * Migrate the current UI's v1 map (`{ "12": "known" }`) into the v2
 * snapshot. Migration time is explicit so this function remains deterministic
 * and the new due dates are honest about starting from the migration moment.
 */
export function migrateV1Progress(input: unknown, now: DateInput): MigrationResult {
  const updatedAt = toIsoTimestamp(now);
  const decoded = decodePayload(input);

  if (decoded.source === "empty") {
    return {
      source: "empty",
      snapshot: emptySnapshot(updatedAt),
      migratedCount: 0,
      skippedCount: 0,
      warnings: [],
    };
  }

  if (decoded.source === "invalid") {
    return invalidResult(updatedAt, decoded.warning.key, decoded.warning.reason);
  }

  const records: Record<number, ReviewState> = {};
  const warnings: MigrationWarning[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for (const [key, value] of Object.entries(decoded.payload)) {
    const rank = parseRank(key);
    if (rank === null) {
      warnings.push({ key, reason: "invalid-rank" });
      skippedCount += 1;
      continue;
    }

    if (records[rank] !== undefined) {
      warnings.push({ key, reason: "duplicate-rank" });
      skippedCount += 1;
      continue;
    }

    if (!isLegacyStatus(value)) {
      warnings.push({ key, reason: "invalid-status" });
      skippedCount += 1;
      continue;
    }

    records[rank] = migratedState(value, updatedAt);
    migratedCount += 1;
  }

  return {
    source: "v1",
    snapshot: {
      schemaVersion: 2,
      updatedAt,
      records,
    },
    migratedCount,
    skippedCount,
    warnings,
  };
}

export function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  if (!isPlainRecord(value) || value.schemaVersion !== 2 || !isTimestamp(value.updatedAt)) {
    return false;
  }

  if (!isPlainRecord(value.records)) return false;
  return Object.values(value.records).every((state) => isReviewState(state));
}
