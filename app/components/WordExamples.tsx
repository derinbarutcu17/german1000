import type { WordRecord } from "../data/records";

export function WordExamples({ record, compact = false }: { record: WordRecord; compact?: boolean }) {
  return (
    <div className={"examples" + (compact ? " examples-compact" : "")}>
      {record.examples.map((example, index) => {
        const displayLevel = (example as unknown as { level?: string }).level ?? (index === 0 ? "A2" : index === 1 ? "B2" : "C1");
        return (
          <div className="example" key={record.rank + "-" + index}>
            <span className="example-index">{String(index + 1)}<span className="example-level"> · {displayLevel}</span></span>
            <div className="example-copy">
              <p className="example-de" lang="de">{example.de}</p>
              <p className="example-en">{example.en}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
