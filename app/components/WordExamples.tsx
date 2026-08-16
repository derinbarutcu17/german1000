import type { WordRecord } from "../data/records";

export function WordExamples({ record, compact = false }: { record: WordRecord; compact?: boolean }) {
  return (
    <div className={"examples" + (compact ? " examples-compact" : "")}>
      {record.examples.map((example, index) => (
        <div className="example" key={record.rank + "-" + index}>
          <span className="example-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="example-copy">
            <p className="example-de" lang="de">{example.de}</p>
            <p className="example-en">{example.en}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
