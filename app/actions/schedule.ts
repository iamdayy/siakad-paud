"use server";

import { requireActionAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClassSchedule(formData: FormData) {
  // Only Admin or TU can manage schedule
  await requireActionAccess(["ADMIN", "TU"]);

  const classroomId = String(formData.get("classroomId") ?? "").trim();
  const dayOfWeek = parseInt(String(formData.get("dayOfWeek") ?? "1"), 10);
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!classroomId || !startTime || !endTime || !activity) {
    return { success: false, message: "Semua kolom yang wajib harus diisi" };
  }

  try {
    await prisma.classSchedule.create({
      data: {
        classroomId,
        dayOfWeek,
        startTime,
        endTime,
        activity,
        location: location || null,
      },
    });

    revalidatePath(`/kelas/${classroomId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Jadwal berhasil ditambahkan" };
  } catch (error: any) {
    console.error("createClassSchedule error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteClassSchedule(formData: FormData) {
  await requireActionAccess(["ADMIN", "TU"]);

  const id = String(formData.get("id") ?? "").trim();
  const classroomId = String(formData.get("classroomId") ?? "").trim();
  if (!id) return;

  try {
    await prisma.classSchedule.delete({
      where: { id },
    });
    
    if (classroomId) {
      revalidatePath(`/kelas/${classroomId}`);
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteClassSchedule error:", error);
  }
}
