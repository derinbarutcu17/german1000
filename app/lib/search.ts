import { displayWord, searchText, type WordKind, type WordRecord } from "../data/records";

export type ExploreType = "all" | WordKind;

export type ExploreQuery = {
  q: string;
  type: ExploreType;
};

const kinds: ExploreType[] = ["all", "function", "noun", "verb", "adjective", "adverb", "name", "number", "other"];
const searchIndex = new WeakMap<WordRecord, string>();

export type SearchMatchKind = "exact" | "word" | "meaning" | "explanation" | "example";

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function indexedSearchText(record: WordRecord) {
  const cached = searchIndex.get(record);
  if (cached) return cached;
  const text = searchText(record);
  searchIndex.set(record, text);
  return text;
}

function scoreRecord(record: WordRecord, term: string) {
  if (!term) return { score: record.rank, matchKind: null as SearchMatchKind | null };

  const word = normalizeSearchValue(record.word);
  const display = normalizeSearchValue(displayWord(record));
  const lemma = normalizeSearchValue(record.lemma ?? "");
  const gloss = normalizeSearchValue(record.gloss);
  const explanation = normalizeSearchValue(record.explanation);
  const examples = record.examples.map((example) => normalizeSearchValue(`${example.de} ${example.en}`));

  if (word === term || display === term || lemma === term) return { score: 0, matchKind: "exact" as const };
  if (word.startsWith(term) || display.startsWith(term) || lemma.startsWith(term)) return { score: 10, matchKind: "word" as const };
  if (word.includes(term) || display.includes(term) || lemma.includes(term)) return { score: 20, matchKind: "word" as const };
  if (gloss === term || gloss.startsWith(term)) return { score: 30, matchKind: "meaning" as const };
  if (gloss.includes(term)) return { score: 40, matchKind: "meaning" as const };
  if (explanation.includes(term)) return { score: 50, matchKind: "explanation" as const };
  if (examples.some((example) => example.includes(term))) return { score: 60, matchKind: "example" as const };
  if (indexedSearchText(record).includes(term)) return { score: 70, matchKind: "example" as const };
  return null;
}

export function getSearchMatchKind(record: WordRecord, query: string): SearchMatchKind | null {
  return scoreRecord(record, normalizeSearchValue(query))?.matchKind ?? null;
}

export function normalizeExploreQuery(params: URLSearchParams): ExploreQuery {
  const type = params.get("type") as ExploreType | null;
  return {
    q: params.get("q")?.trim() ?? "",
    type: type && kinds.includes(type) ? type : "all",
  };
}

export function buildExploreParams(query: ExploreQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.type !== "all") params.set("type", query.type);
  return params;
}

export function filterRecords(records: readonly WordRecord[], query: ExploreQuery) {
  const term = normalizeSearchValue(query.q);
  return records
    .map((record) => ({ record, match: scoreRecord(record, term) }))
    .filter(({ record, match }) => {
    const matchesText = !term || Boolean(match);
    const matchesType =
      query.type === "all" ||
      record.kind === query.type;
    return matchesText && matchesType;
  })
    .sort((a, b) => {
      if (!term) return a.record.rank - b.record.rank;
      return (a.match?.score ?? Number.POSITIVE_INFINITY) - (b.match?.score ?? Number.POSITIVE_INFINITY) || a.record.rank - b.record.rank;
    })
    .map(({ record }) => record);
}
