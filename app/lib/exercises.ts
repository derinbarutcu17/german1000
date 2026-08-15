import { displayWord, firstMeaning, isExerciseEligible, type WordRecord } from "../data/records";

export type ExerciseMode = "meaning" | "word" | "article";

export type ExerciseOption = {
  value: string;
  label: string;
  correct: boolean;
};

export type ExerciseItem = {
  mode: ExerciseMode;
  record: WordRecord;
  promptLabel: string;
  prompt: string;
  instruction: string;
  answer: string;
  options: ExerciseOption[];
  audio?: string;
};

function deterministicScore(rank: number) {
  return (rank * 17) % 97;
}

function meaningOptions(base: WordRecord, pool: readonly WordRecord[]): ExerciseOption[] {
  const candidates = pool
    .filter((record) => record.rank !== base.rank && firstMeaning(record.gloss) !== firstMeaning(base.gloss))
    .sort((left, right) => Math.abs(left.rank - base.rank) - Math.abs(right.rank - base.rank) || deterministicScore(left.rank) - deterministicScore(right.rank))
    .slice(0, 3);
  return [base, ...candidates]
    .sort((left, right) => deterministicScore(left.rank) - deterministicScore(right.rank))
    .map((record) => ({ value: String(record.rank), label: firstMeaning(record.gloss), correct: record.rank === base.rank }));
}

function wordOptions(base: WordRecord, pool: readonly WordRecord[]): ExerciseOption[] {
  const candidates = pool
    .filter((record) => record.rank !== base.rank && displayWord(record) !== displayWord(base))
    .sort((left, right) => Math.abs(left.rank - base.rank) - Math.abs(right.rank - base.rank) || deterministicScore(left.rank) - deterministicScore(right.rank))
    .slice(0, 3);
  return [base, ...candidates]
    .sort((left, right) => deterministicScore(left.rank) - deterministicScore(right.rank))
    .map((record) => ({ value: String(record.rank), label: displayWord(record), correct: record.rank === base.rank }));
}

function articleOptions(base: WordRecord): ExerciseOption[] {
  return ["der", "die", "das"].map((article) => ({ value: article, label: article, correct: article === base.article }));
}

export function buildExerciseBank(records: readonly WordRecord[], mode: ExerciseMode, limit = 12): ExerciseItem[] {
  const pool = records.filter(isExerciseEligible);
  const candidates = mode === "article" ? records.filter((record) => record.kind === "noun" && record.article) : pool;
  const bank: ExerciseItem[] = [];

  for (const record of candidates) {
    let options: ExerciseOption[];
    let prompt: string;
    let promptLabel: string;
    let instruction: string;
    let answer: string;

    if (mode === "meaning") {
      options = meaningOptions(record, pool);
      prompt = displayWord(record);
      promptLabel = "German word";
      instruction = "Choose the closest meaning.";
      answer = firstMeaning(record.gloss);
    } else if (mode === "word") {
      options = wordOptions(record, pool);
      prompt = firstMeaning(record.gloss);
      promptLabel = "English cue";
      instruction = "Choose the German word.";
      answer = displayWord(record);
    } else {
      options = articleOptions(record);
      prompt = record.lemma ?? record.word;
      promptLabel = "Noun article";
      instruction = "Choose the correct article.";
      answer = record.article ?? "";
    }

    if ((mode === "article" ? options.length !== 3 : options.length !== 4) || !answer) continue;
    bank.push({ mode, record, promptLabel, prompt, instruction, answer, options, audio: mode === "word" ? undefined : displayWord(record) });
    if (bank.length >= limit) break;
  }

  return bank;
}
