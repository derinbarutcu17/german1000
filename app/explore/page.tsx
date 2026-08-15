"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { EmptyState } from "../components/EmptyState";
import { Footer } from "../components/Footer";
import { WordCard } from "../components/WordCard";
import { records } from "../data/records";
import {
  buildExploreParams,
  filterRecords,
  normalizeExploreQuery,
  paginateRecords,
  type ExploreQuery,
} from "../lib/search";
import { useLearningStore } from "../lib/learning/useLearningStore";

export default function ExplorePage() {
  const store = useLearningStore();
  const [query, setQuery] = useState<ExploreQuery>(() => normalizeExploreQuery(new URLSearchParams()));

  useEffect(() => {
    const syncFromUrl = () => {
      setQuery(normalizeExploreQuery(new URLSearchParams(window.location.search)));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const filtered = useMemo(() => filterRecords(records, query, store.snapshot.records), [query, store.snapshot.records]);
  const page = useMemo(() => paginateRecords(filtered, query.page, query.size), [filtered, query.page, query.size]);

  function updateQuery(patch: Partial<ExploreQuery>) {
    const next: ExploreQuery = {
      ...query,
      ...patch,
      page: patch.q !== undefined || patch.status !== undefined || patch.type !== undefined ? 1 : query.page,
    };
    const params = buildExploreParams(next);
    const currentPath = window.location.pathname;
    const nextUrl = params.toString() ? currentPath + "?" + params.toString() : currentPath;
    window.history.replaceState(null, "", nextUrl);
    setQuery(next);
  }

  return (
    <AppShell knownCount={store.knownCount}>
      <main id="main-content" className="page-stack">
        <section className="section-heading explore-heading" aria-labelledby="explore-title">
          <div>
            <p className="eyebrow">The index</p>
            <h1 id="explore-title">Explore the 1,000</h1>
            <p className="lede">Search the complete frequency list, inspect each word in context, and review anything you want to revisit.</p>
          </div>
          <div className="section-heading__meta" aria-label="Explore summary">
            <span className="meta-number">{filtered.length}</span>
            <span className="meta-label">matching words</span>
          </div>
        </section>

        <section className="filter-panel" aria-labelledby="filters-title">
          <div className="filter-panel__topline">
            <div>
              <h2 id="filters-title">Find a word</h2>
              <p>Use the search and filters together. Your position is preserved as you move around.</p>
            </div>
            <Link className="text-link" href="/explore">Clear filters</Link>
          </div>
          <div className="filter-grid">
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
              <span>Progress</span>
              <select value={query.status} onChange={(event) => updateQuery({ status: event.target.value as ExploreQuery["status"] })}>
                <option value="all">All words</option>
                <option value="new">Not started</option>
                <option value="learning">Learning</option>
                <option value="known">Known</option>
              </select>
            </label>
            <label className="field">
              <span>Word type</span>
              <select value={query.type} onChange={(event) => updateQuery({ type: event.target.value as ExploreQuery["type"] })}>
                <option value="all">All types</option>
                <option value="article">Articles</option>
                <option value="conjunction">Conjunctions</option>
                <option value="adverb">Adverbs</option>
                <option value="verb">Verbs</option>
                <option value="pronoun">Pronouns</option>
                <option value="preposition">Prepositions</option>
                <option value="adjective">Adjectives</option>
                <option value="noun">Nouns</option>
              </select>
            </label>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {filtered.length} words match the current filters.
          </p>
        </section>

        {page.items.length > 0 ? (
          <section className="explore-results" aria-labelledby="results-title">
            <div className="results-toolbar">
              <h2 id="results-title">Words {page.start}-{page.end}</h2>
              <span>Page {page.page} of {page.pageCount}</span>
            </div>
            <div className="word-grid">
              {page.items.map((record) => (
                <WordCard
                  key={record.rank}
                  record={record}
                  progress={store.statusForRank(record.rank)}
                  onReview={store.markRank}
                />
              ))}
            </div>
            <nav className="pagination" aria-label="Explore pagination">
              <button
                type="button"
                className="button button--secondary"
                disabled={page.page <= 1}
                onClick={() => updateQuery({ page: page.page - 1 })}
              >
                Previous
              </button>
              <span aria-live="polite">Page {page.page} / {page.pageCount}</span>
              <button
                type="button"
                className="button button--secondary"
                disabled={page.page >= page.pageCount}
                onClick={() => updateQuery({ page: page.page + 1 })}
              >
                Next
              </button>
            </nav>
          </section>
        ) : (
          <EmptyState
            title="Nothing matches those filters"
            body="Try a broader search, switch the progress filter back to all words, or clear the filters to return to the index."
            action={<Link className="button button--primary" href="/explore">Show all words</Link>}
          />
        )}
      </main>
      <Footer onReset={store.resetProgress} />
    </AppShell>
  );
}
