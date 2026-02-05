import { AlertTriangle } from "lucide-react";

export function DuplicationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-700">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      {count} {count === 1 ? "duplicate" : "duplicates"}
    </span>
  );
}
