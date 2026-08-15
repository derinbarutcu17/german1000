import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children, knownCount, total = 1000 }: { children: ReactNode; knownCount: number; total?: number }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader knownCount={knownCount} total={total} />
      {children}
    </div>
  );
}
