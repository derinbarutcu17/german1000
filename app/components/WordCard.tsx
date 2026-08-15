import { displayWord, type WordRecord } from "../data/records";
import { WordExamples } from "./WordExamples";

export function WordCard({ record }: { record: WordRecord }) {
  return (
    <article className="word-card word-card--index" id={"word-" + String(record.rank).padStart(3, "0")}>
      <div className="word-card-topline">
        <span className="rank">#{String(record.rank).padStart(3, "0")}</span>
        <span className="band">{record.kind}</span>
      </div>
      <div className="word-heading-row">
        <div>
          <h3 lang="de">{displayWord(record)}</h3>
          {record.lemma && record.lemma !== record.word && <p className="surface-note">form: {record.word} · base: {record.lemma}</p>}
        </div>
      </div>
      <p className="word-gloss">{record.gloss}</p>
      <p className="word-explanation">{record.explanation}</p>
      {record.usageNote && <p className="usage-note"><strong>Usage note:</strong> {record.usageNote}</p>}
      {record.reviewStatus === "unreviewed" && <p className="content-review-note">Frequency source · explanation pending editorial review</p>}
      <details className="word-details">
        <summary>See three usage examples <span aria-hidden="true">↓</span></summary>
        <WordExamples record={record} compact withAudio={false} />
      </details>
    </article>
  );
}
