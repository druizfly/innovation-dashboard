import { ArrowUpCircle, GitMerge, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const decisionConfig = {
  advance: {
    label: "Advance",
    icon: ArrowUpCircle,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  consolidate: {
    label: "Consolidate",
    icon: GitMerge,
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  pause: {
    label: "Pause",
    icon: PauseCircle,
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
} as const;

type ProjectDecision = keyof typeof decisionConfig;

export function DecisionBadge({ decision }: { decision: ProjectDecision | null }) {
  if (!decision) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Pending
      </span>
    );
  }

  const config = decisionConfig[decision];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
