"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./sidebar";
import { Separator } from "@/components/ui/separator";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tech-radar": "Tech Radar",
  "/lessons": "Lessons Learned",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/projects/")) return "Project Details";
  if (pathname.startsWith("/tech-radar/")) return "Technology Details";
  if (pathname.startsWith("/lessons/")) return "Lesson Details";
  return "Innovation Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="border-b bg-card">
      <div className="flex h-14 items-center gap-4 px-4">
        <MobileSidebar />
        <Separator orientation="vertical" className="h-6 lg:hidden" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
