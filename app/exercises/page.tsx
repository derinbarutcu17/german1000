"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
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
  const shouldReduceMotion = useReducedMotion();
  const item = bank[index];
  const selectedOption = item?.options.find((option) => option.value === selected) ?? null;
  const isCorrect = Boolean(selectedOption?.correct);
  const complete = bank.length > 0 && index >= bank.length;
  const progress = bank.length ? (index + (submitted ? 1 : 0)) / bank.length : 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setBank(buildExerciseBank(records, records.length)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Keyboard: 1-4 to select, Enter to submit/next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (complete || !item) return;
      if (!submitted && e.key >= "1" && e.key <= "4") {
        const idx = Number(e.key) - 1;
        const opt = item.options[idx];
        if (opt) setSelected(opt.value);
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
    trigger(isCorrect ? "success" : "error");
    setSubmitted(true);
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextWrongCount = wrongCount + (isCorrect ? 0 : 1);
    if (isCorrect) setCorrectCount(nextCorrectCount);
    else setWrongCount(nextWrongCount);
    setAnnouncement(`${isCorrect ? "Correct" : "Not quite"}. Score: ${nextCorrectCount} correct, ${nextWrongCount} wrong.`);
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
          <div className="exercise-intro">
            <h1 id="exercise-title">Exercises</h1>
            <p>Choose the closest meaning. One question per word, fresh shuffle every round — no saving, just practice.</p>
          </div>
          <div className="score-card" aria-label={`Round score: ${correctCount} correct, ${wrongCount} wrong`}>
            <div className="score-card__item score-card__item--correct">
              <motion.span
                key={"c-" + correctCount}
                initial={shouldReduceMotion ? false : { scale: 0.92, y: 2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="score-card__number"
              >
                {correctCount}
              </motion.span>
              <span className="score-card__label">Correct</span>
            </div>
            <div className="score-card__item score-card__item--wrong">
              <motion.span
                key={"w-" + wrongCount}
                initial={shouldReduceMotion ? false : { scale: 0.92, y: 2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="score-card__number"
              >
                {wrongCount}
              </motion.span>
              <span className="score-card__label">Wrong</span>
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
            <h2 id="exercise-complete-title" ref={completeTitleRef} tabIndex={-1}>All 1,000 questions answered.</h2>
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
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.36, ease: easeOut }}
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
                  <span>{Math.round(progress * 100)}%</span>
                </div>

                <div className="exercise-prompt">
                  <span className="exercise-kicker" aria-hidden="true"><i /> #{String(item.record.rank).padStart(3, "0")} <i /></span>
                  <motion.h2
                    id="question-title"
                    ref={questionTitleRef}
                    tabIndex={-1}
                    lang="de"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.42, ease: easeOut, delay: 0.05 }}
                  >
                    {item.prompt}
                  </motion.h2>
                </div>

                <motion.fieldset
                  className="choice-group"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: 0.08 } },
                  }}
                >
                  <legend>{item.instruction}</legend>
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
                          variants={
                            shouldReduceMotion
                              ? {}
                              : {
                                  hidden: { opacity: 0, y: 8 },
                                  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: easeOut } },
                                }
                          }
                          animate={
                            shake
                              ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.32, ease: "easeOut" } }
                              : undefined
                          }
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
                              setSelected(isSelected ? null : option.value);
                            }}
                            onClick={() => {
                              if (submitted) return;
                              if (isSelected) setSelected(null);
                            }}
                            disabled={submitted}
                          />
                          <span className="choice__letter" aria-hidden="true">{letters[i]}</span>
                          <span>{option.label}</span>
                        </motion.label>
                      );
                    })}
                  </div>
                </motion.fieldset>



                <div className="exercise-actions">
                  <AnimatePresence mode="wait" initial={false}>
                    {!submitted ? (
                      <motion.button
                        key="check"
                        type="button"
                        className="button button-dark"
                        onClick={submitAnswer}
                        disabled={!selected}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: easeOut }}
                        whileTap={selected ? { scale: 0.97 } : undefined}
                      >
                        Check answer
                      </motion.button>
                    ) : (
                      <motion.button
                        key="next"
                        type="button"
                        className="button button-dark"
                        onClick={nextQuestion}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: easeOut }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {index + 1 >= bank.length ? "Finish round" : "Next question →"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence initial={false}>
                  {submitted && (
                    <motion.div
                      key="feedback"
                      className="exercise-feedback"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: easeOut }}
                      style={{ overflow: "hidden" }}
                    >
                      <motion.div
                        initial={shouldReduceMotion ? false : { y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.36, ease: easeOut, delay: 0.07 }}
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
