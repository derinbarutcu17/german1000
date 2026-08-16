"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { EmptyState } from "../components/EmptyState";
import { Footer } from "../components/Footer";
import { WordCard } from "../components/WordCard";
import { records } from "../data/records";
import { buildExploreParams, filterRecords, normalizeExploreQuery, type ExploreQuery } from "../lib/search";

export default function ExplorePage() {
  const [query, setQuery] = useState<ExploreQuery>(() => normalizeExploreQuery(new URLSearchParams()));
  const filtered = useMemo(() => filterRecords(records, query), [query]);

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
        <section className="section-heading explore-heading" aria-labelledby="explore-title">
          <h1 id="explore-title">Explore all 1,000.</h1>
        </section>

        <section className="filter-panel filter-panel--simple" aria-label="Search the word list">
          <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="field field--search">
              <span>Search all 1,000 words</span>
              <span className="search-input-wrap">
              <input
                type="search"
                value={query.q}
                onChange={(event) => updateQuery({ q: event.target.value })}
                placeholder="Search a German word, meaning, or sentence"
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
          <p className="sr-only" role="status" aria-live="polite">
            {filtered.length.toLocaleString()} words match the current filters.
          </p>
        </section>

        {filtered.length > 0 ? (
          <section className="explore-results" aria-labelledby="results-title">
            <div className="results-toolbar">
              <h2 id="results-title">The word list</h2>
              <span>{filtered.length.toLocaleString()} {filtered.length === 1 ? "word" : "words"} · one page</span>
            </div>
            <div className="word-index">
              {filtered.map((record) => <WordCard key={record.rank} record={record} />)}
            </div>
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
      <Footer />
    </AppShell>
  );
}
