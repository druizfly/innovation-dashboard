import { CheckCircle2, Search, GitMerge, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  adopt: {
    label: "Adopt",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  explore: {
    label: "Explore",
    icon: Search,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  consolidate: {
    label: "Consolidate",
    icon: GitMerge,
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  avoid: {
    label: "Avoid",
    icon: XCircle,
    className: "bg-red-500/10 text-red-700 border-red-500/20",
  },
} as const;

type TechRadarCategory = keyof typeof categoryConfig;

export function CategoryBadge({ category }: { category: TechRadarCategory }) {
  const config = categoryConfig[category];
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
