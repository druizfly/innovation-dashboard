import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TechRadarForm } from "@/components/tech-radar/tech-radar-form";

export default function CreateTechRadarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/tech-radar"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tech Radar
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Add Technology</h2>
        <p className="text-muted-foreground">
          Add a new technology to the radar for strategic guidance.
        </p>
      </div>

      <TechRadarForm />
    </div>
  );
}
