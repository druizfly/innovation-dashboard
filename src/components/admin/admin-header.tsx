"use client";

import { usePathname } from "next/navigation";
import { AdminMobileSidebar } from "./admin-sidebar";
import { Separator } from "@/components/ui/separator";

const routeTitles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/projects": "Manage Projects",
  "/admin/tech-radar": "Manage Tech Radar",
  "/admin/lessons": "Manage Lessons",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.includes("/create")) return "Create";
  if (pathname.includes("/edit")) return "Edit";
  if (pathname.startsWith("/admin/projects/")) return "Project Details";
  if (pathname.startsWith("/admin/tech-radar/")) return "Technology Details";
  if (pathname.startsWith("/admin/lessons/")) return "Lesson Details";
  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="border-b bg-card">
      <div className="flex h-14 items-center gap-4 px-4">
        <AdminMobileSidebar />
        <Separator orientation="vertical" className="h-6 lg:hidden" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
