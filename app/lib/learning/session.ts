import { selectDueRecords, type ProgressLookup } from "./scheduler";
import { toIsoTimestamp } from "./time";
import type {
  DateInput,
  PracticeSession,
  RankedRecord,
  SessionProgress,
  SessionRecordResult,
  SessionSummary,
} from "./types";

export const DEFAULT_PRACTICE_SESSION_SIZE = 10;
export const MAX_PRACTICE_SESSION_SIZE = 10;

function safeSessionLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_PRACTICE_SESSION_SIZE;
  }

  return Math.min(MAX_PRACTICE_SESSION_SIZE, Math.max(0, Math.floor(limit)));
}

function safePosition(session: PracticeSession): number {
  if (!Number.isFinite(session.position)) {
    return 0;
  }

  return Math.min(session.ids.length, Math.max(0, Math.floor(session.position)));
}

function createSessionId(startedAt: string, ids: readonly number[]): string {
  return "practice-" + startedAt + "-" + (ids.length === 0 ? "empty" : ids.join("-"));
}

export function startPracticeSession<T extends RankedRecord>(
  records: readonly T[],
  progress: ProgressLookup,
  now: DateInput = new Date(),
  limit = DEFAULT_PRACTICE_SESSION_SIZE,
): PracticeSession {
  const startedAt = toIsoTimestamp(now);
  const selected = selectDueRecords(records, progress, startedAt, safeSessionLimit(limit));
  const ids = Object.freeze(selected.map((record) => record.rank));

  return {
    sessionId: createSessionId(startedAt, ids),
    startedAt,
    ids,
    position: 0,
    phase: ids.length === 0 ? "complete" : "prompt",
  };
}

export function emptySession(): PracticeSession {
  const startedAt = "1970-01-01T00:00:00.000Z";
  return {
    sessionId: createSessionId(startedAt, []),
    startedAt,
    ids: [],
    position: 0,
    phase: "complete",
  };
}

export function currentSessionRank(session: PracticeSession): number | null {
  const position = safePosition(session);
  return session.phase === "complete" || position >= session.ids.length ? null : session.ids[position] ?? null;
}

export function revealSession(session: PracticeSession): PracticeSession {
  if (session.phase !== "prompt") {
    return session;
  }

  return { ...session, phase: "revealed" };
}

/** Advance the frozen session cursor exactly once; never reselects records. */
export function advanceSession(session: PracticeSession): PracticeSession {
  if (session.phase === "complete") {
    return session;
  }

  const position = Math.min(session.ids.length, safePosition(session) + 1);
  return {
    ...session,
    position,
    phase: position >= session.ids.length ? "complete" : "prompt",
  };
}

export function getSessionRecord<T extends RankedRecord>(
  session: PracticeSession,
  records: readonly T[],
): SessionRecordResult<T> {
  const position = safePosition(session);

  if (session.phase === "complete" || position >= session.ids.length) {
    return {
      status: "complete",
      completed: position,
      total: session.ids.length,
    };
  }

  const rank = session.ids[position];
  const record = records.find((candidate) => candidate.rank === rank);

  if (record === undefined) {
    return { status: "missing", rank, position };
  }

  return { status: "active", record, position };
}

export function sessionProgress(session: PracticeSession): SessionProgress {
  const total = session.ids.length;
  const completed = safePosition(session);

  return {
    completed,
    total,
    remaining: Math.max(0, total - completed),
    percent: total === 0 ? 100 : Math.round((completed / total) * 100),
  };
}

export function completeSession(session: PracticeSession): SessionSummary {
  const progress = sessionProgress(session);

  return {
    ...progress,
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    complete: progress.completed === progress.total,
  };
}
