"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { AppShell } from "./components/AppShell";
import { AsciiWaveBackground } from "./components/AsciiWaveBackground";
import { Footer } from "./components/Footer";
import { TextReveal } from "./components/TextReveal";
import { WordExamples } from "./components/WordExamples";
import { displayWord, records, type WordRecord } from "./data/records";
import { shuffle } from "./lib/random";

function focusElement(element: HTMLElement | null) {
  if (!element) return;
  element.focus();
  element.scrollIntoView({
    block: "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<WordRecord[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { trigger } = useWebHaptics();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);
  const [backH, setBackH] = useState(0);
  const record = deck[position];

  // Measure the back content so the wrapper can expand to exactly it.
  useLayoutEffect(() => {
    setBackH(backRef.current?.offsetHeight ?? 0);
  }, [revealed, record?.rank]);

  // Keep the expand height in sync with content changes (examples
  // disclosures, new cards, resizes).
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
    const timer = window.setTimeout(() => setDeck(shuffle(records)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function reveal() {
    if (!record) return;
    trigger("selection");
    setRevealed(true);
    setAnnouncement("Explanation revealed for " + displayWord(record) + ".");
    // Focus the back without scrolling: the card extends in place and the
    // user's view never shifts.
    window.setTimeout(() => backRef.current?.focus({ preventScroll: true }), 0);
  }

  function nextCard() {
    if (!record) return;
    if (position >= deck.length - 1) {
      setComplete(true);
      setRevealed(false);
      setAnnouncement(
        "You reached all 1,000 cards. Shuffle again to start a new round.",
      );
      window.setTimeout(() => focusElement(completeRef.current), 0);
      return;
    }

    const next = deck[position + 1];
    setPosition((current) => current + 1);
    setRevealed(false);
    setAnnouncement(
      next ? "Next card: " + displayWord(next) + "." : "Next card.",
    );
    window.setTimeout(() => focusElement(wordRef.current), 0);
  }

  function showFront() {
    setRevealed(false);
    setAnnouncement("Front of the card restored.");
    // Retract in place; no scroll jump.
    window.setTimeout(() => wordRef.current?.focus({ preventScroll: true }), 0);
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
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        <section className="hero hero--cards hero--with-flag relative" aria-labelledby="page-title">
          <AsciiWaveBackground opacity={0.58} />
          <div className="hero-top-fade" aria-hidden="true" />
          <div className="hero-bottom-fade" aria-hidden="true" />
          <div className="hero-copy relative">
            <h1 id="page-title">
              <TextReveal
                text="The 1000 words behind everyday German."
                startOnView={false}
              />
            </h1>
            <p className="hero-deck">
              <TextReveal
                text="These 1000 most frequent words cover roughly 80% of daily conversation. Draw one card at a time, learn the word and how it is used, then reload or shuffle for a fresh order."
                startOnView={false}
              />
            </p>
            <div className="hero-actions">
              <Link className="text-button" href="/explore">
                See all 1000
              </Link>
            </div>
          </div>
        </section>

        <section className="card-studio" id="flashcard" aria-label="Flashcards">
          <div className="card-studio__meta">
            <span className="section-count">
              {deck.length
                ? `Card ${String(position + 1).padStart(3, "0")} / ${records.length}`
                : "1000 cards · shuffling"}
            </span>
          </div>

          {!deck.length ? (
            <div className="flashcard flashcard--loading" aria-live="polite">
              <span className="flashcard-loading-mark" aria-hidden="true">
                ✳
              </span>
              <p className="eyebrow">Shuffling the deck</p>
              <p>Finding a word from the full 1,000.</p>
            </div>
          ) : complete ? (
            <div
              className="flashcard flashcard--complete"
              ref={completeRef}
              tabIndex={-1}
              aria-live="polite"
            >
              <span className="flashcard-loading-mark" aria-hidden="true">
                ✳
              </span>
              <p className="eyebrow">Round complete</p>
              <h3>All 1,000 words wandered through.</h3>
              <p>
                You saw every card in this temporary order. Shuffle again
                whenever you want a new path through the same vocabulary.
              </p>
              <button
                className="button button-dark"
                type="button"
                onClick={shuffleAgain}
              >
                Shuffle all 1,000 again <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <article
              className={"flashcard" + (revealed ? " flashcard--revealed" : "")}
              aria-label={displayWord(record)}
            >
              <div className="flashcard-topline">
                <span>#{String(record.rank).padStart(3, "0")}</span>
                <button
                  type="button"
                  className="skip-button"
                  aria-label="Skip card"
                  onClick={nextCard}
                >
                  <svg
                    className="skip-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="flashcard-front">
                <div className="flashcard-wordline">
                  <h3
                    id="flashcard-word"
                    ref={wordRef}
                    tabIndex={0}
                    lang="de"
                    role="button"
                    aria-label={
                      revealed
                        ? "Show the front of " + displayWord(record)
                        : "Reveal the back of " + displayWord(record)
                    }
                    onClick={() => (revealed ? showFront() : reveal())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (revealed) showFront();
                        else reveal();
                      }
                    }}
                  >
                    {displayWord(record)}
                  </h3>
                </div>
                <button
                  className="button button-dark flashcard-reveal"
                  type="button"
                  onClick={() => (revealed ? showFront() : reveal())}
                  aria-controls="flashcard-back"
                  aria-expanded={revealed}
                >
                  Reveal the back <span aria-hidden="true">↓</span>
                </button>
              </div>

              <div
                className="flashcard-back-wrap"
                style={{ height: revealed && backH ? backH : 0 }}
              >
                <div
                  className="flashcard-back"
                  id="flashcard-back"
                  ref={backRef}
                  tabIndex={-1}
                  aria-labelledby="flashcard-back-title"
                >
                  <h3 className="flashcard-gloss" id="flashcard-back-title">
                    {record.gloss}
                  </h3>
                  <p className="flashcard-explanation">{record.explanation}</p>
                  {record.usageNote && (
                    <p className="usage-note">
                      <strong>Usage note:</strong> {record.usageNote}
                    </p>
                  )}
                  <WordExamples record={record} />
                  <div className="flashcard-actions">
                    <button
                      className="button button-dark"
                      type="button"
                      onClick={nextCard}
                    >
                      Next random card
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}
