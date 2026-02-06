import { Code2, Wrench, Server, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const quadrantConfig = {
  "languages-frameworks": {
    label: "Languages & Frameworks",
    icon: Code2,
    className: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  },
  tools: {
    label: "Tools",
    icon: Wrench,
    className: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  },
  platforms: {
    label: "Platforms",
    icon: Server,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  techniques: {
    label: "Techniques",
    icon: Lightbulb,
    className: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  },
} as const;

type TechRadarQuadrant = keyof typeof quadrantConfig;

export function QuadrantBadge({ quadrant }: { quadrant: TechRadarQuadrant }) {
  const config = quadrantConfig[quadrant];
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
