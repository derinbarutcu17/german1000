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
    const next: ExploreQuery = { ...query, ...patch };
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
          <div>
            <p className="eyebrow">The full index</p>
            <h1 id="explore-title">Explore all 1,000.</h1>
            <p className="lede">One long, searchable page for the complete frequency list. Scroll, open a word, and follow whatever catches your eye.</p>
          </div>
          <div className="section-heading__meta" aria-label="Explore summary">
            <span className="meta-number">{filtered.length.toLocaleString()}</span>
            <span className="meta-label">words in view</span>
          </div>
        </section>

        <section className="filter-panel" aria-labelledby="filters-title">
          <div className="filter-panel__topline">
            <div>
              <h2 id="filters-title">Find a word</h2>
              <p>Search and filter this page for the moment. Nothing is saved.</p>
            </div>
            <Link className="text-link" href="/explore">Show all 1,000</Link>
          </div>
          <div className="filter-grid filter-grid--explore">
            <label className="field field--search">
              <span>Search</span>
              <input
                type="search"
                value={query.q}
                onChange={(event) => updateQuery({ q: event.target.value })}
                placeholder="Try gehen, the, or 42"
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span>Word type</span>
              <select value={query.type} onChange={(event) => updateQuery({ type: event.target.value as ExploreQuery["type"] })}>
                <option value="all">All types</option>
                <option value="function">Function words</option>
                <option value="noun">Nouns</option>
                <option value="verb">Verbs</option>
                <option value="adjective">Adjectives</option>
                <option value="adverb">Adverbs</option>
                <option value="name">Names</option>
                <option value="number">Numbers</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {filtered.length.toLocaleString()} words match the current filters.
          </p>
        </section>

        {filtered.length > 0 ? (
          <section className="explore-results" aria-labelledby="results-title">
            <div className="results-toolbar">
              <h2 id="results-title">The scrollable word list</h2>
              <span>{filtered.length.toLocaleString()} {filtered.length === 1 ? "word" : "words"} · one page</span>
            </div>
            <div className="word-index">
              {filtered.map((record) => <WordCard key={record.rank} record={record} />)}
            </div>
          </section>
        ) : (
          <EmptyState
            eyebrow="No match"
            title="Nothing matches those filters."
            body="Try a broader search or return to the complete 1,000-word list."
            action={<Link className="button button-dark" href="/explore">Show all 1,000</Link>}
          />
        )}
      </main>
      <Footer />
    </AppShell>
  );
}
