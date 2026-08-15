"use client";

import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";
import { useLearningStore } from "../lib/learning/useLearningStore";
import Link from "next/link";

export default function MethodPage() {
  const store = useLearningStore();

  return (
    <AppShell knownCount={store.knownCount}>
      <main id="main-content" className="page-stack method-page">
        <section className="method-hero" aria-labelledby="method-title">
          <p className="eyebrow">A small, honest system</p>
          <h1 id="method-title">Learn the words you will actually meet.</h1>
          <p className="lede">German 1000 is a focused frequency list with enough context to turn recognition into recall. It is designed to feel calm, legible, and useful every day.</p>
        </section>

        <div className="method-grid">
          <section className="method-section" aria-labelledby="rhythm-title">
            <p className="eyebrow">01 / Daily rhythm</p>
            <h2 id="rhythm-title">Ten words, one clear next step.</h2>
            <p>Each visit opens a stable ten-word session. Read the word, reveal its meaning and examples, then choose the response that matches your confidence.</p>
            <div className="method-rule"><span>Know it</span><strong>Move forward</strong></div>
            <div className="method-rule"><span>Again</span><strong>See it again later</strong></div>
          </section>

          <section className="method-section" aria-labelledby="schedule-title">
            <p className="eyebrow">02 / Scheduling</p>
            <h2 id="schedule-title">A lightweight spaced-learning ladder.</h2>
            <p>New words you know return tomorrow. Known words expand to 1, 3, 7, 14, 30, and 60-day intervals. Choosing Again returns a word to a short learning interval of about ten minutes.</p>
            <p className="method-note">The schedule is intentionally visible and modest. It is a guide for returning, not a judgment about your ability.</p>
          </section>

          <section className="method-section" aria-labelledby="context-title">
            <p className="eyebrow">03 / Context</p>
            <h2 id="context-title">Frequency is the map; context is the destination.</h2>
            <p>Translations are starting points. Example sentences and notes show how a word behaves, so you can notice register, grammar, and the small meanings that dictionaries compress.</p>
            <Link className="text-link" href="/explore">Explore the full word index →</Link>
          </section>

          <section className="method-section" aria-labelledby="boundaries-title">
            <p className="eyebrow">04 / Boundaries</p>
            <h2 id="boundaries-title">Practice stays separate from progress.</h2>
            <p>Exercises are for retrieval practice. They show immediate feedback but do not silently alter your review schedule. The daily review actions are the single source of truth for learning progress.</p>
            <Link className="text-link" href="/exercises">Try an exercise →</Link>
          </section>
        </div>

        <section className="sources-section" aria-labelledby="sources-title">
          <div>
            <p className="eyebrow">Sources & notes</p>
            <h2 id="sources-title">Built to be inspectable.</h2>
            <p>The list is a practical learning resource, not a claim that one ranking captures every learner or situation. We preserve the source ranking while correcting clear gloss errors and adding editorial notes where they prevent a misleading first impression.</p>
          </div>
          <ul className="source-list">
            <li><a href="https://en.wiktionary.org/" target="_blank" rel="noreferrer">Wiktionary</a><span>German usage, grammar, and inflection checks</span></li>
            <li><a href="https://www.dw.com/en/learn-german/s-2469" target="_blank" rel="noreferrer">Deutsche Welle</a><span>learner-oriented language context</span></li>
            <li><a href="https://frequencylists.blogspot.com/" target="_blank" rel="noreferrer">Frequency lists</a><span>orientation for high-frequency vocabulary</span></li>
          </ul>
        </section>
      </main>
      <Footer onReset={store.resetProgress} />
    </AppShell>
  );
}
