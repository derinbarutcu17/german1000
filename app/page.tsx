"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Footer } from "./components/Footer";
import { WordExamples } from "./components/WordExamples";
import { displayWord, records, type WordRecord } from "./data/records";
import { shuffle } from "./lib/random";

function focusElement(element: HTMLElement | null) {
  if (!element) return;
  element.focus();
  element.scrollIntoView({
    block: "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<WordRecord[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const wordRef = useRef<HTMLHeadingElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);
  const record = deck[position];

  useEffect(() => {
    const timer = window.setTimeout(() => setDeck(shuffle(records)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function reveal() {
    if (!record) return;
    setRevealed(true);
    setAnnouncement("Explanation revealed for " + displayWord(record) + ".");
    window.setTimeout(() => focusElement(backRef.current), 0);
  }

  function nextCard() {
    if (!record) return;
    if (position >= deck.length - 1) {
      setComplete(true);
      setRevealed(false);
      setAnnouncement("You reached all 1,000 cards. Shuffle again to start a new round.");
      window.setTimeout(() => focusElement(completeRef.current), 0);
      return;
    }

    const next = deck[position + 1];
    setPosition((current) => current + 1);
    setRevealed(false);
    setAnnouncement(next ? "Next card: " + displayWord(next) + "." : "Next card.");
    window.setTimeout(() => focusElement(wordRef.current), 0);
  }

  function showFront() {
    setRevealed(false);
    setAnnouncement("Front of the card restored.");
    window.setTimeout(() => focusElement(wordRef.current), 0);
  }

  function shuffleAgain() {
    setDeck(shuffle(records));
    setPosition(0);
    setRevealed(false);
    setComplete(false);
    setAnnouncement("A new order of all 1,000 cards is ready.");
    window.setTimeout(() => focusElement(wordRef.current), 0);
  }

  return (
    <AppShell>
      <main id="main-content">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <section className="hero hero--cards" aria-labelledby="page-title">
          <div className="hero-copy">
            <h1 id="page-title">Open a card. Let the next word surprise you.</h1>
            <p className="hero-deck">A whimsical, context-rich deck for wandering through the most frequent German forms. Reload the page or shuffle whenever you want a fresh order.</p>
            <div className="hero-actions">
              <Link className="text-button" href="/explore">See all 1,000 <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>

        <section className="card-studio" id="flashcard" aria-labelledby="flashcard-title">
          <div className="section-heading">
            <div>
              <h2 id="flashcard-title">A new card is waiting.</h2>
            </div>
            <span className="section-count">{deck.length ? `Card ${String(position + 1).padStart(3, "0")} / ${records.length.toLocaleString()}` : "1,000 cards · shuffling"}</span>
          </div>

          {!deck.length ? (
            <div className="flashcard flashcard--loading" aria-live="polite">
              <span className="flashcard-loading-mark" aria-hidden="true">✳</span>
              <p className="eyebrow">SHUFFLING THE DECK</p>
              <p>Finding a word from the full 1,000.</p>
            </div>
          ) : complete ? (
            <div className="flashcard flashcard--complete" ref={completeRef} tabIndex={-1} aria-live="polite">
              <span className="flashcard-loading-mark" aria-hidden="true">✳</span>
              <p className="eyebrow">ROUND COMPLETE</p>
              <h3>All 1,000 words wandered through.</h3>
              <p>You saw every card in this temporary order. Shuffle again whenever you want a new path through the same vocabulary.</p>
              <button className="button button-dark" type="button" onClick={shuffleAgain}>Shuffle all 1,000 again <span aria-hidden="true">↗</span></button>
            </div>
          ) : (
            <article className={"flashcard" + (revealed ? " flashcard--revealed" : "")} aria-label={displayWord(record)}>
              <div className="flashcard-topline">
                <span>#{String(record.rank).padStart(3, "0")}</span>
              </div>

              {!revealed ? (
                <div className="flashcard-front">
                  <p className="eyebrow">GERMAN FORM</p>
                  <div className="flashcard-wordline">
                    <h3 id="flashcard-word" ref={wordRef} tabIndex={-1} lang="de">{displayWord(record)}</h3>
                  </div>
                  <button className="button button-dark flashcard-reveal" type="button" onClick={reveal} aria-controls="flashcard-back" aria-expanded={revealed}>
                    Reveal the back <span aria-hidden="true">↓</span>
                  </button>
                </div>
              ) : (
                <div className="flashcard-back" id="flashcard-back" ref={backRef} tabIndex={-1}>
                  <p className="eyebrow">MEANING &amp; CONTEXT</p>
                  <h3 className="flashcard-gloss">{record.gloss}</h3>
                  <p className="flashcard-explanation">{record.explanation}</p>
                  {record.usageNote && <p className="usage-note"><strong>Usage note:</strong> {record.usageNote}</p>}
                  <WordExamples record={record} />
                  <div className="flashcard-actions">
                    <button className="button button--secondary" type="button" onClick={showFront}>Show the front</button>
                    <button className="button button-dark" type="button" onClick={nextCard}>Next random card <span aria-hidden="true">↗</span></button>
                  </div>
                </div>
              )}
            </article>
          )}

        </section>
      </main>
      <Footer />
    </AppShell>
  );
}
