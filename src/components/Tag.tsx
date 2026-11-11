import type { Label } from "../types";

export function Tag({ label }: { label: Label }) {
  return (
    <span className="tag" data-label={label}>
      {label}
    </span>
  );
}
