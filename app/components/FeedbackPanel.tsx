export function FeedbackPanel({ correct, answer }: { correct: boolean; answer: string }) {
  return (
    <div className={"feedback " + (correct ? "feedback-good" : "feedback-wrong")}>
      <div className="feedback-head">
        <span className="feedback-icon" aria-hidden="true">{correct ? "✓" : "✕"}</span>
        <p className="feedback-status" role="status" aria-live="polite">{correct ? "Correct." : "Not quite."}</p>
      </div>
      <p className="feedback-answer"><strong>Answer:</strong> {answer}</p>
    </div>
  );
}
