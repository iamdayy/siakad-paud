"use server";

import {
  authenticateUser,
  buildSessionCookie,
  clearAuthCookie,
  getNextPath,
  setAuthCookie,
  getCurrentUser,
  verifyPassword,
  hashPassword
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  let next = getNextPath(formData.get("next"));

  if (!username || !password) {
    redirect(`/login?error=missing&next=${encodeURIComponent(next)}`);
  }

  const user = await authenticateUser(username, password);
  console.log(user)
  if (!user) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  if (user.role === "ORANG_TUA") {
    next = "/portal";
  }

  const token = await buildSessionCookie(user);
  await setAuthCookie(token);
  redirect(next);
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}

export async function changePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "Semua kolom harus diisi." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Password baru dan konfirmasi tidak cocok." };
  }
  if (newPassword.length < 6) {
    return { success: false, message: "Password baru minimal 6 karakter." };
  }

  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return { success: false, message: "Password lama salah." };
  }

  const newHash = hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true, message: "Password berhasil diubah!" };
}
