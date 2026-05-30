"use server";

import {
  authenticateUser,
  buildSessionCookie,
  clearAuthCookie,
  getNextPath,
  setAuthCookie,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const next = getNextPath(formData.get("next"));

  if (!username || !password) {
    redirect(`/login?error=missing&next=${encodeURIComponent(next)}`);
  }

  const user = await authenticateUser(username, password);
  if (!user) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  const token = await buildSessionCookie(user);
  await setAuthCookie(token);
  redirect(next);
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}
