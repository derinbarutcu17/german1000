export function LoadingMark({ className = "" }: { className?: string }) {
  return (
    <span className={"loading-mark" + (className ? " " + className : "")} aria-hidden="true">
      <span className="loading-mark__dot" />
      <span className="loading-mark__dot" />
      <span className="loading-mark__dot" />
    </span>
  );
}
