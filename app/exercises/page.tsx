"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { Footer } from "../components/Footer";
import { WordExamples } from "../components/WordExamples";
import { records } from "../data/records";
import { buildExerciseBank, type ExerciseItem } from "../lib/exercises";

function focusElement(element: HTMLElement | null) {
  if (!element) return;
  element.focus();
  element.scrollIntoView({
    block: "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

export default function ExercisesPage() {
  const [bank, setBank] = useState<ExerciseItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const questionTitleRef = useRef<HTMLHeadingElement>(null);
  const completeTitleRef = useRef<HTMLHeadingElement>(null);
  const item = bank[index];
  const selectedOption = item?.options.find((option) => option.value === selected) ?? null;
  const isCorrect = Boolean(selectedOption?.correct);
  const complete = bank.length > 0 && index >= bank.length;

  useEffect(() => {
    const timer = window.setTimeout(() => setBank(buildExerciseBank(records, records.length)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function shuffleAgain() {
    setBank(buildExerciseBank(records, records.length));
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
    setWrongCount(0);
    setAnnouncement("A new order of all 1,000 questions is ready.");
    window.setTimeout(() => focusElement(questionTitleRef.current), 0);
  }

  function submitAnswer() {
    if (!selected || submitted || !item) return;
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
    else setWrongCount((count) => count + 1);
  }

  function nextQuestion() {
    if (index + 1 >= bank.length) {
      setIndex(bank.length);
      setSelected(null);
      setSubmitted(false);
      setAnnouncement("You reached all 1,000 questions. Shuffle again to start a new round.");
      window.setTimeout(() => focusElement(completeTitleRef.current), 0);
      return;
    }

    setIndex((current) => current + 1);
    setSelected(null);
    setSubmitted(false);
    setAnnouncement("Next question.");
    window.setTimeout(() => focusElement(questionTitleRef.current), 0);
  }

  return (
    <AppShell>
      <main id="main-content" className="page-stack exercise-page">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <section className="section-heading" aria-labelledby="exercise-title">
          <div>
            <h1 id="exercise-title">Exercises</h1>
          </div>
          <div className="score-card" aria-label={`Round score: ${correctCount} correct, ${wrongCount} wrong`}>
            <div className="score-card__item score-card__item--correct">
              <span className="score-card__number">{correctCount}</span>
              <span className="score-card__label">Correct</span>
            </div>
            <div className="score-card__item score-card__item--wrong">
              <span className="score-card__number">{wrongCount}</span>
              <span className="score-card__label">Wrong</span>
            </div>
          </div>
        </section>

        {!bank.length ? (
          <div className="exercise-card exercise-loading" aria-live="polite">
            <span className="flashcard-loading-mark" aria-hidden="true">✳</span>
            <p className="eyebrow">SHUFFLING 1,000 QUESTIONS</p>
            <h2>Finding a fresh path through the vocabulary.</h2>
          </div>
        ) : complete ? (
          <section className="empty-state exercise-complete" aria-labelledby="exercise-complete-title">
            <p className="eyebrow">ROUND COMPLETE</p>
            <h2 id="exercise-complete-title" ref={completeTitleRef} tabIndex={-1}>All 1,000 questions answered.</h2>
            <p>You made it through this temporary question order with {correctCount} correct and {wrongCount} wrong answers. Reloading or reshuffling starts clean.</p>
            <div className="empty-state-action">
              <button className="button button-dark" type="button" onClick={shuffleAgain}>Shuffle all 1,000 again <span aria-hidden="true">↗</span></button>
              <Link className="button button--secondary" href="/">Return to cards</Link>
            </div>
          </section>
        ) : item ? (
          <section className="exercise-card" aria-labelledby="question-title">
            <div className="exercise-card__header">
              <span>Question {index + 1} of {bank.length.toLocaleString()}</span>
            </div>
            <div className="exercise-prompt">
              <h2 id="question-title" ref={questionTitleRef} tabIndex={-1} lang="de">{item.prompt}</h2>
            </div>
            <fieldset className="choice-group">
              <legend>{item.instruction}</legend>
              {item.options.map((option) => {
                const optionId = "exercise-option-" + item.record.rank + "-" + option.value;
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
                <button type="button" className="button button-dark" onClick={submitAnswer} disabled={!selected}>
                  Check answer
                </button>
              ) : (
                <button type="button" className="button button-dark" onClick={nextQuestion}>
                  {index + 1 >= bank.length ? "Finish round" : "Next question"}
                </button>
              )}
              <span className="exercise-position">{index + 1} / {bank.length.toLocaleString()}</span>
            </div>
            {submitted && (
              <div className="exercise-feedback">
                <FeedbackPanel correct={isCorrect} answer={item.answer} />
                <WordExamples record={item.record} />
              </div>
            )}
          </section>
        ) : null}

      </main>
      <Footer />
    </AppShell>
  );
}
