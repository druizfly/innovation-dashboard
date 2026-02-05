import { Lightbulb, Wrench, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  idea: {
    label: "Idea",
    icon: Lightbulb,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  development: {
    label: "Development",
    icon: Wrench,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  pilot: {
    label: "Pilot",
    icon: FlaskConical,
    className: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  },
} as const;

type ProjectStatus = keyof typeof statusConfig;

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
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
