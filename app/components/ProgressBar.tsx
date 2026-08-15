type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  compact?: boolean;
};

export function ProgressBar({ value, max = 100, label, compact = false }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(value, max));
  const percentage = max ? Math.round((safeValue / max) * 100) : 0;
  return (
    <div
      className={"progress-track" + (compact ? " progress-track-compact" : "")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      aria-valuetext={label}
    >
      <span style={{ transform: "scaleX(" + percentage / 100 + ")" }} />
    </div>
  );
}

