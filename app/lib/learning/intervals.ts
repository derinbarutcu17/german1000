import { addDays, addMinutes } from "./time";
import type { DateInput } from "./types";

/**
 * A deliberately small, inspectable ladder. It is not presented as SM-2 or
 * as a research-grade scheduler; it is a deterministic first release.
 */
export const INTERVAL_LADDER_DAYS = [1, 3, 7, 14, 30, 60] as const;

export const AGAIN_DELAY_MINUTES = 10;

export type IntervalLadderDay = (typeof INTERVAL_LADDER_DAYS)[number];

export function nextIntervalDays(currentIntervalDays: number): IntervalLadderDay {
  if (!Number.isFinite(currentIntervalDays) || currentIntervalDays <= 0) {
    return INTERVAL_LADDER_DAYS[0];
  }

  return (
    INTERVAL_LADDER_DAYS.find((interval) => interval > currentIntervalDays) ??
    INTERVAL_LADDER_DAYS[INTERVAL_LADDER_DAYS.length - 1]
  );
}

export function intervalIndex(currentIntervalDays: number): number {
  if (!Number.isFinite(currentIntervalDays) || currentIntervalDays <= 0) {
    return -1;
  }

  let index = -1;
  INTERVAL_LADDER_DAYS.forEach((interval, candidateIndex) => {
    if (interval <= currentIntervalDays) {
      index = candidateIndex;
    }
  });

  return index;
}

export function dueAtForAgain(now: DateInput): string {
  return addMinutes(now, AGAIN_DELAY_MINUTES);
}

export function dueAtForKnown(now: DateInput, currentIntervalDays: number): string {
  return addDays(now, nextIntervalDays(currentIntervalDays));
}
