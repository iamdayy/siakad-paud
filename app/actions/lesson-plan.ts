"use server";

import { requireActionAccess, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateUploadUrl, r2PublicUrl } from "@/lib/s3";
import crypto from "crypto";

export async function getLessonPlanPresignedUrl(fileName: string, contentType: string) {
  // Only teachers and admins can upload lesson plans
  const user = await getCurrentUser();
  if (!user || (user.role !== "GURU" && user.role !== "ADMIN" && user.role !== "KEPALA_SEKOLAH")) {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const ext = fileName.split(".").pop();
    const uniqueFileName = `${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`;
    const key = `lesson-plans/${uniqueFileName}`;

    const signedUrl = await generateUploadUrl(key, contentType);

    // The public URL to view the file after upload
    // If r2PublicUrl is not set, we'll just store the raw key or a format they can construct later.
    const fileUrl = r2PublicUrl ? `${r2PublicUrl}/${key}` : key;

    return { success: true, signedUrl, fileUrl, key };
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return { success: false, message: "Gagal membuat URL upload" };
  }
}

export async function createLessonPlan(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "GURU") {
    return { success: false, message: "Hanya Guru yang dapat mengunggah Logbook" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "RPPH");
  const weekDateStr = String(formData.get("weekDate") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();

  if (!title || !weekDateStr) {
    return { success: false, message: "Judul dan Tanggal wajib diisi" };
  }

  try {
    await prisma.lessonPlan.create({
      data: {
        teacherId: user.teacherId!,
        title,
        type,
        weekDate: new Date(weekDateStr),
        content: content || null,
        fileUrl: fileUrl || null,
      }
    });

    revalidatePath("/guru/lesson-plan");
    revalidatePath("/laporan/lesson-plan");
    return { success: true, message: "Lesson Plan berhasil disimpan" };
  } catch (err: any) {
    console.error("createLessonPlan failed", err);
    return { success: false, message: err.message };
  }
}

export async function deleteLessonPlan(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    const lessonPlan = await prisma.lessonPlan.findUnique({ where: { id } });
    if (!lessonPlan) return;

    // Only the owner teacher or admin can delete
    if (user.role === "GURU" && lessonPlan.teacherId !== user.teacherId) {
      return;
    }

    await prisma.lessonPlan.delete({ where: { id } });
    revalidatePath("/guru/lesson-plan");
    revalidatePath("/laporan/lesson-plan");
  } catch (err) {
    console.error("deleteLessonPlan failed:", err);
  }
}
