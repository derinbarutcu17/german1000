"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { AppShell } from "./components/AppShell";
import { AsciiWaveBackground } from "./components/AsciiWaveBackground";
import { TextReveal } from "./components/TextReveal";
import { WordExamples } from "./components/WordExamples";
import { records as staticRecords } from "./data/records";
import type { WordRecord } from "./data/records";
import { shuffle } from "./lib/random";
import { displayWord } from "./lib/word-utils";

const INITIAL_CARD: WordRecord = staticRecords[0];

function focusElement(element: HTMLElement | null) {
  if (!element) return;
  // Focus without the browser's instant jump, then only nudge the page if
  // the target is actually outside the viewport. block:"nearest" moves the
  // minimal distance instead of yanking to center on every reveal.
  element.focus({ preventScroll: true });
  const rect = element.getBoundingClientRect();
  const topEdge = 112;
  const bottomEdge = window.innerHeight - 24;
  if (rect.top >= topEdge && rect.bottom <= bottomEdge) return;
  element.scrollIntoView({
    block: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<WordRecord[]>(() => [INITIAL_CARD]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { trigger } = useWebHaptics();
  const wordRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);
  const [backH, setBackH] = useState(0);
  const record = deck[position] ?? INITIAL_CARD;

  useLayoutEffect(() => {
    setBackH(backRef.current?.offsetHeight ?? 0);
  }, [revealed, record?.rank]);

  useEffect(() => {
    function measure() {
      setBackH(backRef.current?.offsetHeight ?? 0);
    }
    const observer = new ResizeObserver(measure);
    if (backRef.current) observer.observe(backRef.current);
    measure();
    return () => observer.disconnect();
  }, [revealed, record?.rank]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDeck(shuffle(staticRecords));
      setPosition(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function reveal() {
    if (!record) return;
    trigger("selection");
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
    window.setTimeout(() => wordRef.current?.focus({ preventScroll: true }), 0);
  }

  function shuffleAgain() {
    setDeck(shuffle(staticRecords));
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
        <section className="hero hero--cards hero--with-flag relative" aria-labelledby="page-title">
          <AsciiWaveBackground opacity={0.42} bleed={12} />
          <div className="hero-top-fade" aria-hidden="true" />
          <div className="hero-bottom-fade" aria-hidden="true" />
          <div className="hero-copy relative">
            <h1 id="page-title">
              <TextReveal text="The 1000 words behind everyday German." startOnView={false} />
            </h1>
            <p className="hero-deck">
              <TextReveal text="These cards make up roughly 80% of daily German. Explore the cards and learn it through exercises." startOnView={false} />
            </p>
          </div>
        </section>

        <section className="card-studio" id="flashcard" aria-label="Flashcards">
          {complete ? (
            <div className="flashcard flashcard--complete" ref={completeRef} tabIndex={-1} aria-live="polite">
              <span className="flashcard-loading-mark" aria-hidden="true">✳</span>
              <p className="eyebrow">Round complete</p>
              <h3>All 1,000 words wandered through.</h3>
              <p>You saw every card in this temporary order. Shuffle again whenever you want a new path through the same vocabulary.</p>
              <button className="button button-dark" type="button" onClick={shuffleAgain}>Shuffle all 1,000 again <span aria-hidden="true">↗</span></button>
            </div>
          ) : (
            <article className={"flashcard" + (revealed ? " flashcard--revealed" : "")} aria-label={displayWord(record)}>
              <div className="flashcard-topline">
                <span>
                  {deck.length === staticRecords.length ? `Card ${position + 1} / ${deck.length.toLocaleString()} · ` : ""}
                  Frequency #{String(record.rank).padStart(3, "0")}
                </span>
                <button type="button" className="skip-button" aria-label="Skip card" onClick={nextCard}>
                  <span className="skip-button__label">Skip</span>
                  <svg className="skip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="flashcard-front">
                <button
                  type="button"
                  className="flashcard-word"
                  ref={wordRef}
                  onClick={() => (revealed ? showFront() : reveal())}
                  aria-expanded={revealed}
                  aria-controls="flashcard-back"
                  aria-label={revealed ? displayWord(record) + ", hide meaning" : displayWord(record) + ", tap to reveal meaning"}
                >
                  <span className="flashcard-word__text" lang="de">
                    <TextReveal
                      key={record.rank}
                      text={displayWord(record)}
                      by="character"
                      startOnView={false}
                      stagger={0.018}
                      maxDuration={0.5}
                      delay={0.45}
                    />
                  </span>
                  {!revealed && (
                    <span className="flashcard-word__hint" aria-hidden="true">Tap to reveal ↓</span>
                  )}
                </button>
              </div>

              <div className="flashcard-back-wrap" style={{ height: revealed && backH ? backH : 0 }} aria-hidden={!revealed}>
                <div className="flashcard-back" id="flashcard-back" ref={backRef} tabIndex={-1} aria-labelledby="flashcard-back-title" hidden={!revealed}>
                  <h3 className="flashcard-gloss" id="flashcard-back-title">{record.gloss}</h3>
                  <p className="flashcard-explanation">{record.explanation}</p>
                  {record.usageNote && <p className="usage-note"><strong>Usage note:</strong> {record.usageNote}</p>}
                  <WordExamples record={record} />
                  <div className="flashcard-actions">
                    <button type="button" className="skip-button" aria-label="Skip to next card" onClick={nextCard}>
                      <span className="skip-button__label">Skip</span>
                      <svg className="skip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}
        </section>
      </main>
    </AppShell>
  );
}
