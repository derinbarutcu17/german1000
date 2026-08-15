import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  migrateV1Progress,
} from "./migrations";
import { isProgressSnapshot } from "./migrations";
import type { DateInput, PracticeSession, ProgressSnapshot } from "./types";

export const STORAGE_KEY = PROGRESS_STORAGE_KEY;
export const LEGACY_STORAGE_KEY = LEGACY_PROGRESS_STORAGE_KEY;
export const SESSION_STORAGE_KEY = "german-1000-practice-session-v1";

export type StorageReadStatus = "unavailable" | "empty" | "ready" | "invalid";

export type StorageReadResult = {
  readonly status: StorageReadStatus;
  readonly snapshot: ProgressSnapshot;
  readonly migrated: boolean;
};

export type StorageWriteResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unavailable" | "write-failed" };

export type StorageClearResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unavailable" | "clear-failed" };

export type SessionReadResult = {
  readonly session: PracticeSession | null;
  readonly status: "unavailable" | "empty" | "ready" | "invalid";
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function emptySnapshot(now: DateInput): ProgressSnapshot {
  return {
    schemaVersion: 2,
    updatedAt: new Date(now).toISOString(),
    records: {},
  };
}

function parseSnapshot(value: string | null): ProgressSnapshot | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return isProgressSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseSession(value: string | null): PracticeSession | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const candidate = parsed as Partial<PracticeSession>;
    if (typeof candidate.sessionId !== "string" || typeof candidate.startedAt !== "string" || !Array.isArray(candidate.ids) || typeof candidate.position !== "number" || !["prompt", "revealed", "complete"].includes(String(candidate.phase))) return null;
    if (!candidate.ids.every((rank) => typeof rank === "number" && Number.isInteger(rank) && rank > 0)) return null;
    if (!Number.isInteger(candidate.position) || candidate.position < 0 || candidate.position > candidate.ids.length || new Set(candidate.ids).size !== candidate.ids.length || candidate.ids.length > 10) return null;
    return {
      sessionId: candidate.sessionId,
      startedAt: candidate.startedAt,
      ids: Object.freeze([...candidate.ids]),
      position: candidate.position,
      phase: candidate.phase,
    } as PracticeSession;
  } catch {
    return null;
  }
}

export function readProgressSnapshot(now: DateInput = new Date()): StorageReadResult {
  const empty = emptySnapshot(now);
  if (!hasStorage()) return { status: "unavailable", snapshot: empty, migrated: false };

  try {
    const currentRaw = window.localStorage.getItem(STORAGE_KEY);
    const current = parseSnapshot(currentRaw);
    if (current) return { status: "ready", snapshot: current, migrated: false };

    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return { status: currentRaw ? "invalid" : "empty", snapshot: empty, migrated: false };

    const migrated = migrateV1Progress(legacyRaw, now);
    if (migrated.source === "invalid") {
      return { status: "invalid", snapshot: empty, migrated: false };
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated.snapshot));
    return { status: "ready", snapshot: migrated.snapshot, migrated: true };
  } catch {
    return { status: "unavailable", snapshot: empty, migrated: false };
  }
}

export function readPracticeSession(): SessionReadResult {
  if (!hasStorage()) return { status: "unavailable", session: null };
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { status: "empty", session: null };
    const session = parseSession(raw);
    return session ? { status: "ready", session } : { status: "invalid", session: null };
  } catch {
    return { status: "unavailable", session: null };
  }
}

export function writePracticeSession(session: PracticeSession): StorageWriteResult {
  if (!hasStorage()) return { ok: false, reason: "unavailable" };
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return { ok: true };
  } catch {
    return { ok: false, reason: "write-failed" };
  }
}

export function writeProgressSnapshot(snapshot: ProgressSnapshot): StorageWriteResult {
  if (!hasStorage()) return { ok: false, reason: "unavailable" };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return { ok: true };
  } catch {
    return { ok: false, reason: "write-failed" };
  }
}

export function clearProgressSnapshot(): StorageClearResult {
  if (!hasStorage()) return { ok: false, reason: "unavailable" };

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, reason: "clear-failed" };
  }
}
