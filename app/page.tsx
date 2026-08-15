"use client";

import { useEffect, useMemo, useState } from "react";
import { nounInfo, type NounInfo } from "./nouns";
import { frequencyWords, type FrequencyWord } from "./words";

type Tab = "practice" | "explore" | "exercise" | "method";
type WordKind = "function" | "noun" | "verb" | "adjective" | "adverb" | "name" | "number" | "other";
type ProgressState = "learning" | "known";
type ExerciseMode = "meaning" | "context";

type Example = { de: string; en: string };
type WordNote = {
  gloss?: string;
  kind?: WordKind;
  lemma?: string;
  explanation?: string;
  examples?: Example[];
};

type WordRecord = FrequencyWord & {
  kind: WordKind;
  gloss: string;
  lemma?: string;
  article?: string;
  nounNumber?: "singular" | "plural";
  explanation: string;
  examples: Example[];
};

type ExerciseItem = {
  mode: ExerciseMode;
  base: WordRecord;
  options: WordRecord[];
  prompt: string;
};

const STORAGE_KEY = "german-1000-progress-v1";
const dailySize = 10;

const functionWords = new Set(
  `aber ab alle als also am an auch auf aus bei beim bis dadurch damit dann dass daß da dabei davor danach darum das dem den denn der des die dies diese dieser diesem dieses doch durch ein eine einem einen einer eines er es für gegen ich im in ja kein keine kann können mit mich mir nach nicht noch nur oder ohne so sondern über um und unter von vor war was weil wenn wie wir zu zum zur`.split(" "),
);

const verbForms = new Set(
  `sein ist sind war waren sei habe hat haben hatte hatten bin bist wird werden wurde wurden würde würden kann können konnte muss müssen musste mussten soll sollen sollte wollte wollten will wollen möchte möchten darf dürfen durfte durften mag mögen meint meinen machte machen macht gemacht nahm nehmen nimmt sah sehen sieht sagen sagt sagte sprach sprechen spricht stand stehen steht blieb bleiben bleibt bringen bringt brachte geben gibt gab gehen geht ging gekommen kommen kommt kam lassen lässt ließ wissen weiß wusste tun tut tat zeigen zeigt halten hält hielt führen führt führte finden findet fand fragen fragt arbeiten arbeitet arbeitete leben lebt lernen lernt lesen liest las schreiben schrieb`.split(" "),
);

const adverbs = new Set(
  `ab allein anders bereits bisher dabei dann dort eigentlich einmal erst gerade gestern heute immer jetzt kaum leider mehr morgen nur noch nun oft plötzlich schon sehr später trotzdem wieder weiter zurück fast ganz gleich gar gar gern gerne häufig immerhin jedenfalls lediglich niemals nie offenbar recht schnell sofort schließlich sonst stets vorher vielleicht ziemlich`.split(" "),
);

const adjectives = new Set(
  `alt andere anderen anders arm arme bewusst bekannt bestimmt besser besondere besonders deutsch deutsche deutschen deutlich einfach eigene eigenen einzelner erste ersten entfernt ernst fest frei früh früher ganz ganze ganzen genug groß große großen gut hohen hoch inneren klar klein kleine kleinen kurz lang langen letzte letzten leicht lieb neue neu neuen möglich natürlich nahe notwendig offen politische politisch ruhig schlecht schön schwer sicher soziale stark wichtig weitere weiteren voll wahr wenig wenigen`.split(" "),
);

const numberWords = new Set(`eins zwei drei vier fünf sechs sieben acht neun zehn hundert`.split(" "));

const notes: Record<string, WordNote> = {
  die: {
    gloss: "the; she; they (depending on context)",
    kind: "function",
    explanation: "Die is the definite article for feminine singular nouns and for all plural nouns. As a pronoun, it can also mean ‘she’ or ‘they’; the verb and context tell you which.",
    examples: [
      { de: "Die Frau wartet.", en: "The woman is waiting." },
      { de: "Die Kinder spielen draußen.", en: "The children are playing outside." },
      { de: "Die, die zuerst ankommen, reservieren den Tisch.", en: "Those who arrive first reserve the table." },
    ],
  },
  der: {
    gloss: "the; who/which (masculine nominative)",
    kind: "function",
    explanation: "Der is the definite article for masculine singular nouns in the nominative. It also appears as a relative pronoun meaning ‘who’ or ‘which’.",
    examples: [
      { de: "Der Mann liest.", en: "The man is reading." },
      { de: "Der Zug kommt um acht Uhr.", en: "The train arrives at eight." },
      { de: "Der Film, der gestern lief, war überraschend leicht.", en: "The film that was on yesterday was surprisingly light." },
    ],
  },
  das: {
    gloss: "the; that; it",
    kind: "function",
    explanation: "Das is the definite article for neuter singular nouns. It can also be a demonstrative (‘that’) or a pronoun (‘it’), so its role depends on what follows it.",
    examples: [
      { de: "Das Kind schläft.", en: "The child is sleeping." },
      { de: "Das ist mein Buch.", en: "That is my book." },
      { de: "Das, was du gesagt hast, ist wichtig.", en: "What you said is important." },
    ],
  },
  und: {
    gloss: "and",
    kind: "function",
    explanation: "Und links words, phrases, or whole clauses without changing the word order of the following main clause.",
    examples: [
      { de: "Ich trinke Tee und Wasser.", en: "I drink tea and water." },
      { de: "Sie arbeitet und lernt Deutsch.", en: "She works and learns German." },
      { de: "Er wollte kommen, und obwohl es spät war, blieb er lange.", en: "He wanted to come, and although it was late, he stayed for a long time." },
    ],
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
  },
  sie: {
    gloss: "she; they; you (formal)",
    kind: "function",
    explanation: "Sie is ambiguous in writing: lowercase sie can mean ‘she’ or ‘they’, while capitalized Sie means formal ‘you’. The verb and capitalization resolve the meaning.",
    examples: [
      { de: "Sie wohnt in Berlin.", en: "She lives in Berlin." },
      { de: "Sie kommen morgen.", en: "They are coming tomorrow." },
      { de: "Könnten Sie mir bitte erklären, wie das funktioniert?", en: "Could you please explain how this works?" },
    ],
  },
  zu: {
    gloss: "to; too; in order to",
    kind: "function",
    explanation: "Zu can mark direction (‘to’), form the infinitive with zu, or mean ‘too’ in the fixed spelling ‘zu viel’. The surrounding construction matters.",
    examples: [
      { de: "Ich gehe zu meiner Freundin.", en: "I am going to my girlfriend." },
      { de: "Es ist zu spät.", en: "It is too late." },
      { de: "Ich lerne jeden Tag, um sicherer zu sprechen.", en: "I study every day in order to speak more confidently." },
    ],
  },
  nicht: {
    gloss: "not",
    kind: "function",
    explanation: "Nicht negates a verb, adjective, adverb, or a whole clause. Its position changes with what exactly is being negated.",
    examples: [
      { de: "Ich komme nicht.", en: "I am not coming." },
      { de: "Das ist nicht schwer.", en: "That is not difficult." },
      { de: "Ich glaube nicht, dass er heute Zeit hat.", en: "I do not think that he has time today." },
    ],
  },
  sich: {
    gloss: "oneself; himself; herself; itself; themselves",
    kind: "function",
    explanation: "Sich is the third-person reflexive pronoun. It refers back to the subject: ‘er wäscht sich’ means ‘he washes himself’.",
    examples: [
      { de: "Er wäscht sich.", en: "He washes himself." },
      { de: "Sie interessiert sich für Kunst.", en: "She is interested in art." },
      { de: "Wer sich regelmäßig Zeit nimmt, lernt oft nachhaltiger.", en: "Whoever regularly makes time for themselves often learns more sustainably." },
    ],
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
  },
  mit: {
    gloss: "with; by means of",
    kind: "function",
    explanation: "Mit always takes the dative. It expresses accompaniment, instruments, or the means of transport used.",
    examples: [
      { de: "Ich komme mit dir.", en: "I am coming with you." },
      { de: "Wir fahren mit dem Zug.", en: "We are travelling by train." },
      { de: "Mit etwas Geduld lässt sich das Problem schnell lösen.", en: "With a little patience, the problem can be solved quickly." },
    ],
  },
  auf: {
    gloss: "on; onto; at",
    kind: "function",
    explanation: "Auf is a two-way preposition: dative usually describes a location, while accusative usually describes movement onto a surface or place.",
    examples: [
      { de: "Das Buch liegt auf dem Tisch.", en: "The book is on the table." },
      { de: "Ich lege das Buch auf den Tisch.", en: "I put the book on the table." },
      { de: "Auf dem Weg nach Hause habe ich über die Entscheidung nachgedacht.", en: "On the way home, I thought about the decision." },
    ],
  },
  für: {
    gloss: "for",
    kind: "function",
    explanation: "Für takes the accusative and usually marks the intended recipient, purpose, or duration of something.",
    examples: [
      { de: "Das Geschenk ist für dich.", en: "The gift is for you." },
      { de: "Ich bleibe für zwei Tage.", en: "I am staying for two days." },
      { de: "Für jemanden, der gerade anfängt, ist dieser Text ziemlich anspruchsvoll.", en: "For someone who is just starting, this text is quite demanding." },
    ],
  },
  werden: {
    gloss: "to become; will; be (passive auxiliary)",
    kind: "verb",
    lemma: "werden",
    explanation: "Werden is both a full verb (‘become’) and an auxiliary. It forms the future and the passive, so it is essential for reading longer German sentences.",
    examples: [
      { de: "Es wird dunkel.", en: "It is getting dark." },
      { de: "Wir werden morgen weiterarbeiten.", en: "We will continue working tomorrow." },
      { de: "Die Ergebnisse werden nächste Woche veröffentlicht.", en: "The results will be published next week." },
    ],
  },
  haben: {
    gloss: "to have",
    kind: "verb",
    lemma: "haben",
    explanation: "Haben expresses possession and is also the most common perfect-tense auxiliary for many verbs.",
    examples: [
      { de: "Ich habe Zeit.", en: "I have time." },
      { de: "Wir haben einen Tisch reserviert.", en: "We reserved a table." },
      { de: "Obwohl ich wenig geschlafen habe, kann ich mich gut konzentrieren.", en: "Although I slept little, I can concentrate well." },
    ],
  },
  sein: {
    gloss: "to be; his; its",
    kind: "verb",
    lemma: "sein",
    explanation: "Sein is the infinitive of ‘to be’. Lowercase sein can also be a possessive word meaning ‘his’ or ‘its’; the noun and sentence structure distinguish the two.",
    examples: [
      { de: "Ich will ruhig sein.", en: "I want to be calm." },
      { de: "Sein Fahrrad ist neu.", en: "His bicycle is new." },
      { de: "Es ist schwer, geduldig zu sein, wenn man auf eine Antwort wartet.", en: "It is hard to be patient when you are waiting for an answer." },
    ],
  },
  kann: {
    gloss: "can; is able to",
    kind: "verb",
    lemma: "können",
    explanation: "Kann is the first- or third-person singular present form of können. It expresses ability or possibility and sends a second verb to the end of the clause.",
    examples: [
      { de: "Ich kann schwimmen.", en: "I can swim." },
      { de: "Er kann heute nicht kommen.", en: "He cannot come today." },
      { de: "Wenn du möchtest, kann ich dir den Unterschied später erklären.", en: "If you want, I can explain the difference to you later." },
    ],
  },
  können: {
    gloss: "can; to be able to",
    kind: "verb",
    lemma: "können",
    explanation: "Können is a modal verb meaning ‘can’ or ‘be able to’. In a main clause, the conjugated form comes second and the infinitive goes to the end.",
    examples: [
      { de: "Wir können anfangen.", en: "We can start." },
      { de: "Kannst du mir helfen?", en: "Can you help me?" },
      { de: "Mit dieser Methode können Lernende neue Wörter länger behalten.", en: "With this method, learners can retain new words for longer." },
    ],
  },
  dass: {
    gloss: "that",
    kind: "function",
    explanation: "Dass introduces a subordinate clause. The conjugated verb normally moves to the end of that clause.",
    examples: [
      { de: "Ich weiß, dass du müde bist.", en: "I know that you are tired." },
      { de: "Sie sagt, dass sie später kommt.", en: "She says that she is coming later." },
      { de: "Es ist gut, dass wir diese Frage gemeinsam prüfen.", en: "It is good that we are examining this question together." },
    ],
  },
  weil: {
    gloss: "because",
    kind: "function",
    explanation: "Weil introduces a reason and normally sends the conjugated verb to the end of its subordinate clause.",
    examples: [
      { de: "Ich bleibe zu Hause, weil es regnet.", en: "I am staying at home because it is raining." },
      { de: "Sie lernt Deutsch, weil sie in Berlin arbeitet.", en: "She is learning German because she works in Berlin." },
      { de: "Weil die Zeit knapp war, mussten wir die Aufgabe gemeinsam lösen.", en: "Because time was short, we had to solve the task together." },
    ],
  },
  wenn: {
    gloss: "if; when",
    kind: "function",
    explanation: "Wenn introduces a condition or a repeated/expected time. It sends the conjugated verb to the end of the subordinate clause.",
    examples: [
      { de: "Wenn ich Zeit habe, lese ich.", en: "When I have time, I read." },
      { de: "Wenn es regnet, bleiben wir zu Hause.", en: "If it rains, we stay at home." },
      { de: "Wenn du regelmäßig übst, wird dir das Sprechen bald leichter fallen.", en: "If you practise regularly, speaking will soon become easier for you." },
    ],
  },
  aber: {
    gloss: "but; however",
    kind: "function",
    explanation: "Aber contrasts two ideas while leaving the normal word order in the second main clause unchanged.",
    examples: [
      { de: "Ich möchte kommen, aber ich bin müde.", en: "I would like to come, but I am tired." },
      { de: "Der Text ist kurz, aber nicht einfach.", en: "The text is short but not easy." },
      { de: "Sie hatte wenig Zeit, aber sie hat die Aufgabe trotzdem beendet.", en: "She had little time, but she finished the task anyway." },
    ],
  },
  Zeit: {
    gloss: "time",
    kind: "noun",
    lemma: "Zeit",
    explanation: "Die Zeit means ‘time’ in the general sense of available time, duration, or a historical period. Learn it with the feminine article die.",
    examples: [
      { de: "Ich habe Zeit.", en: "I have time." },
      { de: "Die Zeit vergeht schnell.", en: "Time passes quickly." },
      { de: "Obwohl die Zeit knapp war, haben wir die wichtigsten Fragen besprochen.", en: "Although time was short, we discussed the most important questions." },
    ],
  },
  Menschen: {
    gloss: "people; human beings",
    kind: "noun",
    lemma: "Mensch",
    explanation: "Die Menschen is the plural of der Mensch, ‘person’ or ‘human being’. The corpus form is plural, so learn it with die.",
    examples: [
      { de: "Die Menschen warten.", en: "The people are waiting." },
      { de: "Viele Menschen lernen Deutsch.", en: "Many people learn German." },
      { de: "Menschen, die regelmäßig lesen, begegnen oft neuen Ideen.", en: "People who read regularly often encounter new ideas." },
    ],
  },
  Frau: {
    gloss: "woman; Mrs.",
    kind: "noun",
    lemma: "Frau",
    explanation: "Die Frau means ‘woman’. It is also used before a surname as the polite title ‘Mrs.’ or ‘Ms.’.",
    examples: [
      { de: "Die Frau wartet.", en: "The woman is waiting." },
      { de: "Ich spreche mit der Frau.", en: "I am speaking with the woman." },
      { de: "Die Frau, die neben mir sitzt, arbeitet an einem ähnlichen Projekt.", en: "The woman sitting next to me is working on a similar project." },
    ],
  },
  Mann: {
    gloss: "man; husband",
    kind: "noun",
    lemma: "Mann",
    explanation: "Der Mann means ‘man’ and can also mean ‘husband’ when the relationship is clear from context.",
    examples: [
      { de: "Der Mann liest.", en: "The man is reading." },
      { de: "Ich kenne den Mann.", en: "I know the man." },
      { de: "Der Mann, mit dem sie gesprochen hat, kommt morgen wieder.", en: "The man she spoke with is coming back tomorrow." },
    ],
  },
  Haus: {
    gloss: "house; home; building",
    kind: "noun",
    lemma: "Haus",
    explanation: "Das Haus is a building or home. In the fixed expression nach Hause, the meaning is ‘homeward/to home’.",
    examples: [
      { de: "Das Haus ist groß.", en: "The house is big." },
      { de: "Ich gehe nach Hause.", en: "I am going home." },
      { de: "Obwohl das Haus alt ist, wurde es modern und nachhaltig renoviert.", en: "Although the house is old, it was renovated in a modern and sustainable way." },
    ],
  },
  gut: {
    gloss: "good; well",
    kind: "adjective",
    explanation: "Gut can describe a good thing or a person’s well-being. As an adverb, it often means ‘well’.",
    examples: [
      { de: "Das ist gut.", en: "That is good." },
      { de: "Sie spricht sehr gut Deutsch.", en: "She speaks German very well." },
      { de: "Obwohl der Anfang schwierig war, entwickelt sich das Projekt gut.", en: "Although the beginning was difficult, the project is developing well." },
    ],
  },
  machen: {
    gloss: "to do; to make",
    kind: "verb",
    lemma: "machen",
    explanation: "Machen is a broad everyday verb meaning ‘do’ or ‘make’. German uses it in many fixed combinations, such as eine Pause machen.",
    examples: [
      { de: "Was machst du?", en: "What are you doing?" },
      { de: "Wir machen eine Pause.", en: "We are taking a break." },
      { de: "Wenn du jeden Tag kleine Schritte machst, wird die Aufgabe überschaubarer.", en: "If you take small steps every day, the task becomes more manageable." },
    ],
  },
  gehen: {
    gloss: "to go; to walk",
    kind: "verb",
    lemma: "gehen",
    explanation: "Gehen means ‘to go’ or specifically ‘to walk’. It is also used in many expressions, such as Wie geht es dir? (‘How are you?’).",
    examples: [
      { de: "Ich gehe nach Hause.", en: "I am going home." },
      { de: "Wir gehen heute ins Kino.", en: "We are going to the cinema today." },
      { de: "Wenn alles gut geht, können wir die Arbeit morgen abschließen.", en: "If everything goes well, we can finish the work tomorrow." },
    ],
  },
  sprechen: {
    gloss: "to speak; to talk",
    kind: "verb",
    lemma: "sprechen",
    explanation: "Sprechen means ‘to speak’ or ‘to talk’. It is an irregular verb: du sprichst and er spricht.",
    examples: [
      { de: "Ich spreche Deutsch.", en: "I speak German." },
      { de: "Wir sprechen später darüber.", en: "We will talk about it later." },
      { de: "Obwohl sie nervös war, sprach sie klar und ruhig über das Problem.", en: "Although she was nervous, she spoke clearly and calmly about the problem." },
    ],
  },
  daß: {
    gloss: "that (older spelling of dass)",
    kind: "function",
    explanation: "Daß is the pre-1996 spelling of dass. You may still meet it in older books, quotations, or texts that preserve historical spelling.",
    examples: [
      { de: "Er sagte, daß er später komme.", en: "He said that he would come later." },
      { de: "In älteren Texten sieht man häufig die Schreibweise „daß“.", en: "In older texts, one often sees the spelling ‘daß’." },
      { de: "Wenn du moderne Texte liest, erkennst du „daß“ als historische Variante von „dass“.", en: "When you read modern texts, you can recognise ‘daß’ as a historical variant of ‘dass’." },
    ],
  },
  muß: {
    gloss: "must (older spelling of muss)",
    kind: "verb",
    lemma: "müssen",
    explanation: "Muß is the older spelling of muss, the first- or third-person singular form of müssen. Modern German normally writes muss with ss.",
    examples: [
      { de: "Ich muß heute arbeiten.", en: "I must work today." },
      { de: "Er sagt, daß er sofort gehen muß.", en: "He says that he must leave immediately." },
      { de: "In einem älteren Roman kann „muß“ vorkommen, obwohl man heute „muss“ schreibt.", en: "In an older novel, ‘muß’ may occur even though modern spelling uses ‘muss’." },
    ],
  },
};

const articleForGender = (gender: "m" | "f" | "n") => (gender === "m" ? "der" : gender === "f" ? "die" : "das");
const accusativeArticle = (gender: "m" | "f" | "n") => (gender === "m" ? "den" : gender === "f" ? "die" : "das");

function isProperName(word: string) {
  return word.length > 1 && word[0] === word[0].toUpperCase() && !nounInfo[word] && !/^[A-ZÄÖÜ][a-zäöüß]+$/.test(word);
}

function classify(word: FrequencyWord): WordKind {
  const note = notes[word.word];
  if (note?.kind) return note.kind;
  if (nounInfo[word.word]) return "noun";
  if (numberWords.has(word.word.toLowerCase())) return "number";
  if (functionWords.has(word.word.toLowerCase())) return "function";
  if (verbForms.has(word.word.toLowerCase()) || /(?:en|ern|eln)$/.test(word.word)) return "verb";
  if (adverbs.has(word.word.toLowerCase())) return "adverb";
  if (adjectives.has(word.word.toLowerCase()) || /(?:ig|lich|isch|bar|sam|los)$/.test(word.word)) return "adjective";
  if (isProperName(word.word)) return "name";
  return "other";
}

function defaultExamples(word: FrequencyWord, kind: WordKind, gloss: string, noun: NounInfo | undefined, lemma?: string): Example[] {
  const token = word.word;
  if (kind === "noun" && noun) {
    const nounLemma = lemma ?? noun.lemma;
    if (noun.number === "plural") {
      return [
        { de: `Das sind die ${token}.`, en: `These are the ${gloss}.` },
        { de: `Viele ${token} sind heute unterwegs.`, en: `Many ${gloss} are out today.` },
        { de: `Obwohl die ${token} unterschiedlich sind, haben sie ein gemeinsames Ziel.`, en: `Although the ${gloss} are different, they have a common goal.` },
      ];
    }
    const article = articleForGender(noun.gender);
    const acc = accusativeArticle(noun.gender);
    return [
      { de: `Das ist ${article} ${nounLemma}.`, en: `This is ${article} ${nounLemma}.` },
      { de: `Ich sehe ${acc} ${nounLemma}.`, en: `I see the ${nounLemma}.` },
      { de: `Obwohl ${article} ${nounLemma} klein ist, spielt es eine wichtige Rolle.`, en: `Although the ${nounLemma} is small, it plays an important role.` },
    ];
  }
  if (kind === "verb") {
    const base = lemma ?? token;
    if (/en$/.test(base)) {
      return [
        { de: `Ich kann ${base}.`, en: `I can ${gloss.toLowerCase()}.` },
        { de: `Wir wollen heute ${base}.`, en: `We want to ${gloss.toLowerCase()} today.` },
        { de: `Obwohl wir wenig Zeit haben, versuchen wir, ${base} zu üben.`, en: `Although we have little time, we try to practise ${gloss.toLowerCase()}.` },
      ];
    }
    return [
      { de: `Im Text steht: „${token}.“`, en: `The text says: “${token}.”` },
      { de: `Er sagt, dass er „${token}“ gelesen hat.`, en: `He says that he has read “${token}”.` },
      { de: `Wenn du „${token}“ siehst, achte auf die Person und die Zeitform.`, en: `When you see “${token}”, pay attention to the subject and tense.` },
    ];
  }
  if (kind === "adjective") {
    return [
      { de: `Das ist ${token}.`, en: `That is ${gloss.toLowerCase()}.` },
      { de: `Der Satz ist ${token}.`, en: `The sentence is ${gloss.toLowerCase()}.` },
      { de: `Auch wenn die Situation ${token} wirkt, lohnt sich ein genauer Blick.`, en: `Even if the situation seems ${gloss.toLowerCase()}, it is worth a closer look.` },
    ];
  }
  if (kind === "adverb") {
    return [
      { de: `Er kommt ${token}.`, en: `He comes ${gloss.toLowerCase()}.` },
      { de: `Wir treffen uns ${token} wieder.`, en: `We will meet again ${gloss.toLowerCase()}.` },
      { de: `Wenn du ${token} übst, erkennst du das Wort leichter im Gespräch.`, en: `If you practise ${token}, you will recognise the word more easily in conversation.` },
    ];
  }
  return [
    { de: `„${token}“ ist ein häufiges Wort im Deutschen.`, en: `“${token}” is a common word in German.` },
    { de: `Du hörst oder liest „${token}“ oft im Alltag.`, en: `You often hear or read “${token}” in everyday German.` },
    { de: `Wenn du „${token}“ in einem längeren Satz siehst, prüfe seine Funktion und den Kontext.`, en: `When you see “${token}” in a longer sentence, check its function and the context.` },
  ];
}

function makeRecord(word: FrequencyWord): WordRecord {
  const note = notes[word.word];
  const noun = nounInfo[word.word];
  const kind = classify(word);
  const gloss = note?.gloss ?? (word.gloss || "common German word");
  const lemma = note?.lemma ?? noun?.lemma;
  const article = noun ? (noun.number === "plural" ? "die" : articleForGender(noun.gender)) : undefined;
  const defaultExplanation = noun
    ? `${article} ${noun.lemma} is a ${noun.gender === "m" ? "masculine" : noun.gender === "f" ? "feminine" : "neuter"} noun meaning “${gloss}”. The ranked form is ${noun.number === "plural" ? "plural" : "singular"}; learn the article with the noun.`
    : kind === "verb"
      ? `${word.word} is a frequent verb form meaning “${gloss}”. German verbs change with the subject and tense; when the form is inflected, the related infinitive is ${lemma ?? "shown in context"}.`
      : kind === "function"
        ? `${word.word} is a high-frequency function word. It helps build meaning through word order, case, connection, or negation; the closest everyday sense here is “${gloss}”.`
        : `${word.word} is a frequent ${kind === "name" ? "proper name or place name" : kind} meaning “${gloss}”. Its exact sense can shift with the sentence around it.`;
  return {
    ...word,
    kind,
    gloss,
    lemma,
    article,
    nounNumber: noun?.number,
    explanation: note?.explanation ?? defaultExplanation,
    examples: note?.examples ?? defaultExamples(word, kind, gloss, noun, lemma),
  };
}

const records = frequencyWords.map(makeRecord);

function germanVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^de[-_]DE$/i.test(voice.lang)) ?? voices.find((voice) => /^de[-_]/i.test(voice.lang));
}

function speak(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "de-DE";
  utterance.rate = 0.78;
  const voice = germanVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function displayWord(record: WordRecord) {
  if (record.kind === "noun" && record.article) {
    const nounForm = record.nounNumber === "plural" ? record.word : record.lemma ?? record.word;
    return `${record.article} ${nounForm}`;
  }
  return record.word;
}

function rankBand(rank: number) {
  if (rank <= 100) return "1–100";
  if (rank <= 500) return "101–500";
  return "501–1,000";
}

function AudioButton({ word, compact = false }: { word: string; compact?: boolean }) {
  return (
    <button className={`sound-button ${compact ? "sound-button-compact" : ""}`} type="button" title="Play with a German voice" aria-label={`Listen in German: ${word}`} onClick={() => speak(word)}>
      <span aria-hidden="true">◖</span><span className="sr-only">Listen</span>
    </button>
  );
}

function WordExamples({ record, compact = false }: { record: WordRecord; compact?: boolean }) {
  const levels = ["Simple", "Everyday", "Complex"];
  return (
    <div className={`examples ${compact ? "examples-compact" : ""}`}>
      {record.examples.map((example, index) => (
        <div className="example" key={`${record.rank}-${index}`}>
          <span className="example-index">0{index + 1}</span>
          <div className="example-copy"><span className="example-level">{levels[index] ?? "Use"}</span><p className="example-de">{example.de}</p><p className="example-en">{example.en}</p></div>
          <AudioButton word={example.de} compact />
        </div>
      ))}
    </div>
  );
}

function WordCard({ record, progress, onMark }: { record: WordRecord; progress?: ProgressState; onMark?: (rank: number, state: ProgressState) => void }) {
  return (
    <article className="word-card">
      <div className="word-card-topline"><span className="rank">#{String(record.rank).padStart(3, "0")}</span><span className="band">{rankBand(record.rank)}</span>{progress && <span className={`status ${progress}`}>{progress === "known" ? "known" : "learning"}</span>}</div>
      <div className="word-heading-row"><div><h3>{displayWord(record)}</h3>{record.lemma && record.lemma !== record.word && <p className="surface-note">corpus form: {record.word} · base: {record.lemma}</p>}</div><AudioButton word={displayWord(record)} compact /></div>
      <p className="word-gloss">{record.gloss}</p>
      <p className="word-explanation">{record.explanation}</p>
      <details className="word-details"><summary>See 3 usage examples <span>↓</span></summary><WordExamples record={record} compact /></details>
      {onMark && <div className="card-actions"><button className="button button-subtle" type="button" onClick={() => onMark(record.rank, "learning")}>Again</button><button className="button button-dark" type="button" onClick={() => onMark(record.rank, "known")}>I know it</button></div>}
    </article>
  );
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><span style={{ width: `${value}%` }} /></div>;
}

function readProgress(): Record<number, ProgressState> {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Record<number, ProgressState>) : {};
  } catch {
    return {};
  }
}

function firstMeaning(gloss: string) {
  return gloss.split(/[;,/]/)[0].trim();
}

function meaningIsUsable(record: WordRecord) {
  const meaning = firstMeaning(record.gloss);
  return meaning.length > 1 && !/[;,/?]/.test(record.gloss) && !/^(common|unknown|the|a|an|to|of|in|on|for|one)$/i.test(meaning);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clozeSentence(record: WordRecord) {
  const sentence = record.examples[0]?.de ?? "";
  const targets = [record.word, record.lemma].filter((value): value is string => Boolean(value));
  for (const target of targets) {
    const matcher = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(target)})(?=$|[^\\p{L}])`, "iu");
    if (matcher.test(sentence)) return sentence.replace(matcher, "$1____");
  }
  return undefined;
}

function exerciseOptions(base: WordRecord, pool: WordRecord[], mode: ExerciseMode) {
  const selected: WordRecord[] = [];
  const candidates = pool.filter((candidate) => candidate.rank !== base.rank && candidate.lemma !== base.lemma).sort((a, b) => Math.abs(a.rank - base.rank) - Math.abs(b.rank - base.rank));
  for (const candidate of candidates) {
    if (mode === "meaning") {
      const candidateMeaning = firstMeaning(candidate.gloss).toLowerCase();
      const usedMeanings = [firstMeaning(base.gloss), ...selected.map((item) => firstMeaning(item.gloss))].map((value) => value.toLowerCase());
      if (!meaningIsUsable(candidate) || usedMeanings.some((meaning) => meaning === candidateMeaning || meaning.includes(candidateMeaning) || candidateMeaning.includes(meaning))) continue;
    }
    if (selected.some((item) => item.word === candidate.word)) continue;
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  return [base, ...selected].sort((a, b) => ((a.rank * 17) % 23) - ((b.rank * 17) % 23));
}

function buildExerciseBank(mode: ExerciseMode): ExerciseItem[] {
  const pool = mode === "meaning" ? records.filter(meaningIsUsable) : records.filter((record) => Boolean(clozeSentence(record)));
  const bank: ExerciseItem[] = [];
  for (const base of pool) {
    const options = exerciseOptions(base, pool, mode);
    if (options.length !== 4) continue;
    const prompt = mode === "meaning" ? firstMeaning(base.gloss) : clozeSentence(base);
    if (!prompt) continue;
    bank.push({ mode, base, options, prompt });
  }
  return bank;
}

const meaningExerciseBank = buildExerciseBank("meaning");
const contextExerciseBank = buildExerciseBank("context");
const fallbackExercise: ExerciseItem = {
  mode: "meaning",
  base: records[0],
  options: records.slice(0, 4),
  prompt: "the",
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("practice");
  const [progress, setProgress] = useState<Record<number, ProgressState>>(readProgress);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [search, setSearch] = useState("");
  const [band, setBand] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("meaning");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseResult, setExerciseResult] = useState<"correct" | "wrong" | null>(null);
  const [exerciseChoice, setExerciseChoice] = useState<number | null>(null);
  const [germanVoiceAvailable, setGermanVoiceAvailable] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoiceState = () => setGermanVoiceAvailable(Boolean(germanVoice()));
    const initialCheck = window.setTimeout(updateVoiceState, 0);
    window.speechSynthesis.addEventListener("voiceschanged", updateVoiceState);
    return () => {
      window.clearTimeout(initialCheck);
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoiceState);
    };
  }, []);

  const mastered = Object.values(progress).filter((state) => state === "known").length;
  const learning = Object.values(progress).filter((state) => state === "learning").length;
  const completion = Math.round((mastered / records.length) * 100);
  const daily = useMemo(() => {
    const unseen = records.filter((record) => !progress[record.rank]);
    const relearn = records.filter((record) => progress[record.rank] === "learning");
    return [...relearn, ...unseen].slice(0, dailySize);
  }, [progress]);
  const current = daily[sessionIndex] ?? daily[0] ?? records[0];

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !query || [record.word, record.lemma, record.gloss, record.explanation, ...record.examples.flatMap((example) => [example.de, example.en])].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesBand = band === "all" || rankBand(record.rank) === band;
      const matchesKind = kindFilter === "all" || record.kind === kindFilter;
      return matchesSearch && matchesBand && matchesKind;
    });
  }, [band, kindFilter, search]);
  const pageSize = 12;
  const visibleRecords = filteredRecords.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const exerciseBank = exerciseMode === "meaning" ? meaningExerciseBank : contextExerciseBank;
  const safeExerciseBank = exerciseBank.length ? exerciseBank : [fallbackExercise];
  const exercise = safeExerciseBank[exerciseIndex % safeExerciseBank.length];

  function mark(rank: number, state: ProgressState) {
    setProgress((old) => ({ ...old, [rank]: state }));
    if (rank === current.rank) {
      setRevealed(false);
      if (sessionIndex < daily.length - 1) setSessionIndex((index) => index + 1);
    }
  }

  function resetSearch() {
    setSearch("");
    setBand("all");
    setKindFilter("all");
    setPage(0);
    setShowAll(false);
  }

  function nextExercise() {
    setExerciseChoice(null);
    setExerciseResult(null);
    setExerciseIndex((index) => index + 1);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setTab("practice")}><span className="brand-mark">de</span><span>GERMAN 1000</span></button>
        <nav className="topnav" aria-label="Primary navigation">{([['practice', 'Today'], ['explore', 'Explore'], ['exercise', 'Exercises'], ['method', 'Method']] as [Tab, string][]).map(([key, label], index) => <button key={key} type="button" className={tab === key ? "active" : ""} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}><span className="nav-index">0{index + 1}</span><span>{label}</span></button>)}</nav>
        <div className="top-progress"><span>{mastered}/1,000</span><ProgressBar value={completion} /></div>
      </header>

      <section className="hero"><div className="hero-copy"><p className="eyebrow">FREQUENCY-FIRST GERMAN</p><h1>The first 1,000 words, turned into practice.</h1><p className="hero-deck">A quiet vocabulary studio for learning high-frequency German through active recall, context, and return visits.</p><div className="hero-actions"><button className="button button-dark" type="button" onClick={() => { setTab("practice"); setSessionIndex(0); setRevealed(false); }}>Start today&apos;s set <span>→</span></button><button className="text-button" type="button" onClick={() => setTab("method")}>Why frequency? <span>↗</span></button><span className={`audio-note ${germanVoiceAvailable ? "ready" : ""}`}><span className="audio-dot" />{germanVoiceAvailable ? "German voice ready" : "German audio"}</span></div></div><div className="hero-note"><span className="hero-note-number">63.2%</span><span>coverage at rank 1,000<br /><small>in this written corpus</small></span></div></section>

      <section className="stat-row" aria-label="Vocabulary statistics"><div><span className="stat-value">1,000</span><span className="stat-label">ranked forms</span></div><div><span className="stat-value">3,000</span><span className="stat-label">usage examples</span></div><div><span className="stat-value">{mastered}</span><span className="stat-label">marked known</span></div><div><span className="stat-value">{learning}</span><span className="stat-label">in the loop</span></div></section>

      {tab === "practice" && <section className="content-section practice-section"><div className="section-heading"><div><p className="eyebrow">TODAY&apos;S SET · {daily.length} WORDS</p><h2>Recall before recognition.</h2></div><span className="section-count">{Math.min(sessionIndex + 1, daily.length)} / {daily.length}</span></div><div className="practice-layout"><div className="practice-card"><div className="practice-card-top"><span>RANK #{String(current.rank).padStart(3, "0")}</span><span>{current.kind}</span></div><div className="practice-word"><h3>{displayWord(current)}</h3><AudioButton word={displayWord(current)} /></div><p className="prompt">What does this mean? Say it or write it down before revealing.</p>{!revealed ? <button className="reveal-button" type="button" onClick={() => setRevealed(true)}>Reveal meaning <span>↓</span></button> : <div className="reveal-content"><p className="reveal-gloss">{current.gloss}</p><p className="reveal-explanation">{current.explanation}</p><WordExamples record={current} /></div>}{revealed && <div className="card-actions"><button className="button button-subtle" type="button" onClick={() => mark(current.rank, "learning")}>Again</button><button className="button button-dark" type="button" onClick={() => mark(current.rank, "known")}>I know it</button></div>}</div><aside className="practice-aside"><p className="eyebrow">HOW TO USE THIS</p><h3>Make the answer effortful.</h3><p>Look at the German form. Try to produce the meaning, then say one sentence of your own. Reveal only after the attempt.</p><div className="aside-rule" /><p className="small-muted">Your marks stay in this browser. German audio is selected when your device provides a German voice.</p></aside></div><div className="progress-callout"><div><span className="eyebrow">OVERALL PROGRESS</span><strong>{completion}% of the list marked known</strong></div><ProgressBar value={completion} /></div></section>}

      {tab === "explore" && <section className="content-section"><div className="section-heading"><div><p className="eyebrow">THE LIST</p><h2>Explore the corpus.</h2></div><span className="section-count">{filteredRecords.length.toLocaleString()} results</span></div><div className="filters"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search the vocabulary</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search German, English, or an idea" /></label><select value={band} onChange={(event) => { setBand(event.target.value); setPage(0); }} aria-label="Filter by rank"><option value="all">All ranks</option><option value="1–100">Top 100</option><option value="101–500">101–500</option><option value="501–1,000">501–1,000</option></select><select value={kindFilter} onChange={(event) => { setKindFilter(event.target.value); setPage(0); }} aria-label="Filter by word type"><option value="all">All types</option><option value="noun">Nouns</option><option value="verb">Verbs</option><option value="function">Function words</option><option value="adjective">Adjectives</option><option value="adverb">Adverbs</option></select><button type="button" className={`view-toggle ${showAll ? "active" : ""}`} aria-pressed={showAll} onClick={() => { setShowAll((value) => !value); setPage(0); }}>{showAll ? "Use pages" : `Show all ${filteredRecords.length.toLocaleString()}`}</button>{(search || band !== "all" || kindFilter !== "all") && <button type="button" className="clear-button" onClick={resetSearch}>Clear</button>}</div><div className="list-summary"><span>{showAll ? `Showing all ${filteredRecords.length.toLocaleString()} matching forms.` : "Each card has an explanation, article note, and three examples."}</span>{showAll && <button type="button" className="text-button" onClick={() => { setShowAll(false); setPage(0); }}>Back to pages</button>}</div><div className="list-grid">{(showAll ? filteredRecords : visibleRecords).map((record) => <WordCard key={record.rank} record={record} progress={progress[record.rank]} onMark={mark} />)}</div>{visibleRecords.length === 0 && <div className="empty-state">No words match that search.</div>}{!showAll && <div className="pagination"><button type="button" className="button button-subtle" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>← Previous</button><span>Page {page + 1} of {totalPages}</span><button type="button" className="button button-subtle" disabled={page >= totalPages - 1} onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}>Next →</button></div>}</section>}

      {tab === "exercise" && <section className="content-section exercise-section"><div className="section-heading"><div><p className="eyebrow">ACTIVE RECALL</p><h2>Choose the word.</h2></div><span className="section-count">{exerciseIndex % safeExerciseBank.length + 1} / {safeExerciseBank.length}</span></div><div className="exercise-switcher" role="group" aria-label="Exercise type"><button type="button" className={exerciseMode === "meaning" ? "active" : ""} aria-pressed={exerciseMode === "meaning"} onClick={() => { setExerciseMode("meaning"); setExerciseChoice(null); setExerciseResult(null); }}>Meaning</button><button type="button" className={exerciseMode === "context" ? "active" : ""} aria-pressed={exerciseMode === "context"} onClick={() => { setExerciseMode("context"); setExerciseChoice(null); setExerciseResult(null); }}>Sentence context</button></div><div className="exercise-card"><div className="exercise-topline"><span>{exercise.mode === "meaning" ? "ENGLISH CUE" : "FILL THE BLANK"}</span><span>CHECKED ANSWER</span></div><p className="eyebrow">{exercise.mode === "meaning" ? "WHICH GERMAN WORD MEANS" : "WHICH WORD FITS BEST"}</p><h3 className={exercise.mode === "context" ? "context-prompt" : ""}>{exercise.prompt}</h3><p className="exercise-context">Ranked #{exercise.base.rank}. Choose before you check. All four options have distinct answers.</p><div className="choice-grid">{exercise.options.map((option) => <button key={option.rank} type="button" className={`choice ${exerciseChoice === option.rank ? (exerciseResult === "correct" ? "correct" : "wrong") : ""}`} aria-pressed={exerciseChoice === option.rank} onClick={() => { setExerciseChoice(option.rank); setExerciseResult(option.rank === exercise.base.rank ? "correct" : "wrong"); }}><span>{displayWord(option)}</span><small>#{String(option.rank).padStart(3, "0")}</small></button>)}</div>{exerciseResult && <div className={`feedback ${exerciseResult === "correct" ? "feedback-good" : "feedback-wrong"}`}><strong>{exerciseResult === "correct" ? "Correct." : `The answer is ${displayWord(exercise.base)}.`}</strong><div className="feedback-answer"><AudioButton word={displayWord(exercise.base)} compact /><span>{exercise.base.gloss} · rank #{exercise.base.rank}</span></div><span>{exercise.base.explanation}</span><WordExamples record={exercise.base} compact /></div>}<div className="exercise-actions"><button type="button" className="button button-dark" onClick={nextExercise}>Next exercise <span>→</span></button>{exerciseResult && <button type="button" className="button button-subtle" onClick={() => speak(displayWord(exercise.base))}>Hear answer</button>}</div></div><div className="exercise-note"><strong>Why this format?</strong><span>Meaning mode checks one clear gloss against distinct distractors. Sentence context makes you retrieve the exact form from a real German example. Both reveal the explanation and all three levels of usage after your choice.</span></div></section>}

      {tab === "method" && <section className="content-section method-section"><div className="section-heading"><div><p className="eyebrow">READ THIS FIRST</p><h2>A frequency list is a map, not a promise.</h2></div></div><div className="method-grid"><article><span className="method-number">01</span><h3>What is ranked here?</h3><p>These are the first 1,000 cleaned German one-word forms from a Google Books Ngram list built from books published between 2010 and 2019. The list preserves forms such as <em>hatte</em> and <em>Menschen</em> instead of silently turning everything into an infinitive or singular lemma.</p></article><article><span className="method-number">02</span><h3>Why not claim 80%?</h3><p>Coverage depends on corpus, genre, time period, and whether you count forms or lemmas. In this source list, the first 1,000 forms account for about 63.2% of tokens in its corpus. Spoken conversation and a lemmatized list can produce different curves.</p></article><article><span className="method-number">03</span><h3>Why these exercises?</h3><p>Retrieval practice asks you to produce an answer instead of only rereading one. Spacing that effort across separate visits makes the same amount of study more durable than concentrating it in one sitting.</p></article></div><div className="sources-block"><p className="eyebrow">SOURCES & NOTES</p><a href="https://github.com/orgtre/google-books-ngram-frequency" target="_blank" rel="noreferrer">Google Books Ngram frequency project <span>↗</span></a><a href="https://wortschatz.uni-leipzig.de/en/download/" target="_blank" rel="noreferrer">Leipzig Corpora Collection <span>↗</span></a><a href="https://www.sketchengine.eu/german-word-list/" target="_blank" rel="noreferrer">Sketch Engine: lemmatized vs. non-lemmatized lists <span>↗</span></a><a href="https://pdf.retrievalpractice.org/SpacingGuide.pdf" target="_blank" rel="noreferrer">Carpenter & Agarwal, spaced retrieval practice guide <span>↗</span></a><a href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum" target="_blank" rel="noreferrer">WCAG 2.2 target-size guidance <span>↗</span></a><a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event" target="_blank" rel="noreferrer">MDN: loading the right speech voice <span>↗</span></a><p className="source-footnote">Translations are short learning glosses, not full dictionary entries. Examples are written for this study tool and prioritise simple-to-complex usage. Touch controls use larger targets, examples use native disclosure, and audio requests a German locale plus a matching device voice when available.</p></div></section>}

      <footer className="footer"><span>German 1000 · built for returning, not cramming.</span><button type="button" onClick={() => { setProgress({}); setSessionIndex(0); setRevealed(false); setExerciseIndex(0); setExerciseChoice(null); setExerciseResult(null); }}>Reset local progress</button></footer>
    </main>
  );
}
