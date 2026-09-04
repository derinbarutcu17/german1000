import { records } from "../app/data/records";
import { wordUsedAsRecord } from "../app/data/example-content";

const FORMAL_SIE = /(?:^|[^\p{L}])Sie(?=$|[^\p{L}])/u;

let bad = 0;
for (const r of records) {
  const asNoun = r.kind === "noun" || r.kind === "name";
  r.examples.forEach((ex, i) => {
    // "sie" also means formal you (capitalized Sie) — a documented gloss sense.
    if (r.word === "sie" && FORMAL_SIE.test(ex.de)) return;
    if (!wordUsedAsRecord(ex.de, r.word, asNoun)) {
      bad++;
      console.log(
        JSON.stringify({ word: r.word, gloss: r.gloss, kind: r.kind, i, de: ex.de, en: ex.en }),
      );
    }
  });
}
console.log("TOTAL CASE/SEMANTIC MISMATCHES:", bad);
