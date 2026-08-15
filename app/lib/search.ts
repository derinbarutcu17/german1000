import { searchText, type WordKind, type WordRecord } from "../data/records";
import type { ProgressRecords, ReviewStatus } from "./learning/types";

export type ExploreStatus = "all" | ReviewStatus;
export type ExploreType = "all" | WordKind;

export type ExploreQuery = {
  q: string;
  status: ExploreStatus;
  type: ExploreType;
  page: number;
  size: number;
};

export const DEFAULT_PAGE_SIZE = 12;
const pageSizes = [12, 24, 48];
const statuses: ExploreStatus[] = ["all", "new", "learning", "known"];
const kinds: ExploreType[] = ["all", "function", "noun", "verb", "adjective", "adverb", "name", "number", "other"];

export function normalizeExploreQuery(params: URLSearchParams): ExploreQuery {
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const size = Number.parseInt(params.get("size") ?? String(DEFAULT_PAGE_SIZE), 10);
  const status = params.get("status") as ExploreStatus | null;
  const type = params.get("type") as ExploreType | null;
  return {
    q: params.get("q")?.trim() ?? "",
    status: status && statuses.includes(status) ? status : "all",
    type: type && kinds.includes(type) ? type : "all",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    size: pageSizes.includes(size) ? size : DEFAULT_PAGE_SIZE,
  };
}

export function buildExploreParams(query: ExploreQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status !== "all") params.set("status", query.status);
  if (query.type !== "all") params.set("type", query.type);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.size !== DEFAULT_PAGE_SIZE) params.set("size", String(query.size));
  return params;
}

function progressStatus(progress: ProgressRecords | undefined, rank: number): ReviewStatus {
  return progress?.[rank]?.status ?? "new";
}

export function filterRecords(records: readonly WordRecord[], query: ExploreQuery, progress?: ProgressRecords) {
  const term = query.q.toLowerCase();
  return records.filter((record) => {
    const matchesText = !term || searchText(record).includes(term);
    const matchesStatus = query.status === "all" || progressStatus(progress, record.rank) === query.status;
    const matchesType = query.type === "all" || record.kind === query.type;
    return matchesText && matchesStatus && matchesType;
  });
}

export function paginateRecords(records: readonly WordRecord[], pageNumber: number, size = DEFAULT_PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(records.length / size));
  const page = Math.min(Math.max(1, pageNumber), pageCount);
  const startIndex = (page - 1) * size;
  const items = records.slice(startIndex, startIndex + size);
  return {
    items,
    records: items,
    page,
    pageCount,
    totalPages: pageCount,
    total: records.length,
    start: items.length ? startIndex + 1 : 0,
    end: startIndex + items.length,
  };
}
