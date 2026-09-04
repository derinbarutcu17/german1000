"use client";

import { useEffect, useRef, useState } from "react";
import type { WordRecord } from "../data/records";
import { getSearchMatchKind, type SearchMatchKind } from "../lib/search";
import { displayWord } from "../lib/word-utils";
import { WordExamples } from "./WordExamples";

const matchLabels: Record<SearchMatchKind, string> = {
  exact: "Exact word",
  word: "Word match",
  meaning: "Meaning match",
  explanation: "Explanation match",
  example: "Example match",
};

export function WordCard({ record, query = "" }: { record: WordRecord; query?: string }) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);
  const matchKind = query ? getSearchMatchKind(record, query) : null;

  useEffect(() => {
    if (!examplesOpen || !contentRef.current) return;

    function measure() {
      setContentH(contentRef.current?.offsetHeight ?? 0);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(contentRef.current);
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [examplesOpen, record.rank]);

  return (
    <article className="word-card word-card--index" id={"word-" + String(record.rank).padStart(3, "0")}>
      <div className="word-heading-row">
        <div>
          <p className="word-rank">#{String(record.rank).padStart(3, "0")}</p>
          <h3 lang="de">{displayWord(record)}</h3>
          {record.lemma && record.lemma !== record.word && <p className="surface-note">form: {record.word} · base: {record.lemma}</p>}
          {matchKind && <p className="search-match-note">{matchLabels[matchKind]}</p>}
        </div>
      </div>
      <p className="word-gloss">{record.gloss}</p>
      <p className="word-explanation">{record.explanation}</p>
      {record.usageNote && <p className="usage-note"><strong>Usage note:</strong> {record.usageNote}</p>}
      <div className={"word-details" + (examplesOpen ? " word-details--open" : "")}>
        <button
          type="button"
          className="word-details__trigger"
          aria-expanded={examplesOpen}
          aria-controls={"word-details-" + String(record.rank).padStart(3, "0")}
          onClick={() => setExamplesOpen((v) => !v)}
        >
          {examplesOpen ? "Hide" : "Show"} examples for {displayWord(record)} <span aria-hidden="true">{examplesOpen ? "↑" : "↓"}</span>
        </button>
        <div
          className="word-details__wrap"
          id={"word-details-" + String(record.rank).padStart(3, "0")}
          style={{ height: examplesOpen && contentH ? contentH : 0 }}
          aria-hidden={!examplesOpen}
        >
          {examplesOpen && (
            <div ref={contentRef} className="word-details__content">
              <WordExamples record={record} compact />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
