import type { WordRecord } from "../data/records";
import { displayWord, firstMeaning } from "./word-utils";
import { cryptoRandom, shuffle, type RandomSource } from "./random";

export type ExerciseOption = {
  value: string;
  label: string;
  correct: boolean;
};

export type ExerciseItem = {
  record: WordRecord;
  prompt: string;
  instruction: string;
  answer: string;
  options: ExerciseOption[];
};

function meaningOptions(base: WordRecord, pool: readonly WordRecord[], random: RandomSource): ExerciseOption[] {
  const answer = firstMeaning(base.gloss);
  const labels = new Set([answer]);
  const candidates = pool.filter((record) => {
    if (record.rank === base.rank) return false;
    const label = firstMeaning(record.gloss);
    if (labels.has(label)) return false;
    labels.add(label);
    return true;
  });
  const remaining = [...candidates];
  const distractors: WordRecord[] = [];
  while (distractors.length < 3 && remaining.length > 0) {
    const value = Math.max(0, Math.min(0.9999999999, random()));
    const index = Math.floor(value * remaining.length);
    const [candidate] = remaining.splice(index, 1);
    if (candidate) distractors.push(candidate);
  }

  return shuffle(
    [base, ...distractors].map((record) => ({
      value: String(record.rank),
      label: firstMeaning(record.gloss),
      correct: record.rank === base.rank,
    })),
    random,
  );
}

export function buildExerciseBank(records: readonly WordRecord[], limit = records.length, random: RandomSource = cryptoRandom): ExerciseItem[] {
  const pool = [...records];
  const selected = shuffle(pool, random).slice(0, Math.min(Math.max(0, limit), pool.length));

  return selected.map((record) => ({
    record,
    prompt: displayWord(record),
    instruction: "Choose the closest meaning.",
    answer: firstMeaning(record.gloss),
    options: meaningOptions(record, pool, random),
  }));
}
