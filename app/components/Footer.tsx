"use client";

import { useState } from "react";

export function Footer({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <footer className="footer">
      <span>German 1000 · built for returning, not cramming.</span>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)}>Reset local progress</button>
      ) : (
        <div className="reset-confirmation" role="group" aria-label="Confirm reset">
          <span>This clears saved review states on this browser.</span>
          <button type="button" className="button button-subtle" autoFocus onClick={() => setConfirming(false)}>Keep progress</button>
          <button type="button" className="button button-danger" onClick={() => { onReset(); setConfirming(false); }}>Clear progress</button>
        </div>
      )}
    </footer>
  );
}
