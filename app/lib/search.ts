import { searchText, type WordKind, type WordRecord } from "../data/records";

export type ExploreType = "all" | WordKind;

export type ExploreQuery = {
  q: string;
  type: ExploreType;
};

const kinds: ExploreType[] = ["all", "function", "noun", "verb", "adjective", "adverb", "name", "number", "other"];

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
  const term = query.q.trim().toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return records.filter((record) => {
    const matchesText = !term || searchText(record).includes(term);
    const matchesType = query.type === "all" || record.kind === query.type;
    return matchesText && matchesType;
  });
}
