import Link from "next/link";
import { FolderKanban, Radar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  {
    name: "Projects",
    description: "Create, edit, and delete innovation projects.",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Tech Radar",
    description: "Manage technologies on the radar.",
    href: "/admin/tech-radar",
    icon: Radar,
  },
  {
    name: "Lessons Learned",
    description: "Manage lessons and knowledge base entries.",
    href: "/admin/lessons",
    icon: BookOpen,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage content across all modules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <mod.icon className="h-5 w-5 text-primary" />
                  {mod.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {mod.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
