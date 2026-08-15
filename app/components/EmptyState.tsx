import type { ReactNode } from "react";

export function EmptyState({ eyebrow, title, body, children, action }: { eyebrow?: string; title: string; body?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state empty-state-composed">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h3>{title}</h3>
      <p>{body ?? children}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
