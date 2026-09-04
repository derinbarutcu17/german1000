"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { EmptyState } from "../components/EmptyState";
import { WordCard } from "../components/WordCard";
import { records } from "../data/records";
import { buildExploreParams, filterRecords, normalizeExploreQuery, type ExploreQuery } from "../lib/search";

const RESULTS_PAGE_SIZE = 48;
const TYPE_FILTERS: Array<{ value: ExploreQuery["type"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "function", label: "Function" },
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "name", label: "Name" },
  { value: "number", label: "Number" },
  { value: "other", label: "Other" },
];

export default function ExplorePage() {
  const [query, setQuery] = useState<ExploreQuery>(() => normalizeExploreQuery(new URLSearchParams()));
  const [visibleState, setVisibleState] = useState({ key: "", count: RESULTS_PAGE_SIZE });
  const filtered = useMemo(() => filterRecords(records, query), [query]);
  const queryKey = query.q + "\u0000" + query.type;
  const visibleCount = visibleState.key === queryKey ? visibleState.count : RESULTS_PAGE_SIZE;
  const visibleRecords = filtered.slice(0, visibleCount);

  useEffect(() => {
    const syncFromUrl = () => {
      setQuery(normalizeExploreQuery(new URLSearchParams(window.location.search)));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function updateQuery(patch: Partial<ExploreQuery>) {
    const next: ExploreQuery = { ...query, ...patch, q: patch.q === undefined ? query.q : patch.q.trim() };
    const params = buildExploreParams(next);
    const currentPath = window.location.pathname;
    const nextUrl = params.toString() ? currentPath + "?" + params.toString() : currentPath;
    window.history.replaceState(null, "", nextUrl);
    setQuery(next);
  }

  return (
    <AppShell>
      <main id="main-content" className="page-stack explore-page">
        <section className="explore-intro" aria-labelledby="explore-title">
          <div>
            <h1 id="explore-title">All 1,000 words, in one place.</h1>
          </div>
        </section>

        <section className="explore-search" aria-label="Search the word list">
          <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="field field--search" htmlFor="word-search">
              <span className="field-label">Search words</span>
              <span className="search-input-wrap">
                <input
                  id="word-search"
                  name="q"
                  type="search"
                  value={query.q}
                  onChange={(event) => updateQuery({ q: event.target.value })}
                  placeholder="Search by word, meaning, or example"
                  autoComplete="off"
                />
                {query.q && (
                  <button className="search-clear" type="button" onClick={() => updateQuery({ q: "" })} aria-label="Clear search">
                    ×
                  </button>
                )}
              </span>
            </label>
          </form>
          <p className="explore-search__count" role="status" aria-live="polite">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? "word" : "words"}
          </p>
        </section>

        <div className="explore-filters" role="group" aria-label="Filter by word type">
          {TYPE_FILTERS.map((filter) => {
            const active = query.type === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                className={active ? "filter-chip filter-chip--active" : "filter-chip"}
                aria-pressed={active}
                onClick={() => updateQuery({ type: filter.value })}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {filtered.length > 0 ? (
          <section className="explore-results" aria-label="Words">
            <div className="explore-results-meta" aria-label={query.q ? "Results sorted by relevance" : "Words sorted by frequency"}>
              <span>{query.q ? "Relevance" : "Frequency order"}</span>
            </div>
            <div className="word-index">
              {visibleRecords.map((record) => <WordCard key={record.rank} record={record} query={query.q} />)}
            </div>
            {visibleRecords.length < filtered.length && (
              <div className="results-more">
                <p>
                  Showing {visibleRecords.length.toLocaleString()} of {filtered.length.toLocaleString()} words.
                </p>
                <button
                  type="button"
                  className="button button-subtle"
                  onClick={() => setVisibleState({
                    key: queryKey,
                    count: Math.min(visibleCount + RESULTS_PAGE_SIZE, filtered.length),
                  })}
                >
                  Load more words <span aria-hidden="true">↓</span>
                </button>
              </div>
            )}
          </section>
        ) : (
          <EmptyState
            eyebrow="No match"
            title="Nothing matches that search."
            body="Try another word or clear the search to see the complete list."
            action={<Link className="button button-dark" href="/explore">Clear search</Link>}
          />
        )}
      </main>
    </AppShell>
  );
}
