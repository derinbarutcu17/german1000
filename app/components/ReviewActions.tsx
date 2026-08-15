import type { ReviewOutcome } from "../lib/learning/types";

export function ReviewActions({ onReview, disabled = false }: { onReview: (outcome: ReviewOutcome) => void; disabled?: boolean }) {
  return (
    <div className="review-actions">
      <button type="button" className="button button--secondary" disabled={disabled} onClick={() => onReview("again")}>
        Again
        <span className="button-help">Bring it back soon</span>
      </button>
      <button type="button" className="button button--primary" disabled={disabled} onClick={() => onReview("known")}>
        I know it
        <span className="button-help">Schedule a longer gap</span>
      </button>
    </div>
  );
}
