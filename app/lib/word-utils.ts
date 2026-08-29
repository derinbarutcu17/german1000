import type { WordRecord } from "../data/records";

export function displayWord(record: WordRecord) {
  if (record.kind === "noun" && record.article) {
    const nounForm = record.nounNumber === "plural" ? record.word : record.lemma ?? record.word;
    return record.article + " " + nounForm;
  }
  return record.word;
}

export function firstMeaning(gloss: string) {
  return gloss.split(/[;,/]/)[0].trim();
}
