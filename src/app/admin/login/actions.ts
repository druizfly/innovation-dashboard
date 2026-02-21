"use server";

import { redirect } from "next/navigation";
import {
  validatePassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

type LoginState = { error?: string } | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password === "") {
    return { error: "Password is required." };
  }

  if (!validatePassword(password)) {
    return { error: "Invalid password." };
  }

  const token = await createSession();
  await setSessionCookie(token);

  redirect("/admin");
}
