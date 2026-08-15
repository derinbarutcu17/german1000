export function hasSpeechSynthesis() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function germanVoice() {
  if (!hasSpeechSynthesis()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^de[-_]DE$/i.test(voice.lang)) ?? voices.find((voice) => /^de[-_]/i.test(voice.lang));
}

export function canSpeakGerman() {
  return Boolean(germanVoice());
}

export function speakGerman(text: string) {
  if (!hasSpeechSynthesis()) return { ok: false as const, reason: "unsupported" as const };
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 0.78;
  const voice = germanVoice();
  if (!voice) return { ok: false as const, reason: "voice-unavailable" as const };
  utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return { ok: true as const };
}
