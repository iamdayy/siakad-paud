"use server";

import { requireActionAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnnouncementTarget } from "@prisma/client";
import { revalidatePath } from "next/cache";

const adminAndTu = ["ADMIN", "TU", "KEPALA_SEKOLAH"] as const;

export async function createAnnouncement(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const targetRole = String(formData.get("targetRole") ?? "ALL") as AnnouncementTarget;
  const sendWhatsapp = formData.get("sendWhatsapp") === "on";

  if (!title || !content) return { success: false, message: "Judul dan isi pengumuman wajib diisi" };

  try {
    const announcement = await prisma.announcement.create({
      data: { title, content, targetRole },
    });

    if (sendWhatsapp) {
      // Trigger background WA push
      triggerWhatsAppBroadcast(title, content, targetRole);
    }

    revalidatePath("/dashboard");
    revalidatePath("/pengumuman");
    return { success: true, message: "Pengumuman berhasil dibuat" };
  } catch (err: any) {
    console.error("createAnnouncement failed:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteAnnouncement(formData: FormData) {
  await requireActionAccess(adminAndTu);
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/pengumuman");
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
  }
}

// Background worker mock for WA Broadcast
async function triggerWhatsAppBroadcast(title: string, content: string, targetRole: AnnouncementTarget) {
  try {
    const message = `📢 *PENGUMUMAN*\n\n*${title}*\n\n${content}\n\n_PAUD Ceria Bintang_`;
    
    // Fetch numbers based on targetRole
    const numbers: string[] = [];

    if (targetRole === "ALL" || targetRole === "TEACHER") {
      const teachers = await prisma.teacher.findMany({ where: { phone: { not: null } } });
      teachers.forEach(t => { if (t.phone) numbers.push(t.phone) });
    }

    if (targetRole === "ALL" || targetRole === "PARENT") {
      const parents = await prisma.parent.findMany({ where: { whatsapp: { not: "" } } });
      parents.forEach(p => { if (p.whatsapp) numbers.push(p.whatsapp) });
    }

    const uniqueNumbers = [...new Set(numbers)];
    
    // In real app, we would chunk these and send them properly via Queue.
    // For now, we just iterate or mock it if no token.
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      console.log(`[WhatsApp Broadcast] Mocking send to ${uniqueNumbers.length} numbers:\n${message}`);
      return;
    }

    // Example using Fonnte (it supports comma separated targets)
    const formData = new FormData();
    formData.append("target", uniqueNumbers.join(","));
    formData.append("message", message);
    formData.append("countryCode", "62");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });

    const json = await res.json();
    console.log(`[WhatsApp Broadcast] Result:`, json);

  } catch (err) {
    console.error("[WhatsApp Broadcast] Error:", err);
  }
}
