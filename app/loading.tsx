import { LoadingMark } from "./components/LoadingMark";

export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <LoadingMark />
      <span className="sr-only">Loading</span>
    </div>
  );
}
