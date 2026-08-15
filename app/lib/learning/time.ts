import type { DateInput } from "./types";

/** Convert an explicit time input into the canonical UTC representation. */
export function toIsoTimestamp(input: DateInput): string {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid review timestamp: ${String(input)}`);
  }

  return date.toISOString();
}

export function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function addMinutes(input: DateInput, minutes: number): string {
  if (!Number.isFinite(minutes)) {
    throw new RangeError(`Invalid minute interval: ${String(minutes)}`);
  }

  const start = Date.parse(toIsoTimestamp(input));
  return new Date(start + minutes * 60_000).toISOString();
}

export function addDays(input: DateInput, days: number): string {
  if (!Number.isFinite(days)) {
    throw new RangeError(`Invalid day interval: ${String(days)}`);
  }

  const start = Date.parse(toIsoTimestamp(input));
  return new Date(start + days * 86_400_000).toISOString();
}

export function compareTimestamps(left: string, right: string): number {
  return Date.parse(left) - Date.parse(right);
}
