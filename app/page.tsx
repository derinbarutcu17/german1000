"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AudioButton } from "./components/AudioButton";
import { EmptyState } from "./components/EmptyState";
import { Footer } from "./components/Footer";
import { ProgressBar } from "./components/ProgressBar";
import { ReviewActions } from "./components/ReviewActions";
import { WordExamples } from "./components/WordExamples";
import { displayWord, records } from "./data/records";
import { useLearningStore } from "./lib/learning/useLearningStore";

export default function TodayPage() {
  const store = useLearningStore();
  const [announcement, setAnnouncement] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  function reveal() {
    if (!store.currentRecord) return;
    store.reveal();
    setAnnouncement("Meaning revealed for " + displayWord(store.currentRecord) + ".");
    window.setTimeout(() => revealRef.current?.focus(), 0);
  }

  function review(outcome: "again" | "known") {
    if (!store.currentRecord || reviewing) return;
    const current = store.currentRecord;
    const nextRank = store.session.ids[store.session.position + 1];
    setReviewing(true);
    store.review(current.rank, outcome);
    setAnnouncement(nextRank ? "Saved " + displayWord(current) + ". Next rank " + String(nextRank).padStart(3, "0") + "." : "Today’s set complete.");
    window.setTimeout(() => {
      setReviewing(false);
      if (nextRank) wordRef.current?.focus();
    }, 140);
  }

  const completed = store.sessionProgress.completed;
  const total = store.sessionProgress.total;
  const currentCount = store.session.phase === "complete" ? total : Math.min(completed + 1, total);

  return (
    <AppShell knownCount={store.knownCount} total={records.length}>
      <main id="main-content">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">FREQUENCY-FIRST GERMAN</p>
            <h1 id="page-title">The first 1,000 words, turned into practice.</h1>
            <p className="hero-deck">A quiet vocabulary studio for learning high-frequency German through active recall, context, and return visits.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#today-practice">Start today’s set <span aria-hidden="true">→</span></a>
              <Link className="text-button" href="/method">Why frequency? <span aria-hidden="true">↗</span></Link>
              <span className="audio-note"><span className="audio-dot" aria-hidden="true" />German audio is optional</span>
            </div>
          </div>
          <aside className="hero-note" aria-label="About this list">
            <span className="hero-note-number">63.2%</span>
            <span className="hero-note-label">of corpus tokens covered by the first 1,000 forms in the source list</span>
          </aside>
        </section>

        <section className="stat-row" aria-label="Vocabulary progress">
          <div><span className="stat-label">WORDS</span><strong className="stat-value">1,000</strong><span className="stat-note">frequency-ranked forms</span></div>
          <div><span className="stat-label">TODAY</span><strong className="stat-value">{total || 0}</strong><span className="stat-note">cards in this session</span></div>
          <div><span className="stat-label">KNOWN</span><strong className="stat-value">{store.knownCount}</strong><span className="stat-note">marked for longer gaps</span></div>
          <div><span className="stat-label">LEARNING</span><strong className="stat-value">{store.learningCount}</strong><span className="stat-note">scheduled to return soon</span></div>
        </section>

        <section className="content-section practice-section" id="today-practice" aria-labelledby="practice-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TODAY’S SET · {total} WORDS</p>
              <h2 id="practice-heading">Recall before recognition.</h2>
            </div>
            <span className="section-count">{store.session.phase === "complete" ? total + " / " + total : currentCount + " / " + total}</span>
          </div>

          {!store.hydrated ? (
            <div className="practice-loading" aria-live="polite"><span className="loading-line loading-line-wide" /><span className="loading-line" /><span className="loading-button" /></div>
          ) : store.session.phase === "complete" || !store.currentRecord ? (
            <EmptyState eyebrow="SESSION COMPLETE" title="Today’s set is complete.">
              You have reached the end of this session. Start another set when a word is due, or use Explore and Exercises to keep going.
              <span className="empty-links"><button className="button button-dark" type="button" onClick={store.restartSession}>Start another set</button><Link className="button button-dark" href="/explore">Explore the list</Link><Link className="button button-subtle" href="/exercises">Practice retrieval</Link></span>
            </EmptyState>
          ) : (
            <div className="practice-layout">
              <div className="practice-card">
                <div className="practice-card-top"><span>RANK #{String(store.currentRecord.rank).padStart(3, "0")}</span><span>{store.currentRecord.kind}</span></div>
                <div className="practice-word">
                  <h3 id="practice-word" ref={wordRef} tabIndex={-1} lang="de">{displayWord(store.currentRecord)}</h3>
                  <AudioButton word={displayWord(store.currentRecord)} />
                </div>
                <p className="prompt">Try to produce the meaning before you reveal it.</p>
                {!store.session || store.session.phase === "prompt" ? (
                  <button className="reveal-button" type="button" onClick={reveal}>Reveal meaning <span aria-hidden="true">↓</span></button>
                ) : (
                  <div className="reveal-content" id="reveal-content" tabIndex={-1} ref={revealRef}>
                    <p className="reveal-gloss">{store.currentRecord.gloss}</p>
                    <p className="reveal-explanation">{store.currentRecord.explanation}</p>
                    {store.currentRecord.usageNote && <p className="usage-note"><strong>Usage note:</strong> {store.currentRecord.usageNote}</p>}
                    {store.currentRecord.reviewStatus === "unreviewed" && <p className="content-review-note">This explanation is generated from the frequency source and is pending editorial review.</p>}
                    <WordExamples record={store.currentRecord} />
                  </div>
                )}
                {store.session.phase === "revealed" && <ReviewActions disabled={reviewing} onReview={review} />}
              </div>
              <aside className="practice-aside">
                <p className="eyebrow">HOW TO USE THIS</p>
                <h3>Make the answer effortful.</h3>
                <p>Look at the German form. Say the meaning or write it down, then reveal only after the attempt.</p>
                <div className="aside-rule" />
                {store.storageStatus === "unavailable" ? (
                  <p className="small-muted notice-warning">Progress cannot be saved in this browser. You can keep practising while this tab is open.</p>
                ) : (
                  <p className="small-muted">Your marks stay in this browser. Review states use a simple interval ladder: short gaps after Again, longer gaps after I know it.</p>
                )}
              </aside>
            </div>
          )}

          <div className="progress-callout">
            <div><span className="eyebrow">OVERALL PROGRESS</span><strong>{store.completion}% of the list marked known</strong></div>
            <ProgressBar value={store.knownCount} max={records.length} label={store.knownCount + " of " + records.length + " words marked known"} />
          </div>
        </section>
      </main>
      <Footer onReset={store.reset} />
    </AppShell>
  );
}
