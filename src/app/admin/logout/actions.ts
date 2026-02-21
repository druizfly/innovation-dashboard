"use server";

import { redirect } from "next/navigation";
import { deleteSessionCookie } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
  redirect("/admin/login");
}
