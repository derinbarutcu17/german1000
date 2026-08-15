import type { ReactNode } from "react";

export function FeedbackPanel({ correct, answer, children }: { correct: boolean; answer: string; children?: ReactNode }) {
  const message = correct ? "Correct." : "Not quite.";
  return (
    <div className={"feedback " + (correct ? "feedback-good" : "feedback-wrong")}>
      <p className="feedback-status" role="status" aria-live="polite">{message}</p>
      <p className="feedback-answer"><strong>Answer:</strong> {answer}</p>
      {children}
    </div>
  );
}
