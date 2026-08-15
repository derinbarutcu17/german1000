"use client";

import { useEffect, useState } from "react";
import { canSpeakGerman, speakGerman } from "../lib/audio";

export function AudioButton({ text, word, label, compact = false }: { text?: string; word?: string; label?: string; compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const spokenText = text ?? word ?? "German word";

  useEffect(() => {
    const update = () => {
      setReady(canSpeakGerman());
      setChecked(true);
    };
    const timer = window.setTimeout(update, 0);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      window.clearTimeout(timer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", update);
    };
  }, []);

  const status = ready ? "ready" : checked ? "unavailable" : "checking";
  const buttonLabel = label ?? (ready ? "Listen in German: " + spokenText : status === "checking" ? "Checking German audio" : "German audio unavailable");

  return (
    <button
      className={"sound-button" + (compact ? " sound-button-compact" : "")}
      type="button"
      aria-label={buttonLabel}
      title={buttonLabel}
      disabled={!ready}
      onClick={() => speakGerman(spokenText)}
    >
      <span aria-hidden="true">◖</span>
      <span className="sr-only">{ready ? "Listen" : status === "checking" ? "Checking audio" : "Audio unavailable"}</span>
    </button>
  );
}
