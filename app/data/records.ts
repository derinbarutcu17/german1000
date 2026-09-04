import { nounInfo } from "../nouns";
import { frequencyWords, type FrequencyWord } from "../words";
import { firstMeaning } from "../lib/word-utils";
import { buildExamples, buildExplanation, fallbackForLevel, isMetaExample } from "./example-content";
export { displayWord, firstMeaning } from "../lib/word-utils";

function cefrScore(de: string): number {
  const words = de.trim().split(/\s+/);
  const wc = words.length;
  const commas = (de.match(/,/g) || []).length;
  const subConj = (de.match(/\b(weil|dass|daß|wenn|obwohl|während|bevor|nachdem|falls|sobald|damit|sodass|ob|wobei|indem|als|wie|denn|sondern)\b/gi) || []).length;
  const genitive = (de.match(/\b(des|eines|einer)\b/g) || []).length;
  const konjunktiv = (de.match(/\b(würde|würden|könnte|könnten|hätte|hätten|wäre|wären|sei|seien)\b/g) || []).length;
  const passive = /\b(wird|werden|wurde|worden)\b/.test(de) ? 1 : 0;
  const longWords = words.filter((w) => w.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length >= 10).length;
  const avgLen = words.reduce((a, w) => a + w.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length, 0) / wc;
  const rare = words.filter((w) => /^[A-ZÄÖÜ]/.test(w) && w.length > 9).length;
  return wc * 0.6 + commas * 2 + subConj * 2.5 + genitive * 2 + konjunktiv * 3 + passive * 2 + longWords * 1.1 + rare * 1.2 + avgLen * 0.3;
}
export type WordKind = "function" | "noun" | "verb" | "adjective" | "adverb" | "name" | "number" | "other";
export type ReviewStatus = "unreviewed" | "editor-reviewed" | "native-reviewed";
export type Example = {
  de: string;
  en: string;
  sourceKind: "tatoeba" | "context-template";
  sourceRef?: string;
  sourceId?: number;
  author?: string;
  license?: string;
  level?: "A2" | "B2" | "C1";
};

export type WordRecord = FrequencyWord & {
  kind: WordKind;
  gloss: string;
  lemma?: string;
  article?: string;
  nounNumber?: "singular" | "plural";
  explanation: string;
  examples: Example[];
  reviewStatus: ReviewStatus;
  usageNote?: string;
};

type CuratedNote = Partial<Pick<WordRecord, "gloss" | "kind" | "lemma" | "explanation" | "usageNote">> & {
  examples?: Array<Omit<Example, "sourceKind"> & Partial<Pick<Example, "sourceKind">>>;
  reviewStatus?: ReviewStatus;
};

const curated: Record<string, CuratedNote> = {
  die: {
    gloss: "the; she; they (context-dependent)",
    kind: "function",
    explanation: "Die is the definite article for feminine singular nouns and all plural nouns. As a pronoun, it can also mean she or they; the verb and context resolve the meaning.",
    examples: [
      { de: "Die Frau wartet.", en: "The woman is waiting." },
      { de: "Die Kinder spielen draußen.", en: "The children are playing outside." },
      { de: "Die, die zuerst ankommen, reservieren den Tisch.", en: "Those who arrive first reserve the table." },
    ],
    reviewStatus: "native-reviewed",
  },
  und: {
    gloss: "and",
    kind: "function",
    explanation: "Und links words, phrases, or clauses without changing the word order of the following main clause.",
    examples: [
      { de: "Ich trinke Tee und Wasser.", en: "I drink tea and water." },
      { de: "Sie arbeitet und lernt Deutsch.", en: "She works and learns German." },
      { de: "Er wollte kommen, und obwohl es spät war, blieb er lange.", en: "He wanted to come, and although it was late, he stayed a long time." },
    ],
    reviewStatus: "native-reviewed",
  },
  der: {
    gloss: "the; who/which (masculine nominative)",
    kind: "function",
    explanation: "Der is the definite article for masculine singular nouns in the nominative. It can also be a relative pronoun meaning who or which.",
    examples: [
      { de: "Der Mann liest.", en: "The man is reading." },
      { de: "Der Zug kommt um acht Uhr.", en: "The train arrives at eight." },
      { de: "Der Film, der gestern lief, war überraschend leicht.", en: "The film that was on yesterday was surprisingly easy." },
    ],
    reviewStatus: "native-reviewed",
  },
  in: {
    gloss: "in; into",
    kind: "function",
    explanation: "In expresses location with the dative and movement into a place with the accusative. It is one of German’s two-way prepositions.",
    examples: [
      { de: "Ich bin in Berlin.", en: "I am in Berlin." },
      { de: "Wir gehen in den Park.", en: "We are going into the park." },
      { de: "In dem Moment, in dem sie ankam, begann die Diskussion.", en: "At the moment when she arrived, the discussion began." },
    ],
    reviewStatus: "native-reviewed",
  },
  sie: {
    gloss: "she; they; you (formal)",
    kind: "function",
    explanation: "Sie is ambiguous in writing: lowercase sie can mean she or they, while capitalized Sie means formal you. The verb and capitalization resolve the meaning.",
    examples: [
      { de: "Sie wohnt in Berlin.", en: "She lives in Berlin." },
      { de: "Sie kommen morgen.", en: "They are coming tomorrow." },
      { de: "Könnten Sie mir bitte erklären, wie das funktioniert?", en: "Could you please explain how this works?" },
    ],
    reviewStatus: "native-reviewed",
  },
  zu: {
    gloss: "to; too; in order to",
    kind: "function",
    explanation: "Zu can mark direction, form the infinitive with zu, or mean too in fixed expressions. The surrounding construction matters.",
    examples: [
      { de: "Ich gehe zu meiner Freundin.", en: "I am going to my friend." },
      { de: "Es ist zu spät.", en: "It is too late." },
      { de: "Ich lerne jeden Tag, um sicherer zu sprechen.", en: "I study every day in order to speak more confidently." },
    ],
    reviewStatus: "native-reviewed",
  },
  nicht: {
    gloss: "not",
    kind: "function",
    explanation: "Nicht negates a verb, adjective, adverb, or whole clause. Its position changes with what exactly is being negated.",
    examples: [
      { de: "Ich komme nicht.", en: "I am not coming." },
      { de: "Das ist nicht schwer.", en: "That is not difficult." },
      { de: "Ich glaube nicht, dass er heute Zeit hat.", en: "I do not think that he has time today." },
    ],
    reviewStatus: "native-reviewed",
  },
  von: {
    gloss: "from; of; by",
    kind: "function",
    explanation: "Von takes the dative and commonly marks origin, possession, or the agent of a passive action.",
    examples: [
      { de: "Ich komme von der Arbeit.", en: "I am coming from work." },
      { de: "Das ist ein Buch von ihr.", en: "That is a book by her." },
      { de: "Der Vorschlag wurde von mehreren Personen unterstützt.", en: "The proposal was supported by several people." },
    ],
    reviewStatus: "native-reviewed",
  },
  mit: {
    gloss: "with; by means of",
    kind: "function",
    explanation: "Mit always takes the dative. It expresses accompaniment, instruments, or means of transport.",
    examples: [
      { de: "Ich komme mit dir.", en: "I am coming with you." },
      { de: "Wir fahren mit dem Zug.", en: "We are travelling by train." },
      { de: "Mit etwas Geduld lässt sich das Problem schnell lösen.", en: "With a little patience, the problem can be solved quickly." },
    ],
    reviewStatus: "native-reviewed",
  },
  Haus: {
    gloss: "house; home; building",
    kind: "noun",
    lemma: "Haus",
    explanation: "Das Haus is a building or home. In nach Hause, the meaning is homeward or to home.",
    examples: [
      { de: "Das Haus ist groß.", en: "The house is big." },
      { de: "Wir renovieren das Haus im Sommer.", en: "We are renovating the house in summer." },
      { de: "Vor dem Haus steht ein Fahrrad.", en: "A bicycle is standing in front of the house." },
    ],
    reviewStatus: "native-reviewed",
  },
  werden: {
    gloss: "to become; will; be (passive auxiliary)",
    kind: "verb",
    lemma: "werden",
    explanation: "Werden is both a full verb meaning become and an auxiliary for the future and passive voice.",
    examples: [
      { de: "Wir werden morgen weiterarbeiten.", en: "We will continue working tomorrow." },
      { de: "Wenn die Tage länger werden, fahren wir ans Meer.", en: "When the days get longer, we will go to the sea." },
      { de: "Die Ergebnisse werden nächste Woche veröffentlicht.", en: "The results will be published next week." },
    ],
    reviewStatus: "native-reviewed",
  },
  haben: {
    gloss: "to have",
    kind: "verb",
    lemma: "haben",
    explanation: "Haben expresses possession and is also the most common perfect-tense auxiliary for many verbs.",
    examples: [
      { de: "Wir haben heute genug Zeit.", en: "We have enough time today." },
      { de: "Sie haben einen Tisch reserviert.", en: "They have reserved a table." },
      { de: "Viele Menschen haben ähnliche Erfahrungen.", en: "Many people have similar experiences." },
    ],
    reviewStatus: "native-reviewed",
  },
  sein: {
    gloss: "to be; his; its",
    kind: "verb",
    lemma: "sein",
    explanation: "Sein is the infinitive of to be. Lowercase sein can also be a possessive word meaning his or its; sentence structure distinguishes the two.",
    examples: [
      { de: "Ich will ruhig sein.", en: "I want to be calm." },
      { de: "Sein Fahrrad ist neu.", en: "His bicycle is new." },
      { de: "Es ist schwer, geduldig zu sein, wenn man wartet.", en: "It is hard to be patient when you are waiting." },
    ],
    reviewStatus: "native-reviewed",
  },
  schon: {
    gloss: "already; soon (context-dependent)",
    usageNote: "The corpus form is context-dependent; it is not the adjective schön.",
    reviewStatus: "native-reviewed",
  },
  meine: {
    gloss: "my; mean (first-person singular form)",
    usageNote: "The form can be a possessive determiner or a form of meinen. The surrounding noun or clause is essential.",
    reviewStatus: "editor-reviewed",
  },
  gibt: {
    gloss: "gives; there is/are (in es gibt)",
    usageNote: "Gibt is a form of geben and appears in the fixed construction es gibt.",
    reviewStatus: "editor-reviewed",
  },
  soll: {
    gloss: "should; is supposed to",
    usageNote: "Soll is a modal verb form of sollen, not the noun target.",
    reviewStatus: "editor-reviewed",
  },
  gewissen: {
    gloss: "certain; a certain (inflected form)",
    kind: "adjective",
    usageNote: "The correct sense depends on the noun phrase. It is not a safe one-word equivalent of conscience.",
    reviewStatus: "editor-reviewed",
  },
  innerhalb: {
    gloss: "within",
    kind: "function",
    explanation: "A preposition.",
    reviewStatus: "editor-reviewed",
  },
  Jahren: {
    gloss: "years (dative plural form)",
    kind: "noun",
    lemma: "Jahr",
    explanation: "The dative plural form of Jahr, used for a period of years.",
    reviewStatus: "editor-reviewed",
  },
  Arm: {
    gloss: "arm",
    kind: "noun",
    usageNote: "The capitalized form means the body part. The lowercase adjective arm means poor.",
    reviewStatus: "editor-reviewed",
  },
  griff: {
    gloss: "grabbed; reached",
    kind: "verb",
    usageNote: "Griff is the past tense of greifen. It is not the noun Grip or handle.",
    reviewStatus: "editor-reviewed",
  },
  frage: {
    kind: "verb",
    usageNote: "Frage is the first-person form of fragen, to ask. It is not the noun question.",
    reviewStatus: "editor-reviewed",
  },
  tat: {
    kind: "verb",
    usageNote: "Tat is the past tense of tun, did. It is not the noun deed.",
    reviewStatus: "editor-reviewed",
  },
  tritt: {
    kind: "verb",
    usageNote: "Tritt is a present-tense form of treten, to step or kick. It is not the noun kick.",
    reviewStatus: "editor-reviewed",
  },
  // Lowercase corpus forms whose glosses are clearly nouns/adjectives — the
  // classifier can't see corpus casing, so fix the word-type labels here.
  leben: { kind: "noun" },
  sorgen: { kind: "noun" },
  wand: { kind: "noun" },
  unterschied: { kind: "noun" },
  liebe: { kind: "noun" },
  stelle: { kind: "noun" },
  begriff: { kind: "noun" },
  mal: { kind: "noun" },
  recht: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Jeder hat das Recht, frei seine Meinung zu sagen.", en: "Everyone has the right to say their opinion freely." },
      { level: "B2", de: "Ohne Anwalt kann man sein Recht schwer durchsetzen.", en: "Without a lawyer it is hard to assert one's rights." },
      { level: "C1", de: "Das neue Gesetz schützt das Recht auf Privatsphäre im Netz.", en: "The new law protects the right to privacy online." },
    ],
    reviewStatus: "editor-reviewed",
  },
  fest: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Zum Geburtstag gab es ein großes Fest im Garten.", en: "There was a big celebration in the garden for the birthday." },
      { level: "B2", de: "Die Stadt feiert jedes Jahr ein internationales Fest.", en: "The city hosts an international festival every year." },
      { level: "C1", de: "Beim Fest hielten die Gastgeber lange Reden auf die Gäste.", en: "At the festival the hosts gave long speeches to the guests." },
    ],
    reviewStatus: "editor-reviewed",
  },
  junge: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Der Junge lernt schnell Radfahren.", en: "The boy quickly learns to ride a bike." },
      { level: "B2", de: "Ein kleiner Junge fragt nach dem Weg zum Zoo.", en: "A little boy asks for the way to the zoo." },
      { level: "C1", de: "Der Junge las das dicke Buch, ohne ein einziges Wort zu überspringen.", en: "The boy read the thick book without skipping a single word." },
    ],
    reviewStatus: "editor-reviewed",
  },
  wert: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Gesundheit hat für mich den höchsten Wert.", en: "For me, health has the highest value." },
      { level: "B2", de: "Mit den Jahren verlor das alte Gerät deutlich an Wert.", en: "Over the years the old device clearly lost value." },
      { level: "C1", de: "Der Wert des Gemäldes ließ sich kaum noch in Geld bemessen.", en: "The value of the painting could hardly be measured in money anymore." },
    ],
    reviewStatus: "editor-reviewed",
  },
  schritt: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Er machte einen großen Schritt über den Bach.", en: "He took a big step over the stream." },
      { level: "B2", de: "Er ging Schritt für Schritt die steile Treppe hinauf.", en: "He went up the steep staircase step by step." },
      { level: "C1", de: "Der letzte Schritt zur eigenen Firma war der schwerste von allen.", en: "The last step toward owning the company was the hardest of all." },
    ],
    reviewStatus: "editor-reviewed",
  },
  ehe: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Die Ehe der beiden hielt fünfzig Jahre.", en: "The couple's marriage lasted fifty years." },
      { level: "B2", de: "In einer guten Ehe hört man einander wirklich zu.", en: "In a good marriage you truly listen to each other." },
      { level: "C1", de: "Das Gesetz regelte die Ehe lange ausschließlich zwischen Mann und Frau.", en: "For a long time the law defined marriage exclusively between a man and a woman." },
    ],
    reviewStatus: "editor-reviewed",
  },
  schloss: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Das alte Schloss liegt auf einem Hügel über dem Fluss.", en: "The old castle sits on a hill above the river." },
      { level: "B2", de: "Wir besichtigten das Schloss und den großen Garten dahinter.", en: "We visited the castle and the big garden behind it." },
      { level: "C1", de: "Im Schloss fanden früher rauschende Feste mit Musikern aus ganz Europa statt.", en: "In the castle there used to be lavish festivities with musicians from all over Europe." },
    ],
    reviewStatus: "editor-reviewed",
  },
  rede: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Seine Rede dauerte keine zehn Minuten.", en: "His speech lasted less than ten minutes." },
      { level: "B2", de: "Nach der Rede des Präsidenten gab es viele Fragen.", en: "After the president's speech there were many questions." },
      { level: "C1", de: "Die Rede wurde im ganzen Land live im Fernsehen übertragen.", en: "The speech was broadcast live on television across the whole country." },
    ],
    reviewStatus: "editor-reviewed",
  },
  verstand: {
    kind: "noun",
    examples: [
      { level: "A2", de: "Er hat viel Verstand und trifft kluge Entscheidungen.", en: "He has a lot of understanding and makes wise decisions." },
      { level: "B2", de: "Mit achtzig Jahren hatte sie noch einen klaren Verstand.", en: "At eighty she still had a sharp mind." },
      { level: "C1", de: "Vor Wut verlor er beinahe den Verstand.", en: "In anger he nearly lost his mind." },
    ],
    reviewStatus: "editor-reviewed",
  },
  armen: {
    kind: "adjective",
    examples: [
      { level: "A2", de: "Die armen Kinder brauchen neue Schuhe.", en: "The poor children need new shoes." },
      { level: "B2", de: "Er fütterte jeden Tag die armen Katzen hinter dem Haus.", en: "Every day he fed the poor cats behind the house." },
      { level: "C1", de: "Im Winter sorgte die Stadt besonders um die armen Alten in den Wohnungen.", en: "In winter the city especially cared for the poor elderly in their apartments." },
    ],
    reviewStatus: "editor-reviewed",
  },
  inneren: {
    kind: "adjective",
    examples: [
      { level: "A2", de: "Die inneren Räume des Hauses sind sehr kühl.", en: "The inner rooms of the house are very cool." },
      { level: "B2", de: "Trotz ihrer Ruhe zeigte sie nie ihre inneren Zweifel.", en: "Despite her calm she never showed her inner doubts." },
      { level: "C1", de: "Die inneren Mauern der alten Festung blieben über Jahrhunderte fast unberührt.", en: "The inner walls of the old fortress remained almost untouched for centuries." },
    ],
    reviewStatus: "editor-reviewed",
  },
  alten: { kind: "adjective" },
  deutschen: { kind: "adjective" },
  weg: { kind: "adverb" },
  los: { kind: "other" },
};

const functionWords = new Set("aber ab alle als also am an auch auf aus bei beim bis dadurch damit dann dass daß da dabei davor danach darum das dem den denn der des die dies diese dieser diesem dieses doch durch ein eine einem einen einer eines er es für gegen ich im in ja kein keine kann können mit mich mir nach nicht noch nur oder ohne so sondern über um und unter von vor war was weil wenn wie wir zu zum zur".split(" "));
const verbs = new Set("sein ist sind war waren sei habe hat haben hatte hatten bin bist wird werden wurde wurden würde würden kann können konnte muss müssen musste mussten soll sollen sollte wollte wollten will wollen möchte möchten darf dürfen durfte durften mag mögen meint meinen machte machen macht gemacht nahm nehmen nimmt sah sehen sieht sagen sagt sagte sprach sprechen spricht stand stehen steht blieb bleiben bleibt bringen bringt brachte geben gibt gab gehen geht ging gekommen kommen kommt kam lassen lässt ließ wissen weiß wusste tun tut tat zeigen zeigt halten hält hielt führen führt führte finden findet fand fragen fragt arbeiten arbeitet arbeitete leben lebt lernen lernt lesen liest las schreiben schrieb".split(" "));
const adverbs = new Set("ab allein anders bereits bisher dabei dann dort eigentlich einmal erst gerade gestern heute immer jetzt kaum leider mehr morgen nur noch nun oft plötzlich schon sehr später trotzdem wieder weiter zurück fast ganz gleich gar gern gerne häufig immerhin jedenfalls lediglich niemals nie offenbar recht schnell sofort schließlich sonst stets vorher vielleicht ziemlich".split(" "));
const adjectives = new Set("alt andere anderen anders arm arme bewusst bekannt bestimmt besser besondere besonders deutsch deutsche deutschen deutlich einfach eigene eigenen einzelner erste ersten entfernt ernst fest frei früh früher ganz ganze ganzen genug groß große großen gut hohen hoch inneren klar klein kleine kleinen kurz lang langen letzte letzten leicht lieb neue neu neuen möglich natürlich nahe notwendig offen politische politisch ruhig schlecht schön schwer sicher soziale stark wichtig weitere weiteren voll wahr wenig wenigen".split(" "));
const numbers = new Set("eins zwei drei vier fünf sechs sieben acht neun zehn hundert".split(" "));

function articleForGender(gender: "m" | "f" | "n") {
  return gender === "m" ? "der" : gender === "f" ? "die" : "das";
}

function classify(word: string): WordKind {
  if (curated[word]?.kind) return curated[word].kind as WordKind;
  if (nounInfo[word]) return "noun";
  if (numbers.has(word.toLowerCase())) return "number";
  if (functionWords.has(word.toLowerCase())) return "function";
  if (verbs.has(word.toLowerCase()) || /(?:en|ern|eln)$/.test(word)) return "verb";
  if (adverbs.has(word.toLowerCase())) return "adverb";
  if (adjectives.has(word.toLowerCase()) || /(?:ig|lich|isch|bar|sam|los)$/.test(word)) return "adjective";
  if (/^[A-ZÄÖÜ][a-zäöüß]+$/.test(word)) return "name";
  return "other";
}

function makeRecord(word: FrequencyWord): WordRecord {
  const note = curated[word.word];
  const noun = nounInfo[word.word];
  const kind = note?.kind ?? classify(word.word);
  const lemma = note?.lemma ?? noun?.lemma;
  const gloss = note?.gloss ?? word.gloss;
  const explanation = note?.explanation ?? buildExplanation(word.word, kind, gloss, noun);
  const rawExamples = note?.examples ?? buildExamples(word.word, kind, noun);
  // For curated notes, sort by CEFR score to ensure A2 ≤ B2 ≤ C1, then assign levels
  let withLevels: Example[];
  if (note?.examples) {
    const scored = [...rawExamples].sort((a, b) => cefrScore(a.de) - cefrScore(b.de));
    withLevels = scored.map((ex, i) => ({
      ...ex,
      sourceKind: (ex.sourceKind ?? "context-template") as Example["sourceKind"],
      level: (ex.level ?? (i === 0 ? "A2" : i === 1 ? "B2" : "C1")) as Example["level"],
    }));
    withLevels = withLevels.map((ex) => {
      const lvl = ex.level as "A2" | "B2" | "C1";
      if (!isMetaExample(ex)) return ex;
      return { ...fallbackForLevel(word.word, lvl, kind, noun, withLevels), level: lvl } as Example;
    });
    // Re-sort after fallback to keep monotonic
    withLevels = [...withLevels]
      .sort((a, b) => cefrScore(a.de) - cefrScore(b.de))
      .map((ex, i) => ({ ...ex, level: (i === 0 ? "A2" : i === 1 ? "B2" : "C1") as Example["level"] }));
  } else {
    withLevels = rawExamples as Example[];
  }
  const examples = withLevels.map((example) => ({
    ...example,
    sourceKind: example.sourceKind ?? "context-template",
  }));
  return {
    ...word,
    kind,
    gloss,
    lemma,
    article: noun ? (noun.number === "plural" ? "die" : articleForGender(noun.gender)) : undefined,
    nounNumber: noun?.number,
    explanation,
    examples,
    reviewStatus: note?.reviewStatus ?? "unreviewed",
    usageNote: note?.usageNote,
  };
}

export const records = frequencyWords.map(makeRecord);
export const recordByRank = new Map(records.map((record) => [record.rank, record]));

export function rankBand(rank: number) {
  if (rank <= 100) return "1–100";
  if (rank <= 500) return "101–500";
  return "501–1,000";
}

export function searchText(record: WordRecord) {
  return [
    record.word,
    record.lemma,
    record.gloss,
    record.explanation,
    record.usageNote,
    ...record.examples.flatMap((example) => [example.de, example.en]),
  ].filter(Boolean).join(" ").toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function clozeSentence(record: WordRecord) {
  const example = record.examples.find((item) => item.de.toLowerCase().includes(record.word.toLowerCase()));
  if (!example) return null;
  return example.de.replace(new RegExp(record.word, "i"), "_____");
}

export function isExerciseEligible(record: WordRecord) {
  return record.reviewStatus !== "unreviewed" && firstMeaning(record.gloss).length > 1;
}
