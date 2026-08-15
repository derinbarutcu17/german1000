"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { AudioButton } from "../components/AudioButton";
import { EmptyState } from "../components/EmptyState";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { Footer } from "../components/Footer";
import { WordExamples } from "../components/WordExamples";
import { records } from "../data/records";
import { buildExerciseBank, type ExerciseItem, type ExerciseMode } from "../lib/exercises";
import { useLearningStore } from "../lib/learning/useLearningStore";

const modes: Array<{ id: ExerciseMode; label: string; description: string }> = [
  { id: "meaning", label: "Meaning", description: "Choose the closest English meaning." },
  { id: "word", label: "Recall", description: "Choose the German word that fits." },
  { id: "article", label: "Article", description: "Choose the correct der, die, or das." },
];

function readMode() {
  if (typeof window === "undefined") return "meaning" as ExerciseMode;
  const value = new URLSearchParams(window.location.search).get("mode");
  return value === "word" || value === "article" ? value : "meaning";
}

export default function ExercisesPage() {
  const store = useLearningStore();
  const [mode, setMode] = useState<ExerciseMode>("meaning");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setMode(readMode()), 0);
    const syncMode = () => setMode(readMode());
    window.addEventListener("popstate", syncMode);
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener("popstate", syncMode);
    };
  }, []);

  const bank = useMemo(() => buildExerciseBank(records, mode, 12), [mode]);
  const item: ExerciseItem | undefined = bank[index];
  const selectedOption = item?.options.find((option) => option.value === selected) ?? null;
  const isCorrect = Boolean(selectedOption?.correct);

  function chooseMode(nextMode: ExerciseMode) {
    window.history.pushState(null, "", "/exercises?mode=" + nextMode);
    setMode(nextMode);
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
  }

  function submitAnswer() {
    if (!selected || submitted) return;
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
    if (item) store.exerciseAttempt(item.record.rank, isCorrect ? "correct" : "wrong");
  }

  function nextQuestion() {
    setIndex((current) => (current + 1) % bank.length);
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <AppShell knownCount={store.knownCount}>
      <main id="main-content" className="page-stack exercise-page">
        <section className="section-heading" aria-labelledby="exercise-title">
          <div>
            <p className="eyebrow">Active recall</p>
            <h1 id="exercise-title">Exercises</h1>
            <p className="lede">Use short prompts to test what you can retrieve. These exercises are practice, not a hidden progress reset.</p>
          </div>
          <div className="score-card" aria-label="Exercise score">
            <span className="score-card__number">{correctCount}</span>
            <span className="score-card__label">correct this round</span>
          </div>
        </section>

        <nav className="mode-tabs" aria-label="Exercise type">
          {modes.map((exerciseMode) => (
            <Link
              key={exerciseMode.id}
              href={"/exercises?mode=" + exerciseMode.id}
              className={mode === exerciseMode.id ? "mode-tab mode-tab--active" : "mode-tab"}
              aria-current={mode === exerciseMode.id ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                chooseMode(exerciseMode.id);
              }}
            >
              <span>{exerciseMode.label}</span>
              <small>{exerciseMode.description}</small>
            </Link>
          ))}
        </nav>

        {item ? (
          <section className="exercise-card" aria-labelledby="question-title">
            <div className="exercise-card__header">
              <span>Question {index + 1} of {bank.length}</span>
              <span>{item.record.kind}</span>
            </div>
            <div className="exercise-prompt">
              <div className="exercise-prompt__wordline">
                <p className="eyebrow">{item.promptLabel}</p>
                {item.audio && <AudioButton text={item.audio} label="Hear this prompt" />}
              </div>
              <h2 id="question-title">{item.prompt}</h2>
              {item.record.usageNote && <p>{item.record.usageNote}</p>}
            </div>
            <fieldset className="choice-group">
              <legend>{item.instruction}</legend>
              {item.options.map((option) => {
                const optionId = "exercise-option-" + option.value.replace(/\s+/g, "-").toLowerCase();
                const stateClass = submitted && option.correct ? "choice choice--correct" : submitted && selected === option.value ? "choice choice--incorrect" : "choice";
                return (
                  <label className={stateClass} key={option.value} htmlFor={optionId}>
                    <input
                      id={optionId}
                      type="radio"
                      name="exercise-answer"
                      value={option.value}
                      checked={selected === option.value}
                      onChange={() => setSelected(option.value)}
                      disabled={submitted}
                    />
                    <span className="choice__marker" aria-hidden="true" />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </fieldset>
            <div className="exercise-actions">
              {!submitted ? (
                <button type="button" className="button button--primary" onClick={submitAnswer} disabled={!selected}>
                  Check answer
                </button>
              ) : (
                <button type="button" className="button button--primary" onClick={nextQuestion}>
                  Next question
                </button>
              )}
              <span className="exercise-position">{index + 1} / {bank.length}</span>
            </div>
            {submitted && (
              <div className="exercise-feedback">
                <FeedbackPanel correct={isCorrect} answer={selectedOption?.label ?? item.answer} />
                <WordExamples record={item.record} />
              </div>
            )}
          </section>
        ) : (
          <EmptyState title="No exercise available" body="There are no words available for this exercise mode yet." action={<Link className="button button--primary" href="/">Return to today</Link>} />
        )}

        <aside className="callout" aria-label="How exercises affect progress">
          <strong>How this works</strong>
          <p>Answer quality helps you practice retrieval. Only the daily review buttons change a word’s learning schedule, so you always know what your progress means.</p>
        </aside>
      </main>
      <Footer onReset={store.resetProgress} />
    </AppShell>
  );
}
