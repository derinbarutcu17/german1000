import tatoebaExamples from "./tatoeba-examples.json";
import type { NounInfo } from "../nouns";
import type { WordKind, Example } from "./records";

type ExampleSeed = Omit<Example, "sourceKind"> & { sourceKind: "tatoeba" | "context-template" };

const template = (de: string, en: string): ExampleSeed => ({ de, en, sourceKind: "context-template" });

const specialExamples: Record<string, ExampleSeed[]> = {
  Abbildung: [
    template("Abbildung 7 zeigt alle Teile des Motors.", "Figure 7 shows all the parts of the motor."),
    template("Auf der Abbildung erkennt man drei verschiedene Wege.", "The illustration shows three different routes."),
    template("Die Abbildung hilft beim Verständnis des Versuchs.", "The diagram helps with understanding the experiment."),
  ],
  Blut: [
    template("Nach dem Unfall verlor er viel Blut und musste sofort versorgt werden.", "After the accident, he lost a lot of blood and had to be treated immediately."),
    template("Der Arzt untersucht das Blut im Labor.", "The doctor examines the blood in the laboratory."),
    template("Blut ist für den Körper lebenswichtig.", "Blood is vital for the body."),
  ],
  Krieg: [
    template("Der Krieg dauerte länger als erwartet.", "The war lasted longer than expected."),
    template("Der Krieg zwang viele Familien, ihre Heimat zu verlassen.", "The war forced many families to leave their home."),
    template("Sie sprach nur ungern über den Krieg.", "She was reluctant to talk about the war."),
  ],
  gleiche: [
    template("Wir haben die gleiche Idee.", "We have the same idea."),
    template("Sie trägt heute die gleiche Jacke wie gestern.", "She is wearing the same jacket today as yesterday."),
    template("Wir wählen die gleiche Richtung und nehmen denselben Weg.", "We choose the same direction and take the same path."),
  ],
  gleichen: [
    template("Die beiden Bilder gleichen einander sehr.", "The two pictures look very much alike."),
    template("Die Zwillinge gleichen sich trotz ihrer unterschiedlichen Frisuren.", "The twins look alike despite their different hairstyles."),
    template("In diesem Punkt gleichen sich die beiden Vorschläge.", "The two proposals are alike in this respect."),
  ],
  innerhalb: [
    template("Innerhalb von zwei Wochen muss der Antrag eingereicht werden.", "The application must be submitted within two weeks."),
    template("Wir bleiben innerhalb der markierten Fläche.", "We are staying inside the marked area."),
    template("Der Zug kommt innerhalb einer Stunde an.", "The train arrives within an hour."),
  ],
  konnten: [
    template("Wir konnten den Weg nicht finden.", "We could not find the way."),
    template("Die Kinder konnten lange draußen spielen.", "The children were able to play outside for a long time."),
    template("Konnten Sie die Datei öffnen?", "Were you able to open the file?"),
  ],
  ist: [
    template("Der Kaffee ist noch heiß.", "The coffee is still hot."),
    template("Heute ist der Himmel ganz klar.", "The sky is completely clear today."),
    template("Das ist genau der richtige Moment.", "This is exactly the right moment."),
  ],
  Zeit: [
    template("Ich habe heute keine Zeit.", "I do not have time today."),
    template("Die Zeit vergeht schnell.", "Time passes quickly."),
    template("Wir brauchen mehr Zeit für die Aufgabe.", "We need more time for the task."),
  ],
  Geld: [
    template("Ich habe heute kein Geld dabei.", "I do not have any money with me today."),
    template("Das Geld liegt in der Schublade.", "The money is in the drawer."),
    template("Wir sparen Geld für die Reise.", "We are saving money for the trip."),
  ],
  gibt: [
    template("In diesem Café gibt es frischen Kuchen.", "This café has fresh cake."),
    template("Heute gibt es viel zu tun.", "There is a lot to do today."),
    template("Der Weg gibt einen schönen Blick auf den See frei.", "The path opens up a beautiful view of the lake."),
  ],
  meine: [
    template("Meine Schwester kommt morgen.", "My sister is coming tomorrow."),
    template("Ich meine es ernst.", "I mean it."),
    template("Was meine ich damit?", "What do I mean by that?"),
  ],
  schon: [
    template("Ich bin schon zu Hause.", "I am already home."),
    template("Schon morgen beginnt der Kurs.", "The course starts as soon as tomorrow."),
    template("Das wird schon gut gehen.", "It will be all right."),
  ],
  soll: [
    template("Er sagt, ich soll die Tür schließen.", "He says I should close the door."),
    template("Was soll ich jetzt tun?", "What should I do now?"),
    template("Der Brief soll heute ankommen.", "The letter is supposed to arrive today."),
  ],
  gewissen: [
    template("Mit einem gewissen Abstand wirkt das Bild ruhiger.", "The picture feels calmer from a certain distance."),
    template("Er hat einen gewissen Einfluss auf die Entscheidung.", "He has a certain influence on the decision."),
    template("Nach einer gewissen Zeit wurde es still.", "After a certain amount of time, it became quiet."),
  ],
  inneren: [
    template("Im Inneren des Hauses ist es ruhig.", "It is quiet inside the house."),
    template("Die inneren Türen bleiben geschlossen.", "The inner doors remain closed."),
    template("Sie spürte einen tiefen Schmerz im Inneren.", "She felt a deep pain inside."),
  ],
  Hause: [
    template("Ich bleibe heute zu Hause.", "I am staying home today."),
    template("Wir sind schon zu Hause.", "We are already home."),
    template("Nach Hause ist es nicht weit.", "It is not far home."),
  ],
  Lebens: [
    template("Im Laufe des Lebens verändert sich vieles.", "A lot changes over the course of life."),
    template("Diese Entscheidung war ein wichtiger Moment meines Lebens.", "This decision was an important moment in my life."),
    template("Die Qualität des Lebens hängt nicht nur vom Geld ab.", "Quality of life does not depend only on money."),
  ],
  Herrn: [
    template("Ich habe Herrn Weber gestern getroffen.", "I met Mr Weber yesterday."),
    template("Der Brief ist an Herrn Müller adressiert.", "The letter is addressed to Mr Müller."),
    template("Wir danken Herrn Bauer für seine Hilfe.", "We thank Mr Bauer for his help."),
  ],
  Gottes: [
    template("Viele Menschen sprechen über die Liebe Gottes.", "Many people talk about the love of God."),
    template("Gottes Name steht über dem Eingang.", "God's name is above the entrance."),
    template("Die Geschichte erzählt von Gottes großer Geduld.", "The story tells of God's great patience."),
  ],
  willen: [
    template("Um des Friedens willen bleiben wir ruhig.", "For the sake of peace, we remain calm."),
    template("Um ihrer Kinder willen nahm sie den weiten Weg auf sich.", "For the sake of her children, she took the long journey."),
    template("Um der Freundschaft willen änderte sie den Plan.", "For the sake of friendship, she changed the plan."),
  ],
  wand: [
    template("Das Bild hängt an der Wand.", "The picture is hanging on the wall."),
    template("An der Wand steht eine hohe Lampe.", "A tall lamp stands by the wall."),
    template("Wir streichen die Wand morgen weiß.", "We are painting the wall white tomorrow."),
  ],
  unterschied: [
    template("Der Unterschied ist sofort sichtbar.", "The difference is immediately visible."),
    template("Zwischen den beiden Bildern gibt es einen kleinen Unterschied.", "There is a small difference between the two pictures."),
    template("Der Preis macht für uns keinen großen Unterschied.", "The price does not make a big difference to us."),
  ],
  armen: [
    template("Die armen Kinder brauchen Hilfe.", "The poor children need help."),
    template("Er hilft den armen Familien im Viertel.", "He helps the poor families in the neighborhood."),
    template("Viele Menschen denken an die Armen.", "Many people think of the poor."),
  ],
  jungen: [
    template("Die jungen Leute warten draußen.", "The young people are waiting outside."),
    template("Er hilft den jungen Musikern.", "He helps the young musicians."),
    template("Die jungen Bäume wachsen schnell.", "The young trees grow quickly."),
  ],
  europäischen: [
    template("In den europäischen Ländern gelten unterschiedliche Regeln.", "Different rules apply in the European countries."),
    template("Die Debatte über die europäischen Werte geht weiter.", "The debate about European values continues."),
    template("Mit den europäischen Partnern beginnt ein neues Projekt.", "A new project is starting with the European partners."),
  ],
  jeweiligen: [
    template("Bitte beachten Sie die jeweiligen Fristen.", "Please observe the respective deadlines."),
    template("Die jeweiligen Teams treffen sich am Montag.", "The respective teams are meeting on Monday."),
    template("In den jeweiligen Ländern gelten andere Regeln.", "Different rules apply in the respective countries."),
  ],
  dritten: [
    template("Am dritten Tag begann die Reise.", "The journey began on the third day."),
    template("Im dritten Kapitel wird die Idee erklärt.", "The idea is explained in the third chapter."),
    template("Wir treffen uns im dritten Stock.", "We are meeting on the third floor."),
  ],
  wenigen: [
    template("Mit wenigen Worten war alles gesagt.", "Everything was said in just a few words."),
    template("In wenigen Tagen beginnt der Urlaub.", "The holiday begins in a few days."),
    template("Nur wenigen Menschen ist der Weg bekannt.", "Only a few people know the way."),
  ],
  // — Relevant, CEFR-tiered overrides (A2 → B2 → C1)
  tragen: [
    template("Ich will heute ein blaues Hemd tragen.", "I want to wear a blue shirt today."),
    template("Wir müssen auf der Wanderung schwere Rucksäcke tragen.", "We have to carry heavy backpacks on the hike."),
    template("Obwohl sie wenig geschlafen hat, will sie die Verantwortung für das ganze Team tragen.", "Although she has had little sleep, she wants to carry responsibility for the whole team."),
  ],
  trägt: [
    template("Er trägt heute einen Anzug.", "He is wearing a suit today."),
    template("Sie trägt die Tasche für ihre Freundin.", "She is carrying the bag for her friend."),
    template("Er trägt maßgeblich zum Erfolg des Projekts bei, auch wenn das kaum jemand sieht.", "He contributes significantly to the project's success, even though hardly anyone notices."),
  ],
  trug: [
    template("Er trug gestern eine Mütze.", "He wore a cap yesterday."),
    template("Sie trug den Koffer bis zur Tür.", "She carried the suitcase to the door."),
    template("Er trug die Idee lange mit sich, bevor er sie endlich aussprach.", "He carried the idea with him for a long time before finally voicing it."),
  ],
  getragen: [
    template("Ich habe das Kleid oft getragen.", "I have worn the dress often."),
    template("Der Tisch wurde von zwei Personen getragen.", "The table was carried by two people."),
    template("Die Entscheidung wurde von allen Beteiligten gemeinsam getragen.", "The decision was jointly supported by everyone involved."),
  ],
};

const prepositionExamples: Record<string, ExampleSeed[]> = {
  in: [template("Ich wohne in Berlin.", "I live in Berlin."), template("Wir gehen in den Park.", "We are going into the park."), template("In der Küche steht ein großer Tisch.", "There is a large table in the kitchen.")],
  zu: [template("Ich gehe zu Fuß nach Hause.", "I walk home."), template("Es ist zu spät für einen Kaffee.", "It is too late for a coffee."), template("Sie versucht, ruhig zu bleiben.", "She is trying to remain calm.")],
  von: [template("Der Brief ist von meiner Schwester.", "The letter is from my sister."), template("Wir kommen gerade von der Arbeit.", "We are just coming from work."), template("Das ist ein Geschenk von ihm.", "That is a gift from him.")],
  mit: [template("Wir fahren mit dem Zug.", "We are travelling by train."), template("Kommst du mit mir zum Markt?", "Are you coming to the market with me?"), template("Mit etwas Geduld gelingt der Plan.", "With a little patience, the plan will succeed.")],
  auf: [template("Das Buch liegt auf dem Tisch.", "The book is on the table."), template("Sie wartet auf den Bus.", "She is waiting for the bus."), template("Auf dem Markt kaufe ich frisches Brot.", "I buy fresh bread at the market.")],
  an: [template("Das Bild hängt an der Wand.", "The picture is hanging on the wall."), template("Wir treffen uns an der Ecke.", "We are meeting at the corner."), template("Am Abend denke ich an meine Familie.", "In the evening I think about my family.")],
  nach: [template("Nach der Arbeit gehe ich nach Hause.", "I go home after work."), template("Morgen fahren wir nach Hamburg.", "Tomorrow we are travelling to Hamburg."), template("Nach dem Essen trinken wir Tee.", "We drink tea after the meal.")],
  bei: [template("Bei Regen bleiben wir zu Hause.", "We stay home when it rains."), template("Sie arbeitet bei einer kleinen Firma.", "She works at a small company."), template("Bei diesem Licht kann ich gut lesen.", "I can read well in this light.")],
  durch: [template("Wir gehen durch den Park.", "We are walking through the park."), template("Durch das Fenster fällt warmes Licht.", "Warm light comes through the window."), template("Er löst das Problem durch Geduld.", "He solves the problem through patience.")],
  über: [template("Wir sprechen über den Film.", "We are talking about the film."), template("Die Brücke führt über den Fluss.", "The bridge leads over the river."), template("Über dem Tisch hängt eine Lampe.", "A lamp hangs above the table.")],
  vor: [template("Vor dem Haus steht ein Fahrrad.", "A bicycle is standing in front of the house."), template("Vor dem Schlafengehen lese ich.", "I read before going to sleep."), template("Sie wartet vor der Tür.", "She is waiting in front of the door.")],
  unter: [template("Die Katze schläft unter dem Tisch.", "The cat is sleeping under the table."), template("Unter Freunden spricht man offen.", "Among friends, people speak openly."), template("Unter diesen Bedingungen bleiben wir hier.", "Under these conditions, we will stay here.")],
  gegen: [template("Der Zug kommt gegen acht Uhr an.", "The train arrives around eight o'clock."), template("Wir spielen morgen gegen die Nachbarn.", "We are playing against the neighbors tomorrow."), template("Gegen den Wind kommt man nur langsam voran.", "You can only make slow progress against the wind.")],
  ohne: [template("Ohne dich wäre die Reise nicht möglich.", "The trip would not be possible without you."), template("Er geht ohne Mantel nach draußen.", "He goes outside without a coat."), template("Ohne Kaffee beginnt mein Tag langsam.", "Without coffee, my day starts slowly.")],
  bis: [template("Ich arbeite heute bis sechs Uhr.", "I am working until six today."), template("Bis morgen ist der Bericht fertig.", "The report will be ready by tomorrow."), template("Wir warten bis zum Abend.", "We are waiting until the evening.")],
  um: [template("Wir treffen uns um acht Uhr.", "We are meeting at eight o'clock."), template("Die Kinder laufen um den See.", "The children run around the lake."), template("Es geht darum, eine gute Lösung zu finden.", "The point is to find a good solution.")],
  ab: [template("Ab morgen fahre ich mit dem Bus.", "From tomorrow, I will take the bus."), template("Der Kurs beginnt ab Montag.", "The course starts on Monday."), template("Ab hier wird der Weg schmaler.", "From here, the path becomes narrower.")],
  zwischen: [template("Zwischen den Terminen bleibt eine Stunde frei.", "There is an hour free between the appointments."), template("Das Café liegt zwischen Bahnhof und Museum.", "The café is between the station and the museum."), template("Zwischen uns ist alles geklärt.", "Everything between us is settled.")],
  neben: [template("Neben dem Fenster steht eine Pflanze.", "A plant is standing next to the window."), template("Sie sitzt neben ihrem Bruder.", "She is sitting next to her brother."), template("Neben der Arbeit bleibt wenig Zeit.", "There is little time left besides work.")],
  hinter: [template("Hinter dem Haus wächst ein Baum.", "A tree is growing behind the house."), template("Der Ball liegt hinter der Tür.", "The ball is behind the door."), template("Hinter dieser Entscheidung steckt ein guter Grund.", "There is a good reason behind this decision.")],
  gegenüber: [template("Gegenüber dem Bahnhof liegt ein Café.", "There is a café opposite the station."), template("Sie sitzt mir gegenüber.", "She is sitting opposite me."), template("Gegenüber früher ist der Raum heller.", "Compared with before, the room is brighter.")],
  trotz: [template("Trotz des Regens gehen wir spazieren.", "Despite the rain, we are going for a walk."), template("Trotz seiner Angst blieb er ruhig.", "Despite his fear, he remained calm."), template("Trotz allem finden wir eine Lösung.", "Despite everything, we will find a solution.")],
  wegen: [template("Wegen des Sturms bleibt der Zug stehen.", "The train stops because of the storm."), template("Wir bleiben wegen des Wetters zu Hause.", "We are staying home because of the weather."), template("Wegen ihrer Arbeit kommt sie später.", "She is coming later because of her work.")],
  außer: [template("Außer mir war niemand im Raum.", "Nobody except me was in the room."), template("Alle kommen außer Peter.", "Everyone is coming except Peter."), template("Außerhalb der Stadt wird es ruhiger.", "Outside the city, it becomes quieter.")],
  aufgrund: [template("Aufgrund des Wetters fällt das Fest aus.", "The festival is cancelled because of the weather."), template("Aufgrund seiner Erfahrung bekam er den Auftrag.", "He got the assignment because of his experience."), template("Die Straße ist aufgrund der Baustelle gesperrt.", "The road is closed because of the construction work.")],
  entgegen: [template("Entgegen allen Erwartungen gewann das Team.", "Contrary to all expectations, the team won."), template("Sie kam ihm entgegen und lächelte.", "She came toward him and smiled."), template("Entgegen dem Rat blieb er dort.", "Contrary to the advice, he stayed there.")],
  statt: [template("Statt des Autos nahm sie den Zug.", "Instead of the car, she took the train."), template("Wir kochen heute statt zu bestellen.", "We are cooking today instead of ordering in."), template("Statt einer Antwort kam nur ein Lächeln.", "Instead of an answer, there was only a smile.")],
};

const prepositions = new Set(Object.keys(prepositionExamples).concat(["innerhalb", "außerhalb"]));
const conjunctions = new Set("und aber oder dass daß wenn weil denn sondern als obwohl während bevor nachdem indem falls sobald sodass sowie wobei entweder weder sowohl".split(" "));
const pronouns = new Set("ich du er sie es wir ihr man sich mich mir dich dir ihn ihm uns euch ihnen wer was niemand jemand nichts alles selbst beide einige alle deren dessen welcher welche welches welchen welchem jene jener jenes".split(" "));
const determiners = new Set("der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner keines diese dieser dieses diesem diesen jener jene jenes jenen jeder jede jedes jedem jeden mein meine meinen meinem meiner meines dein deine deinen deinem deiner deines sein seine seinen seinem seiner seines ihr ihre ihren ihrem ihrer ihres unser unsere unseren unserem unserer unseres euer eure euren eurem eurer eures".split(" "));
const adverbGroups: Record<string, string[]> = {
  time: "heute morgen jetzt später bald vorher danach inzwischen bereits gerade zunächst einmal wieder schon immer nie oft selten manchmal stets bisher weiterhin erneut".split(" "),
  place: "hier dort überall draußen drinnen links rechts oben unten hinein hinaus zurück weg hin herum vorbei".split(" "),
  degree: "mehr sehr ganz fast kaum ziemlich genug besonders völlig".split(" "),
  manner: "langsam schnell gern gerne leise direkt sofort plötzlich gemeinsam zugleich anders weiter".split(" "),
};
const adverbs = new Set(Object.values(adverbGroups).flat().concat(["nun", "also", "wohl", "jedoch", "allerdings", "deshalb", "daher", "trotzdem", "dennoch", "jedenfalls", "offenbar", "vermutlich", "eigentlich", "leider", "wenigstens", "überhaupt", "bloß", "recht", "gar", "mal", "bitte", "nein", "ja", "ach", "na"]));
const adjectiveForms = new Set("gut schlechte schlecht schön neue neu alte alten alter alte große großen groß kleine kleinen kleiner kurzen kurz lange lang längere länger einfache einfach wichtige wichtigen wichtig besondere besonders eigenen eigene eigenes eigener weitere weiteren deutsche deutschen europäischen politischen soziale sozialen inneren jungen armen dritten jeweiligen gewissen bestimmte bestimmten klar deutlich ruhig frei ernst bekannt möglich notwendig bewusst nahe entfernt reich".split(" "));
const pastPluralVerbs = new Set("waren hatten wurden mussten konnten wollten sollten kamen gingen standen lagen blieben brachten fanden nahmen sagten zeigten machten arbeiteten spielten".split(" "));
const participles = new Set("gewesen geworden gemacht gesehen gegeben genommen gefunden gebracht gesprochen verstanden getan gedacht gegangen gekommen gefallen verloren verbunden verwendet erklärt entwickelt gestellt".split(" "));

const verbSpecific: Record<string, ExampleSeed[]> = {
  war: [template("Gestern war der Park ganz still.", "Yesterday the park was completely quiet."), template("Es war ein langer Tag.", "It was a long day."), template("Sie war schon zu Hause.", "She was already home.")],
  sind: [template("Wir sind schon unterwegs.", "We are already on our way."), template("Die Fenster sind offen.", "The windows are open."), template("Heute sind alle pünktlich.", "Everyone is on time today.")],
  werden: [template("Die Tage werden wieder länger.", "The days are getting longer again."), template("Wir werden morgen weiterarbeiten.", "We will continue working tomorrow."), template("Die Ergebnisse werden nächste Woche veröffentlicht.", "The results will be published next week.")],
  wird: [template("Es wird langsam dunkel.", "It is slowly getting dark."), template("Der Brief wird heute verschickt.", "The letter will be sent today."), template("Aus der Idee wird ein echtes Projekt.", "The idea is becoming a real project.")],
  hat: [template("Sie hat heute frei.", "She has the day off today."), template("Der Raum hat zwei Fenster.", "The room has two windows."), template("Er hat die Nachricht gelesen.", "He has read the message.")],
  haben: [template("Wir haben genug Zeit.", "We have enough time."), template("Sie haben den Zug verpasst.", "They missed the train."), template("Viele Menschen haben ähnliche Erfahrungen.", "Many people have similar experiences.")],
  hatte: [template("Er hatte gestern keine Zeit.", "He did not have time yesterday."), template("Sie hatte einen guten Plan.", "She had a good plan."), template("Das Zimmer hatte nur ein Fenster.", "The room had only one window.")],
  habe: [template("Ich habe eine Idee.", "I have an idea."), template("Ich habe den Schlüssel gefunden.", "I found the key."), template("Heute habe ich viel Arbeit.", "I have a lot of work today.")],
  kann: [template("Ich kann dir helfen.", "I can help you."), template("Das kann heute klappen.", "That might work today."), template("Sie kann sehr gut kochen.", "She can cook very well.")],
  können: [template("Wir können morgen starten.", "We can start tomorrow."), template("Sie können die Datei hier öffnen.", "You can open the file here."), template("Kinder können erstaunlich geduldig sein.", "Children can be surprisingly patient.")],
  konnte: [template("Sie konnte den Weg allein finden.", "She was able to find the way alone."), template("Ich konnte gestern nicht schlafen.", "I could not sleep yesterday."), template("Er konnte die Frage nicht beantworten.", "He could not answer the question.")],
  konnten: specialExamples.konnten,
  könnte: [template("Das könnte heute klappen.", "That could work today."), template("Könnte ich bitte eine Frage stellen?", "Could I ask a question, please?"), template("Sie könnte später kommen.", "She could come later.")],
  könnten: [template("Könnten Sie mir bitte helfen?", "Could you please help me?"), template("Wir könnten morgen zusammen kochen.", "We could cook together tomorrow."), template("Das könnten gute Nachrichten sein.", "That could be good news.")],
  muss: [template("Ich muss jetzt los.", "I have to leave now."), template("Du musst die Tür schließen.", "You have to close the door."), template("Es muss eine Lösung geben.", "There must be a solution.")],
  müssen: [template("Wir müssen heute früh anfangen.", "We have to start early today."), template("Alle müssen warten.", "Everyone has to wait."), template("Sie müssen den Antrag unterschreiben.", "They have to sign the application.")],
  musste: [template("Ich musste gestern lange arbeiten.", "I had to work for a long time yesterday."), template("Sie musste den Termin absagen.", "She had to cancel the appointment."), template("Er musste schnell nach Hause.", "He had to get home quickly.")],
  mussten: [template("Wir mussten auf den Bus warten.", "We had to wait for the bus."), template("Die Kinder mussten früh schlafen gehen.", "The children had to go to bed early."), template("Sie mussten den Plan ändern.", "They had to change the plan.")],
  soll: specialExamples.soll,
  sollte: [template("Du solltest mehr Wasser trinken.", "You should drink more water."), template("Der Brief sollte heute ankommen.", "The letter should arrive today."), template("Sie sollte von dem Plan wissen.", "She should know about the plan.")],
  sollten: [template("Wir sollten bald anfangen.", "We should start soon."), template("Die Gäste sollten um acht kommen.", "The guests should come at eight."), template("Sie sollten diese Möglichkeit prüfen.", "They should consider this possibility.")],
  will: [template("Ich will heute früh schlafen.", "I want to sleep early today."), template("Sie will nach Berlin ziehen.", "She wants to move to Berlin."), template("Er will die Wahrheit wissen.", "He wants to know the truth.")],
  wollte: [template("Ich wollte dich gerade anrufen.", "I was just about to call you."), template("Sie wollte den Film sehen.", "She wanted to see the film."), template("Er wollte nicht darüber sprechen.", "He did not want to talk about it.")],
  wollten: [template("Wir wollten am Wochenende wandern.", "We wanted to go hiking at the weekend."), template("Sie wollten den Zug nehmen.", "They wanted to take the train."), template("Die Kinder wollten länger bleiben.", "The children wanted to stay longer.")],
  würde: [template("Ich würde gern mitkommen.", "I would like to come along."), template("Das würde vieles erleichtern.", "That would make many things easier."), template("Sie würde die Chance nutzen.", "She would take the opportunity.")],
  würden: [template("Wir würden gern helfen.", "We would be happy to help."), template("Sie würden den Weg erklären.", "They would explain the way."), template("Die Kinder würden draußen spielen.", "The children would play outside.")],
  wäre: [template("Das wäre eine gute Idee.", "That would be a good idea."), template("Es wäre besser, früher zu starten.", "It would be better to start earlier."), template("Sie wäre gern dabei.", "She would like to be there.")],
  hätte: [template("Ich hätte gern einen Kaffee.", "I would like a coffee."), template("Das hätte ich nicht erwartet.", "I would not have expected that."), template("Sie hätte mehr Zeit gebraucht.", "She would have needed more time.")],
  bin: [template("Ich bin gleich zurück.", "I will be back soon."), template("Ich bin heute zu Hause.", "I am at home today."), template("Ich bin mit dem Ergebnis zufrieden.", "I am satisfied with the result.")],
  bist: [template("Du bist heute sehr ruhig.", "You are very quiet today."), template("Bist du schon fertig?", "Are you finished already?"), template("Du bist nicht allein.", "You are not alone.")],
  sei: [template("Sei bitte vorsichtig.", "Please be careful."), template("Er sagt, ich sei zu spät.", "He says that I am too late."), template("Sei geduldig mit dir.", "Be patient with yourself.")],
  sagte: [template("Er sagte die Wahrheit.", "He told the truth."), template("Sie sagte, dass sie später kommt.", "She said that she would come later."), template("Niemand sagte ein Wort.", "Nobody said a word.")],
  sagen: [template("Wir sagen morgen Bescheid.", "We will let you know tomorrow."), template("Was willst du sagen?", "What do you want to say?"), template("Man kann es einfach sagen.", "You can simply say it.")],
  fragt: [template("Sie fragt nach dem Weg.", "She asks for directions."), template("Er fragt seine Schwester.", "He asks his sister."), template("Wer fragt, bekommt eine Antwort.", "Those who ask get an answer.")],
  fragte: [template("Er fragte nach dem Preis.", "He asked about the price."), template("Sie fragte, ob alles fertig sei.", "She asked whether everything was ready."), template("Niemand fragte nach dem Grund.", "Nobody asked about the reason.")],
  frage: [template("Ich frage später noch einmal.", "I will ask again later."), template("Ich frage nach dem Weg.", "I ask for directions."), template("Ich frage dich nach dem Weg.", "I ask you for directions.")],
  sehen: [template("Wir sehen den See vom Fenster aus.", "We can see the lake from the window."), template("Ich möchte diesen Film sehen.", "I would like to see this film."), template("Man kann die Berge von hier sehen.", "You can see the mountains from here.")],
  sieht: [template("Sie sieht den Fehler sofort.", "She sees the mistake immediately."), template("Das sieht gut aus.", "That looks good."), template("Er sieht heute müde aus.", "He looks tired today.")],
  sah: [template("Er sah einen Vogel im Garten.", "He saw a bird in the garden."), template("Sie sah mich überrascht an.", "She looked at me in surprise."), template("Ich sah den Zug gerade noch.", "I just saw the train in time.")],
  ging: [template("Sie ging langsam nach Hause.", "She walked home slowly."), template("Er ging früh ins Bett.", "He went to bed early."), template("Die Tür ging plötzlich auf.", "The door suddenly opened.")],
  gehen: [template("Wir gehen morgen spazieren.", "We are going for a walk tomorrow."), template("Ich muss jetzt gehen.", "I have to leave now."), template("Die Kinder gehen gern in den Park.", "The children like going to the park.")],
  kommt: [template("Der Bus kommt in fünf Minuten.", "The bus is coming in five minutes."), template("Sie kommt morgen zu Besuch.", "She is coming to visit tomorrow."), template("Alles kommt zur richtigen Zeit.", "Everything comes at the right time.")],
  kommen: [template("Wir kommen gegen acht Uhr.", "We are coming around eight o'clock."), template("Kannst du morgen kommen?", "Can you come tomorrow?"), template("Viele Gäste kommen mit dem Zug.", "Many guests are coming by train.")],
  machen: [template("Wir machen heute eine Pause.", "We are taking a break today."), template("Was möchtest du machen?", "What would you like to do?"), template("Die Kinder machen ihre Hausaufgaben.", "The children are doing their homework.")],
  macht: [template("Sie macht heute das Abendessen.", "She is making dinner today."), template("Das macht den Unterschied.", "That makes the difference."), template("Er macht gern Musik.", "He likes making music.")],
  lassen: [template("Wir lassen das Fenster offen.", "We are leaving the window open."), template("Lass uns später sprechen.", "Let us talk later."), template("Sie lässt den Schlüssel auf dem Tisch.", "She leaves the key on the table.")],
  wissen: [template("Ich möchte die Antwort wissen.", "I would like to know the answer."), template("Wir wissen noch nicht, wann der Zug kommt.", "We do not know yet when the train is coming."), template("Niemand kann alles wissen.", "Nobody can know everything.")],
  arbeiten: [template("Wir arbeiten heute im Büro.", "We are working in the office today."), template("Sie arbeitet gern mit Kindern.", "She likes working with children."), template("Nach dem Essen arbeiten wir weiter.", "We will continue working after the meal.")],
  lernen: [template("Es ist nie zu spät, Deutsch zu lernen.", "It is never too late to learn German."), template("Die Kinder lernen schnell.", "The children learn quickly."), template("Wir lernen aus unseren Fehlern.", "We learn from our mistakes.")],
  lesen: [template("Ich lese gerade ein gutes Buch.", "I am reading a good book right now."), template("Sie liest die Nachricht noch einmal.", "She is reading the message again."), template("Wir lesen gern am Abend.", "We like reading in the evening.")],
  schreiben: [template("Ich schreibe dir morgen.", "I will write to you tomorrow."), template("Sie schreibt einen kurzen Brief.", "She is writing a short letter."), template("Wir schreiben die Adresse auf.", "We are writing down the address.")],
  sprechen: [template("Wir sprechen morgen darüber.", "We will talk about it tomorrow."), template("Sie spricht sehr leise.", "She speaks very quietly."), template("Die beiden sprechen über ihre Reise.", "The two of them are talking about their trip.")],
  lachen: [template("Wir lachen über den Witz.", "We are laughing at the joke."), template("Die Kinder lachen laut.", "The children are laughing loudly."), template("Sie musste trotz allem lachen.", "She had to laugh despite everything.")],
  brauchen: [template("Wir brauchen mehr Zeit.", "We need more time."), template("Ich brauche deine Hilfe.", "I need your help."), template("Sie brauchen keinen Termin.", "They do not need an appointment.")],
};

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanSourceExamples(word: string, kind: WordKind): ExampleSeed[] {
  const candidates = (tatoebaExamples as Record<string, Example[]>)[word] ?? [];
  const obscureRe = /(?:Portier|Koffer|häufiges Wort|hörst oder liest|prüfe die Funktion|Achte auf den Kontext)/iu;
  const scored = candidates
    .filter((example) => {
      const wordCount = example.de.trim().split(/\s+/u).length;
      return wordCount >= 5 && wordCount <= 26 && wordUsedAsRecord(example.de, word, usedAsNounKind(kind)) && !obscureRe.test(example.de);
    })
    .map((example) => {
      const wc = example.de.trim().split(/\s+/u).length;
      const hasRare = /Portier|Trinkgeld|Gepäck|verdienst|verdient/i.test(example.de) ? 5 : 0;
      const isNominalized = /^[A-ZÄÖÜ]/.test(word) ? 0 : new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(example.de) && /[A-Z]/.test(example.de.charAt(example.de.indexOf(word))) ? 3 : 0;
      const score = wc + hasRare + isNominalized + (example.de.includes(",") ? 0.5 : 0);
      return { example, score, wc };
    })
    .sort((a, b) => a.score - b.score || a.wc - b.wc)
    .map(({ example }) => ({ ...example, sourceKind: example.sourceKind ?? ("tatoeba" as const) }));
  return scored;
}

function hasExactWord(sentence: string, word: string) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\p{L}\\p{M}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{M}\\p{N}])`, "iu").test(sentence);
}

// The record word must appear in the sentence in a casing consistent with its
// word type: nouns and names need an uppercase occurrence (German nouns are
// capitalized); lowercase forms (verbs, adjectives, function words) need a
// lowercase occurrence or a sentence-initial capital. Stops homographs
// bleeding across senses ("verfahren" the verb vs "das Verfahren" the noun).
export function wordUsedAsRecord(sentence: string, word: string, asNoun = false) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[^\\p{L}\\p{M}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{M}\\p{N}])`, "giu");
  const needUpper = asNoun || /^[A-ZÄÖÜ]/.test(word);
  for (const match of sentence.matchAll(re)) {
    const index = (match.index ?? 0) + (match[0].length - match[1].length);
    const first = match[1].slice(0, 1);
    const isUpper = /^[A-ZÄÖÜ]/.test(first);
    const before = sentence.slice(0, index).trimEnd();
    const sentenceStart = before === "" || /[.!?;:]\s*$/.test(before);
    if (needUpper ? isUpper : !isUpper || sentenceStart) return true;
  }
  return false;
}

function usedAsNounKind(kind: WordKind) {
  return kind === "noun" || kind === "name";
}

function nounExamples(word: string, noun: NounInfo): ExampleSeed[] {
  const form = capitalise(noun.number === "plural" ? word : noun.lemma);
  if (noun.number === "plural") {
    return [
      template(`Viele ${form} spielen in der Geschichte eine wichtige Rolle.`, `Many ${noun.lemma.toLowerCase()} play an important role in the story.`),
      template(`Ich sehe die ${form} schon von weitem.`, `I can already see the ${noun.lemma.toLowerCase()} from a distance.`),
      template(`Wir sprechen heute über die ${form}.`, `Today we are talking about the ${noun.lemma.toLowerCase()}.`),
    ];
  }
  const article = noun.gender === "m" ? "der" : noun.gender === "f" ? "die" : "das";
  const accusative = noun.gender === "m" ? "den" : article;
  return [
    template(`${capitalise(article)} ${form} ist heute wichtig.`, `The ${noun.lemma.toLowerCase()} is important today.`),
    template(`Ich denke oft an ${accusative} ${form}.`, `I often think about the ${noun.lemma.toLowerCase()}.`),
    template(`Wir sprechen heute über ${accusative} ${form}.`, `Today we are talking about the ${noun.lemma.toLowerCase()}.`),
  ];
}

function numberExamples(word: string): ExampleSeed[] {
  return [
    template(`Ich zähle ${word} Bücher auf dem Tisch.`, `I count ${word} books on the table.`),
    template(`Wir treffen uns um ${word} Uhr.`, `We are meeting at ${word} o'clock.`),
    template(`Für ${word} Personen ist noch Platz.`, `There is still room for ${word} people.`),
  ];
}

function adjectiveExamples(word: string): ExampleSeed[] {
  if (word.endsWith("e")) return [template(`Die ${word} Idee gefällt mir.`, `I like the ${word} idea.`), template(`Wir suchen eine ${word} Lösung.`, `We are looking for a ${word} solution.`), template(`Das ist eine ${word} Gelegenheit.`, `That is a ${word} opportunity.`)];
  if (word.endsWith("en")) return [template(`Die ${word} Menschen warten vor der Tür.`, `The ${word} people are waiting outside the door.`), template(`Wir sprechen über die ${word} Fragen.`, `We are talking about the ${word} questions.`), template(`In den ${word} Fällen hilft Geduld.`, `In the ${word} cases, patience helps.`)];
  if (word.endsWith("es")) return [template(`Das ${word} Buch liegt auf dem Tisch.`, `The ${word} book is on the table.`), template(`Wir feiern ein ${word} Ergebnis.`, `We are celebrating a ${word} result.`), template(`Ein ${word} Gefühl bleibt lange.`, `A ${word} feeling lasts a long time.`)];
  if (word.endsWith("er")) return [template(`Der ${word} Plan funktioniert gut.`, `The ${word} plan works well.`), template(`Wir brauchen einen ${word} Grund.`, `We need a ${word} reason.`), template(`Ein ${word} Schritt kann helfen.`, `A ${word} step can help.`)];
  return [template(`Das Wetter ist heute ${word}.`, `The weather is ${word} today.`), template(`Diese Lösung klingt ${word}.`, `This solution sounds ${word}.`), template(`Es ist ${word}, ruhig zu bleiben.`, `It is ${word} to remain calm.`)];
}

function adverbExamples(word: string): ExampleSeed[] {
  if (adverbGroups.degree.includes(word)) return [template(`Das ist ${word} wichtig.`, `That is very important.`), template(`Wir brauchen ${word} Zeit.`, `We need more time.`), template(`Heute ist es ${word} kalt.`, `It is ${word} cold today.`)];
  if (adverbGroups.place.includes(word)) return [template(`Der Schlüssel liegt ${word}.`, `The key is ${word}.`), template(`Wir treffen uns ${word} am Bahnhof.`, `We will meet ${word} at the station.`), template(`Der Weg führt ${word} weiter.`, `The path continues ${word}.`)];
  if (adverbGroups.manner.includes(word)) return [template(`Sie spricht ${word} mit ihrer Freundin.`, `She speaks ${word} with her friend.`), template(`Wir arbeiten ${word} weiter.`, `We continue working ${word}.`), template(`Der Plan funktioniert ${word}.`, `The plan works ${word}.`)];
  return [template(`Wir treffen uns ${word} am Bahnhof.`, `We will meet ${word} at the station.`), template(`Der Kurs beginnt ${word} wieder.`, `The course begins again ${word}.`), template(`Sie kommt ${word} nach Hause.`, `She comes home ${word}.`)];
}

function conjunctionExamples(word: string): ExampleSeed[] {
  const examples: Record<string, ExampleSeed[]> = {
    und: [template("Ich trinke Tee und Wasser.", "I drink tea and water."), template("Sie arbeitet und lernt Deutsch.", "She works and learns German."), template("Wir bleiben, und später kommen die anderen.", "We are staying, and the others will come later.")],
    aber: [template("Ich komme gern, aber heute habe ich keine Zeit.", "I would like to come, but I do not have time today."), template("Der Weg ist lang, aber schön.", "The route is long but beautiful."), template("Sie war müde, aber sie arbeitete weiter.", "She was tired, but she kept working.")],
    oder: [template("Möchtest du Tee oder Kaffee?", "Would you like tea or coffee?"), template("Wir können heute oder morgen kommen.", "We can come today or tomorrow."), template("Ist das dein Buch, oder gehört es Anna?", "Is that your book, or does it belong to Anna?")],
    dass: [template("Ich weiß, dass du recht hast.", "I know that you are right."), template("Sie sagt, dass sie später kommt.", "She says that she is coming later."), template("Es ist gut, dass du da bist.", "It is good that you are here.")],
    daß: [template("Ich weiß, daß du recht hast.", "I know that you are right."), template("Er sagte, daß der Zug später kommt.", "He said that the train is coming later."), template("Sie hoffte, daß alles gut geht.", "She hoped that everything would go well.")],
    weil: [template("Ich bleibe zu Hause, weil es regnet.", "I am staying home because it is raining."), template("Sie lächelt, weil sie gute Nachrichten hat.", "She is smiling because she has good news."), template("Wir gehen früh, weil der Weg weit ist.", "We are leaving early because the way is long.")],
    wenn: [template("Wenn es regnet, bleiben wir zu Hause.", "If it rains, we will stay home."), template("Ruf mich an, wenn du ankommst.", "Call me when you arrive."), template("Wenn du Zeit hast, trinken wir einen Kaffee.", "If you have time, we will have a coffee.")],
    obwohl: [template("Obwohl es regnet, gehen wir spazieren.", "Although it is raining, we are going for a walk."), template("Sie lächelt, obwohl sie müde ist.", "She smiles although she is tired."), template("Obwohl der Weg weit war, kamen alle an.", "Although the way was long, everyone arrived.")],
    sondern: [template("Nicht heute, sondern morgen beginnen wir.", "We are starting not today but tomorrow."), template("Er fährt nicht mit dem Auto, sondern mit dem Zug.", "He is travelling not by car but by train."), template("Sie wollte nicht bleiben, sondern weitergehen.", "She did not want to stay but to move on.")],
    denn: [template("Ich gehe jetzt, denn es ist spät.", "I am leaving now because it is late."), template("Komm herein, denn draußen ist es kalt.", "Come inside, because it is cold outside."), template("Sie blieb ruhig, denn sie kannte den Weg.", "She stayed calm because she knew the way.")],
    ob: [template("Ich weiß nicht, ob er kommt.", "I do not know whether he is coming."), template("Frag sie, ob sie Zeit hat.", "Ask her whether she has time."), template("Ob Regen oder Sonne, wir gehen los.", "Whether rain or sunshine, we are setting off.")],
    während: [template("Während ich koche, liest sie.", "While I cook, she reads."), template("Während des Essens sprechen wir über die Reise.", "During the meal, we talk about the trip."), template("Er blieb ruhig, während alle anderen warteten.", "He stayed calm while everyone else waited.")],
    bevor: [template("Bevor wir gehen, schließen wir das Fenster.", "Before we leave, we close the window."), template("Ich trinke Wasser, bevor ich schlafe.", "I drink water before I sleep."), template("Bevor der Film beginnt, kaufen wir Popcorn.", "Before the film begins, we buy popcorn.")],
    nachdem: [template("Nachdem wir gegessen hatten, gingen wir spazieren.", "After we had eaten, we went for a walk."), template("Nachdem sie angekommen war, rief sie an.", "After she had arrived, she called."), template("Nachdem der Regen aufgehört hatte, kam die Sonne heraus.", "After the rain stopped, the sun came out.")],
    falls: [template("Falls du Zeit hast, komm vorbei.", "If you have time, come by."), template("Falls es regnet, nehmen wir den Bus.", "If it rains, we will take the bus."), template("Ruf mich an, falls du Hilfe brauchst.", "Call me if you need help.")],
  };
  return examples[word] ?? [template(`Ich bleibe hier, ${word} du später kommst.`, `I will stay here, because you are coming later.`), template(`Sie weiß, ${word} alles gut wird.`, `She knows that everything will be fine.`), template(`Wir gehen weiter, ${word} der Weg noch lang ist.`, `We continue, although the way is still long.`)];
}

function pronounOrDeterminerExamples(word: string): ExampleSeed[] {
  const explicit: Record<string, ExampleSeed[]> = {
    ich: [template("Ich komme morgen wieder.", "I am coming again tomorrow."), template("Ich habe eine Frage.", "I have a question."), template("Ich lerne jeden Tag.", "I learn every day.")],
    du: [template("Du kannst heute bei mir bleiben.", "You can stay with me today."), template("Du hast recht.", "You are right."), template("Kommst du morgen mit?", "Are you coming along tomorrow?")],
    er: [template("Er wartet vor der Tür.", "He is waiting in front of the door."), template("Er liest die Zeitung.", "He is reading the newspaper."), template("Er kommt später nach Hause.", "He is coming home later.")],
    sie: [template("Sie wohnt in Berlin.", "She lives in Berlin."), template("Sie kommen morgen.", "They are coming tomorrow."), template("Könnten Sie mir bitte helfen?", "Could you please help me?")],
    wir: [template("Wir treffen uns am Bahnhof.", "We are meeting at the station."), template("Wir haben genug Zeit.", "We have enough time."), template("Wir lernen zusammen Deutsch.", "We are learning German together.")],
    ihr: [template("Ihr könnt hier warten.", "You can wait here."), template("Ich kenne ihr Haus.", "I know their house."), template("Ich helfe ihr morgen.", "I will help her tomorrow.")],
    man: [template("Man lernt nie aus.", "You never stop learning."), template("Man kann den Weg zu Fuß gehen.", "You can walk the way."), template("Wenn man wartet, vergeht die Zeit langsam.", "When you wait, time passes slowly.")],
    sich: [template("Sie wäscht sich die Hände.", "She washes her hands."), template("Er freut sich auf den Urlaub.", "He is looking forward to the holiday."), template("Wir treffen uns morgen.", "We are meeting tomorrow.")],
    mich: [template("Ruf mich heute Abend an.", "Call me this evening."), template("Sie sieht mich durch das Fenster.", "She sees me through the window."), template("Das hat mich überrascht.", "That surprised me.")],
    mir: [template("Kannst du mir helfen?", "Can you help me?"), template("Das ist mir wichtig.", "That is important to me."), template("Sie gibt mir das Buch.", "She gives me the book.")],
    dich: [template("Ich sehe dich morgen.", "I will see you tomorrow."), template("Das freut dich bestimmt.", "That will surely make you happy."), template("Wir laden dich zum Essen ein.", "We are inviting you to dinner.")],
    dir: [template("Ich schicke dir die Adresse.", "I will send you the address."), template("Wie geht es dir?", "How are you?"), template("Das gehört dir.", "That belongs to you.")],
    ihm: [template("Ich helfe ihm bei der Arbeit.", "I help him with the work."), template("Sie gibt ihm den Schlüssel.", "She gives him the key."), template("Das gefällt ihm sehr.", "He likes that very much.")],
    ihn: [template("Ich sehe ihn jeden Morgen.", "I see him every morning."), template("Sie ruft ihn später an.", "She will call him later."), template("Der Hund begleitet ihn nach Hause.", "The dog accompanies him home.")],
    ihnen: [template("Ich schicke ihnen die Unterlagen.", "I will send them the documents."), template("Wir helfen ihnen gern.", "We are happy to help them."), template("Das gehört ihnen.", "That belongs to them.")],
    uns: [template("Sie besucht uns am Wochenende.", "She is visiting us at the weekend."), template("Das hilft uns sehr.", "That helps us a lot."), template("Wir treffen uns später.", "We will meet later.")],
    euch: [template("Ich sehe euch morgen.", "I will see you tomorrow."), template("Wir bringen euch nach Hause.", "We will take you home."), template("Das gehört euch.", "That belongs to you.")],
    das: [template("Das Buch liegt auf dem Tisch.", "The book is on the table."), template("Ich kaufe das morgen.", "I will buy that tomorrow."), template("Das ist eine gute Idee.", "That is a good idea.")],
    der: [template("Der Mann wartet vor dem Haus.", "The man is waiting in front of the house."), template("Der Zug kommt um acht Uhr.", "The train arrives at eight."), template("Der Film, der gestern lief, war überraschend gut.", "The film that was on yesterday was surprisingly good.")],
    die: [template("Die Frau wartet vor der Tür.", "The woman is waiting in front of the door."), template("Die Kinder spielen draußen.", "The children are playing outside."), template("Die Bücher liegen auf dem Tisch.", "The books are on the table.")],
    den: [template("Ich kenne den Weg.", "I know the way."), template("Wir sehen den Zug.", "We can see the train."), template("Der Hund jagt den Ball.", "The dog is chasing the ball.")],
    dem: [template("Ich helfe dem Kind.", "I help the child."), template("Mit dem Bus sind wir schnell da.", "We get there quickly by bus."), template("Das gehört dem Mann.", "That belongs to the man.")],
    des: [template("Die Farbe des Himmels ist schön.", "The color of the sky is beautiful."), template("Das Ende des Films war überraschend.", "The ending of the film was surprising."), template("Die Tür des Hauses ist offen.", "The door of the house is open.")],
    ein: [template("Ein Vogel sitzt auf dem Zaun.", "A bird is sitting on the fence."), template("Ich kaufe ein Buch.", "I am buying a book."), template("Ein guter Plan hilft.", "A good plan helps.")],
    eine: [template("Eine Freundin ruft heute an.", "A friend is calling today."), template("Ich habe eine Idee.", "I have an idea."), template("Eine kleine Pause tut gut.", "A short break feels good.")],
    kein: [template("Das ist kein Problem.", "That is not a problem."), template("Er hat kein Auto.", "He does not have a car."), template("Kein Weg ist zu weit.", "No distance is too far.")],
    keine: [template("Heute habe ich keine Zeit.", "I do not have time today."), template("Sie braucht keine Hilfe.", "She does not need help."), template("Keine Frage bleibt offen.", "No question remains open.")],
  };
  if (explicit[word]) return explicit[word];
  if (word.endsWith("e")) return [template(`${capitalise(word)} Tasche liegt auf dem Tisch.`, `The ${word} bag is on the table.`), template(`Ich nehme ${word} Jacke mit.`, `I am taking the ${word} jacket with me.`), template(`${capitalise(word)} Idee gefällt mir.`, `I like the ${word} idea.`)];
  if (word.endsWith("en")) return [template(`Ich nehme ${word} Schlüssel mit.`, `I am taking the ${word} key with me.`), template(`Wir sehen ${word} Bruder am Bahnhof.`, `We see the ${word} brother at the station.`), template(`Sie spricht über ${word} Plan.`, `She is talking about the ${word} plan.`)];
  if (word.endsWith("em")) return [template(`Ich helfe ${word} Bruder.`, `I help ${word} brother.`), template(`Mit ${word} Hilfe klappt es.`, `With ${word} help, it works.`), template(`Das gehört ${word} Familie.`, `That belongs to ${word} family.`)];
  return [template(`Ich kenne ${word} schon lange.`, `I have known ${word} for a long time.`), template(`Heute spreche ich mit ${word}.`, `Today I am speaking with ${word}.`), template(`Das gehört ${word}.`, `That belongs to ${word}.`)];
}

function verbExamples(word: string): ExampleSeed[] {
  if (verbSpecific[word]) return verbSpecific[word];
  if (participles.has(word)) return [template(`Wir haben ${word} und können weitergehen.`, `We have ${word} and can continue.`), template(`Sie hat das schon ${word}.`, `She has already ${word} that.`), template(`Er ist gestern ${word}.`, `He ${word} yesterday.`)];
  if (pastPluralVerbs.has(word)) return [template(`Wir ${word} gestern lange zusammen.`, `We ${word} together for a long time yesterday.`), template(`Die Kinder ${word} draußen.`, `The children ${word} outside.`), template(`Am Abend ${word} alle nach Hause.`, `In the evening everyone ${word} home.`)];
  if (word.endsWith("te")) return [template(`Gestern ${word} ich lange darüber nach.`, `Yesterday I ${word} about it for a long time.`), template(`Sie ${word} die Tür langsam.`, `She ${word} the door slowly.`), template(`Er ${word} später noch einmal.`, `He ${word} again later.`)];
  if (word.endsWith("st")) return [template(`Du ${word} die Antwort schon.`, `You ${word} the answer already.`), template(`Heute ${word} du den Weg allein.`, `Today you ${word} the way alone.`), template(`Warum ${word} du so lange?`, `Why do you ${word} for so long?`)];
  if (word.endsWith("t")) return [template(`Heute ${word} sie den neuen Plan.`, `Today she ${word} the new plan.`), template(`Er ${word} gleich nach Hause.`, `He ${word} home soon.`), template(`Das ${word} alles viel leichter.`, `That ${word} everything much easier.`)];
  if (word.endsWith("e")) return [template(`Heute ${word} ich nach dem Weg.`, `Today I ${word} for directions.`), template(`Ich ${word} später noch einmal an.`, `I will ${word} again later.`), template(`Warum ${word} ich das nicht einfach?`, `Why do I not simply ${word} that?`)];
  if (word.endsWith("en")) return [template(`Wir können heute ${word}.`, `We can ${word} today.`), template(`Ich möchte morgen ${word}.`, `I would like to ${word} tomorrow.`), template(`Sie will weiter ${word}.`, `She wants to continue to ${word}.`)];
  return [template(`Heute kann ich ${word}.`, `Today I can ${word}.`), template(`Wir wollen ${word} und später zurückkommen.`, `We want to ${word} and come back later.`), template(`Sie hat versucht zu ${word}.`, `She tried to ${word}.`)];
}

function genericExamples(word: string): ExampleSeed[] {
  if (/^[A-ZÄÖÜ][a-zäöüß]+$/u.test(word)) {
    return [template(`${word} wartet am Bahnhof.`, `${word} is waiting at the station.`), template(`Heute spricht ${word} mit seiner Freundin.`, `Today ${word} is talking with his friend.`), template(`${word} kommt am Abend nach Hause.`, `${word} is coming home in the evening.`)];
  }
  return [template(`Wir treffen uns ${word} am Bahnhof.`, `We will meet ${word} at the station.`), template(`Sie kommt ${word} nach Hause.`, `She comes home ${word}.`), template(`Der Bus fährt ${word} weiter.`, `The bus continues ${word}.`)];
}

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

function roleFor(word: string, kind: WordKind, noun?: NounInfo) {
  if (noun) return "noun";
  if (prepositions.has(word)) return "preposition";
  if (conjunctions.has(word)) return "conjunction";
  if (pronouns.has(word) || determiners.has(word)) return "pronoun";
  if (adverbs.has(word)) return "adverb";
  if (adjectiveForms.has(word) || kind === "adjective") return "adjective";
  if (kind === "verb" || /(?:en|ern|eln|te|t|st|e)$/u.test(word) && !adjectiveForms.has(word)) return "verb";
  if (kind === "number") return "number";
  return "other";
}

function generatedExamplesForRole(word: string, kind: WordKind, noun?: NounInfo): ExampleSeed[] {
  const role = roleFor(word, kind, noun);
  return role === "noun" && noun ? nounExamples(word, noun)
    : role === "number" ? numberExamples(word)
      : role === "preposition" ? prepositionExamples[word] ?? genericExamples(word)
        : role === "conjunction" ? conjunctionExamples(word)
          : role === "pronoun" ? pronounOrDeterminerExamples(word)
            : role === "adverb" ? adverbExamples(word)
              : role === "adjective" ? adjectiveExamples(word)
                : role === "verb" ? verbExamples(word)
                  : genericExamples(word);
}

export function isMetaExample(example: Pick<Example, "de" | "en">) {
  return /\b(?:das Wort|the word)\s+["“][^"”]+["”]/iu.test(`${example.de} ${example.en}`);
}

export function fallbackForLevel(
  word: string,
  level: "A2" | "B2" | "C1",
  kind: WordKind,
  noun?: NounInfo,
  examples: readonly Example[] = [],
  exclude: ReadonlySet<string> = new Set(),
): ExampleSeed {
  const levelIndex = level === "A2" ? 0 : level === "B2" ? 1 : 2;
  const exactNatural = examples.filter((example) => wordUsedAsRecord(example.de, word, usedAsNounKind(kind)) && !isMetaExample(example) && !exclude.has(example.de));
  const sameLevel = exactNatural.find((example) => example.level === level);
  if (sameLevel) return { ...sameLevel, sourceKind: sameLevel.sourceKind };

  const naturalCandidate = exactNatural[levelIndex];
  if (naturalCandidate) return { ...naturalCandidate, sourceKind: naturalCandidate.sourceKind };

  const generated = specialExamples[word] ?? generatedExamplesForRole(word, kind, noun);
  const generatedCandidate = generated.find((candidate) => !exclude.has(candidate.de) && wordUsedAsRecord(candidate.de, word, usedAsNounKind(kind)));
  if (generatedCandidate && !isMetaExample(generatedCandidate)) return generatedCandidate;

  return template(`Heute sehe ich ${word}.`, `Today I see ${word}.`);
}

function attachLevels(examples: ExampleSeed[]): Example[] {
  const sorted = [...examples].sort((a, b) => cefrScore(a.de) - cefrScore(b.de));
  return sorted.slice(0, 3).map((ex, i) => ({
    ...ex,
    level: (i === 0 ? "A2" : i === 1 ? "B2" : "C1") as Example["level"],
  }));
}

function ensureCefrBands(word: string, kind: WordKind, noun: NounInfo | undefined, examples: Example[]): Example[] {
  const used = new Set(examples.filter((ex) => wordUsedAsRecord(ex.de, word, usedAsNounKind(kind)) && !isMetaExample(ex)).map((ex) => ex.de));
  let fixed = examples.map((ex) => {
    const lvl = ex.level as "A2" | "B2" | "C1";
    if (wordUsedAsRecord(ex.de, word, usedAsNounKind(kind)) && !isMetaExample(ex)) return ex;
    const fallback = fallbackForLevel(word, lvl, kind, noun, examples, used);
    used.add(fallback.de);
    return { ...fallback, level: lvl } as Example;
  });
  // Re-sort to guarantee monotonic A2 ≤ B2 ≤ C1 after fallback replacement
  fixed = [...fixed].sort((a, b) => cefrScore(a.de) - cefrScore(b.de));
  return fixed.map((ex, i) => ({ ...ex, level: (i === 0 ? "A2" : i === 1 ? "B2" : "C1") as Example["level"] }));
}

export function buildExamples(word: string, kind: WordKind, noun?: NounInfo): Example[] {
  if (specialExamples[word]) {
    const leveled = specialExamples[word].map((ex, i) => ({
      ...ex,
      level: (i === 0 ? "A2" : i === 1 ? "B2" : "C1") as Example["level"],
    }));
    return ensureCefrBands(word, kind, noun, leveled);
  }
  const sourced = cleanSourceExamples(word, kind);
  if (sourced.length >= 3) {
    const leveled = attachLevels(sourced);
    return ensureCefrBands(word, kind, noun, leveled);
  }
  const generated = generatedExamplesForRole(word, kind, noun);
  const merged = [...sourced, ...generated];
  const unique = [...new Map(merged.map((example) => [example.de, example])).values()];
  const usable = unique.filter((example) => wordUsedAsRecord(example.de, word, usedAsNounKind(kind)) && !isMetaExample(example));
  const pool = usable.length >= 3 ? usable : unique;
  return ensureCefrBands(word, kind, noun, attachLevels(pool));
}

export function buildExplanation(word: string, kind: WordKind, gloss: string, noun?: NounInfo) {
  if (word === "innerhalb") return "A preposition.";
  if (noun) return `A ${noun.number === "plural" ? "plural " : ""}noun.`;
  if (kind === "noun") return "A noun.";
  if (kind === "verb") return "A verb form.";
  if (kind === "function") return "A function word.";
  if (kind === "name") return "A name.";
  if (kind === "number") return "A number.";
  if (kind === "adverb") return "An adverb.";
  if (kind === "adjective") return "An adjective.";
  return "A word.";
}
