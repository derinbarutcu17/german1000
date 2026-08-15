import { displayWord, type WordRecord } from "../data/records";
import type { ReviewOutcome, ReviewStatus } from "../lib/learning/types";
import { AudioButton } from "./AudioButton";
import { WordExamples } from "./WordExamples";

export function WordCard({
  record,
  progress,
  onReview,
}: {
  record: WordRecord;
  progress?: ReviewStatus;
  onReview?: (rank: number, outcome: ReviewOutcome) => void;
}) {
  const learnerLabel = progress ?? "new";
  return (
    <article className="word-card">
      <div className="word-card-topline">
        <span className="rank">#{String(record.rank).padStart(3, "0")}</span>
        <span className="band">{record.kind}</span>
        <span className={"status status--" + learnerLabel}>{learnerLabel}</span>
      </div>
      <div className="word-heading-row">
        <div>
          <h3 lang="de">{displayWord(record)}</h3>
          {record.lemma && record.lemma !== record.word && <p className="surface-note">form: {record.word} · base: {record.lemma}</p>}
        </div>
        <AudioButton word={displayWord(record)} compact />
      </div>
      <p className="word-gloss">{record.gloss}</p>
      <p className="word-explanation">{record.explanation}</p>
      {record.usageNote && <p className="usage-note"><strong>Usage note:</strong> {record.usageNote}</p>}
      {record.reviewStatus === "unreviewed" && <p className="content-review-note">Frequency source · explanation pending editorial review</p>}
      <details className="word-details">
        <summary>See three usage examples <span aria-hidden="true">↓</span></summary>
        <WordExamples record={record} compact />
      </details>
      {onReview && (
        <div className="card-actions">
          <button className="button button--secondary" type="button" aria-label={"Review " + displayWord(record) + " again"} onClick={() => onReview(record.rank, "again")}>Review soon</button>
          <button className="button button--primary" type="button" aria-label={"Mark " + displayWord(record) + " as known"} onClick={() => onReview(record.rank, "known")}>Mark known</button>
        </div>
      )}
    </article>
  );
}
