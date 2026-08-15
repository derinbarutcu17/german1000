"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { records, recordByRank } from "../../data/records";
import { applyReviewOutcome, recordExerciseAttempt } from "./scheduler";
import { advanceSession, currentSessionRank, emptySession, revealSession, sessionProgress, startPracticeSession } from "./session";
import { clearProgressSnapshot, readPracticeSession, readProgressSnapshot, writePracticeSession, writeProgressSnapshot } from "./storage";
import type { ExerciseResult, PracticeSession, ProgressSnapshot, ReviewOutcome, ReviewStatus, StorageStatus } from "./types";

function emptyProgressSnapshot(): ProgressSnapshot {
  return {
    schemaVersion: 2,
    updatedAt: "1970-01-01T00:00:00.000Z",
    records: {},
  };
}

export function useLearningStore() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() => emptyProgressSnapshot());
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("empty");
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<PracticeSession>(() => emptySession());
  const sessionRef = useRef<PracticeSession>(emptySession());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = readProgressSnapshot();
      const savedSession = readPracticeSession().session;
      const restoredSession = savedSession && savedSession.ids.every((rank) => recordByRank.has(rank)) ? savedSession : startPracticeSession(records, result.snapshot);
      setSnapshot(result.snapshot);
      setStorageStatus(result.status);
      sessionRef.current = restoredSession;
      setSession(restoredSession);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const result = writeProgressSnapshot(snapshot);
    if (!result.ok) {
      const timer = window.setTimeout(() => setStorageStatus("unavailable"), 0);
      return () => window.clearTimeout(timer);
    }
  }, [hydrated, snapshot]);

  useEffect(() => {
    if (!hydrated) return;
    const result = writePracticeSession(session);
    if (!result.ok) {
      const timer = window.setTimeout(() => setStorageStatus("unavailable"), 0);
      return () => window.clearTimeout(timer);
    }
  }, [hydrated, session]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== "german-1000-progress-v2" && event.key !== "german-1000-progress-v1" && event.key !== "german-1000-practice-session-v1") return;
      const result = readProgressSnapshot();
      const savedSession = readPracticeSession().session;
      setSnapshot(result.snapshot);
      setStorageStatus(result.status);
      if (event.key === "german-1000-practice-session-v1") {
        const nextSession = savedSession && savedSession.ids.every((rank) => recordByRank.has(rank)) ? savedSession : startPracticeSession(records, result.snapshot);
        sessionRef.current = nextSession;
        setSession(nextSession);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentRank = currentSessionRank(session);
  const progress = sessionProgress(session);
  const currentRecord = currentRank ? recordByRank.get(currentRank) ?? null : null;
  const knownCount = Object.values(snapshot.records).filter((state) => state.status === "known").length;
  const learningCount = Object.values(snapshot.records).filter((state) => state.status === "learning").length;
  const completion = Math.round((knownCount / records.length) * 100);
  const statusForRank = useCallback((rank: number): ReviewStatus => snapshot.records[rank]?.status ?? "new", [snapshot.records]);

  const reveal = useCallback(() => {
    const nextSession = revealSession(sessionRef.current);
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const markRank = useCallback((rank: number, outcome: ReviewOutcome) => {
    setSnapshot((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      records: {
        ...previous.records,
        [rank]: applyReviewOutcome(previous.records[rank], outcome, new Date()),
      },
    }));
  }, []);

  const exerciseAttempt = useCallback((rank: number, result: ExerciseResult) => {
    setSnapshot((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      records: {
        ...previous.records,
        [rank]: recordExerciseAttempt(previous.records[rank], result, new Date()),
      },
    }));
  }, []);

  const review = useCallback((rank: number, outcome: ReviewOutcome) => {
    const previous = sessionRef.current;
    if (previous.phase !== "revealed" || currentSessionRank(previous) !== rank) return;
    const nextSession = advanceSession(previous);
    sessionRef.current = nextSession;
    setSession(nextSession);
    markRank(rank, outcome);
  }, [markRank]);

  const restartSession = useCallback(() => {
    const nextSession = startPracticeSession(records, snapshot);
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, [snapshot]);

  const reset = useCallback(() => {
    const cleared = clearProgressSnapshot();
    const empty = emptyProgressSnapshot();
    setSnapshot(empty);
    setStorageStatus(cleared.ok ? "empty" : "unavailable");
    const nextSession = startPracticeSession(records, empty);
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const resetProgress = reset;

  return useMemo(() => ({
    snapshot,
    storageStatus,
    hydrated,
    session,
    currentRecord,
    currentRank,
    knownCount,
    learningCount,
    completion,
    sessionProgress: progress,
    reveal,
    review,
    markRank,
    exerciseAttempt,
    statusForRank,
    restartSession,
    reset,
    resetProgress,
  }), [completion, currentRank, currentRecord, exerciseAttempt, hydrated, knownCount, learningCount, markRank, progress, reset, resetProgress, review, reveal, session, snapshot, statusForRank, storageStatus, restartSession]);
}
