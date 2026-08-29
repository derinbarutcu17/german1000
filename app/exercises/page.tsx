"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
import { AppShell } from "../components/AppShell";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { Footer } from "../components/Footer";
import { WordExamples } from "../components/WordExamples";
import type { WordRecord } from "../data/records";
import { buildExerciseBank, type ExerciseItem } from "../lib/exercises";

const easeOut = [0.22, 1, 0.36, 1] as const;
const letters = ["A", "B", "C", "D"] as const;

export default function ExercisesPage() {
  const [bank, setBank] = useState<ExerciseItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const { trigger } = useWebHaptics();
  const questionTitleRef = useRef<HTMLHeadingElement>(null);
  const completeTitleRef = useRef<HTMLHeadingElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const prevIndexRef = useRef(0);
  const recordsRef = useRef<WordRecord[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const item = bank[index];
  const selectedOption = item?.options.find((option) => option.value === selected) ?? null;
  const isCorrect = Boolean(selectedOption?.correct);
  const complete = bank.length > 0 && index >= bank.length;
  const progress = bank.length ? (index + (submitted ? 1 : 0)) / bank.length : 0;

  const handleQuestionRef = useCallback(
    (node: HTMLHeadingElement | null) => {
      questionTitleRef.current = node;
      if (node && bank.length > 0 && !complete && !submitted && prevIndexRef.current !== index) {
        requestAnimationFrame(() => {
          node.focus();
          node.scrollIntoView({ block: "center", behavior: shouldReduceMotion ? "auto" : "smooth" });
        });
      }
      prevIndexRef.current = index;
    },
    [bank.length, complete, submitted, index, shouldReduceMotion],
  );

  const handleCompleteRef = useCallback(
    (node: HTMLHeadingElement | null) => {
      completeTitleRef.current = node;
      if (node && complete) {
        requestAnimationFrame(() => {
          node.focus();
          node.scrollIntoView({ block: "center", behavior: shouldReduceMotion ? "auto" : "smooth" });
        });
      }
    },
    [complete, shouldReduceMotion],
  );

  const handleNextRef = useCallback(
    (node: HTMLButtonElement | null) => {
      nextButtonRef.current = node;
      if (node && submitted) {
        requestAnimationFrame(() => node.focus());
      }
    },
    [submitted],
  );

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void import("../data/records").then(({ records: loadedRecords }) => {
        if (!active) return;
        recordsRef.current = loadedRecords;
        setBank(buildExerciseBank(loadedRecords, loadedRecords.length));
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  // Keyboard: 1-4 to select, Enter to submit/next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (complete || !item) return;
      if (!submitted && e.key >= "1" && e.key <= "4") {
        const idx = Number(e.key) - 1;
        const opt = item.options[idx];
        if (opt) {
          setSelected(opt.value);
          submitAnswer(opt.value);
        }
      }
      if (e.key === "Enter") {
        if (!submitted && selected) submitAnswer();
        else if (submitted) nextQuestion();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, selected, submitted, complete, isCorrect, correctCount, wrongCount]);

  function shuffleAgain() {
    const loadedRecords = recordsRef.current;
    if (!loadedRecords.length) return;
    setBank(buildExerciseBank(loadedRecords, loadedRecords.length));
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
    setWrongCount(0);
    setAnnouncement("A new order of all 1,000 questions is ready.");
  }

  function submitAnswer(answer: string | null = selected) {
    const answerOption = item?.options.find((option) => option.value === answer);
    if (!answer || submitted || !item || !answerOption) return;
    const answerIsCorrect = answerOption.correct;
    trigger(answerIsCorrect ? "success" : "error");
    setSubmitted(true);
    const nextCorrectCount = correctCount + (answerIsCorrect ? 1 : 0);
    const nextWrongCount = wrongCount + (answerIsCorrect ? 0 : 1);
    if (answerIsCorrect) setCorrectCount(nextCorrectCount);
    else setWrongCount(nextWrongCount);
    setAnnouncement(`${answerIsCorrect ? "Correct" : "Not quite"}. Score: ${nextCorrectCount} correct, ${nextWrongCount} wrong.`);
  }

  function nextQuestion() {
    if (index + 1 >= bank.length) {
      setIndex(bank.length);
      setSelected(null);
      setSubmitted(false);
      setAnnouncement("You reached all 1,000 questions. Shuffle again to start a new round.");
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setSubmitted(false);
    setAnnouncement("Next question.");
  }

  return (
    <AppShell>
      <main id="main-content" className="page-stack exercise-page">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

        <section className="section-heading" aria-labelledby="exercise-title">
          <div className="exercise-intro">
            <h1 id="exercise-title">Exercises</h1>
          </div>
          <div className="score-card" role="group" aria-label={`Round score: ${correctCount} correct, ${wrongCount} wrong`}>
            <span className="score-card__caption" aria-hidden="true">Score</span>
            <div className="score-card__item score-card__item--correct" aria-hidden="true">
              <span className="score-card__icon score-card__icon--check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 13 4 4 10-9" /></svg>
              </span>
              <motion.span
                key={"c-" + correctCount}
                initial={shouldReduceMotion ? false : { scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.16, ease: easeOut }}
                className="score-card__number"
              >
                {correctCount}
              </motion.span>
            </div>
            <div className="score-card__item score-card__item--wrong" aria-hidden="true">
              <span className="score-card__icon score-card__icon--cross" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6 18 18" /><path d="M18 6 6 18" /></svg>
              </span>
              <motion.span
                key={"w-" + wrongCount}
                initial={shouldReduceMotion ? false : { scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.16, ease: easeOut }}
                className="score-card__number"
              >
                {wrongCount}
              </motion.span>
            </div>
          </div>
        </section>

        {!bank.length ? (
          <div className="exercise-card exercise-loading" aria-live="polite">
            <span className="flashcard-loading-mark" aria-hidden="true">✳</span>
            <h2>Finding a fresh path through the vocabulary.</h2>
          </div>
        ) : complete ? (
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="empty-state exercise-complete"
            aria-labelledby="exercise-complete-title"
          >
            <h2 id="exercise-complete-title" ref={handleCompleteRef} tabIndex={-1}>All 1,000 questions answered.</h2>
            <p>You made it through this temporary question order with {correctCount} correct and {wrongCount} wrong answers. Reloading or reshuffling starts clean.</p>
            <div className="empty-state-action">
              <button className="button button-dark" type="button" onClick={shuffleAgain}>Shuffle all 1,000 again <span aria-hidden="true">↗</span></button>
              <Link className="button button--secondary" href="/">Return to cards</Link>
            </div>
          </motion.section>
        ) : item ? (
          <div className="exercise-viewport">
            <AnimatePresence mode="wait">
              <motion.section
                key={item.record.rank}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: easeOut }}
                className="exercise-card"
                aria-labelledby="question-title"
              >
                <div className="exercise-progress" aria-hidden="true">
                  <motion.div
                    className="exercise-progress__fill"
                    initial={false}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.55, ease: easeOut }}
                    style={{ scaleX: progress }}
                  />
                </div>

                <div className="exercise-card__header">
                  <span>
                    Question <strong>{String(index + 1).padStart(4, "0")}</strong> · {bank.length.toLocaleString()}
                  </span>
                </div>

                <div className="exercise-prompt">
                  <motion.h2
                    id="question-title"
                    ref={handleQuestionRef}
                    tabIndex={-1}
                    lang="de"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.14, ease: easeOut }}
                  >
                    {item.prompt}
                  </motion.h2>
                </div>

                <fieldset className="choice-group">
                  <legend className="sr-only">{item.instruction}</legend>
                  <div className="choice-grid">
                    {item.options.map((option, i) => {
                      const optionId = "exercise-option-" + item.record.rank + "-" + option.value;
                      const isSelected = selected === option.value;
                      const isRight = option.correct;
                      let stateClass = "choice";
                      if (submitted && isRight) stateClass += " choice--correct";
                      else if (submitted && isSelected && !isRight) stateClass += " choice--incorrect";
                      else if (submitted && !isRight && !isSelected) stateClass += " choice--dimmed";
                      const shake = submitted && isSelected && !isRight && !shouldReduceMotion;
                      return (
                        <motion.label
                          key={option.value}
                          htmlFor={optionId}
                          className={stateClass}
                          animate={shake ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.14, ease: "easeOut" } } : undefined}
                          whileTap={!submitted ? { scale: 0.985 } : undefined}
                          transition={{ duration: 0.12, ease: easeOut }}
                        >
                          <input
                            id={optionId}
                            type="radio"
                            name="exercise-answer"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => {
                              if (submitted) return;
                              setSelected(option.value);
                              submitAnswer(option.value);
                            }}
                            disabled={submitted}
                          />
                          <span className="choice__letter" aria-hidden="true">{letters[i]}</span>
                          <span>{option.label}</span>
                          {submitted && isRight && <span className="choice__status choice__status--correct" aria-hidden="true">✓</span>}
                          {submitted && isSelected && !isRight && <span className="choice__status choice__status--incorrect" aria-hidden="true">✕</span>}
                        </motion.label>
                      );
                    })}
                  </div>
                </fieldset>



                {submitted && <div className="exercise-actions">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.button
                      key="next"
                      ref={handleNextRef}
                      type="button"
                      className="button button-dark"
                      onClick={nextQuestion}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      whileTap={{ scale: 0.97 }}
                      onAnimationComplete={() => {
                        // Fallback for reduced-motion where initial is false and callback ref already focused.
                        if (submitted) handleNextRef(nextButtonRef.current);
                      }}
                    >
                      {index + 1 >= bank.length ? "Finish round" : "Next question →"}
                    </motion.button>
                  </AnimatePresence>
                </div>}

                <AnimatePresence initial={false}>
                  {submitted && (
                    <motion.div
                      key="feedback"
                      className="exercise-feedback"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.16, ease: easeOut }}
                      style={{ overflow: "hidden" }}
                    >
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.14, ease: easeOut }}
                      >
                        <FeedbackPanel correct={isCorrect} answer={item.answer} />
                        <div style={{ marginTop: 16 }}>
                          <WordExamples record={item.record} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            </AnimatePresence>
          </div>
        ) : null}
      </main>
      <Footer />
    </AppShell>
  );
}
