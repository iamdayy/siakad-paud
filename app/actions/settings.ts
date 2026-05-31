"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePpdbSettings(formData: FormData) {
  try {
    const isOpen = formData.get("isOpen") === "true";
    const year = formData.get("year")?.toString() || "2026/2027";
    const startDate = formData.get("startDate")?.toString() || "2026-03-01";
    const endDate = formData.get("endDate")?.toString() || "2026-07-31";
    const quota = formData.get("quota")?.toString() || "60";

    const settings = [
      { key: "ppdb_open", value: String(isOpen) },
      { key: "ppdb_year", value: year },
      { key: "ppdb_start_date", value: startDate },
      { key: "ppdb_end_date", value: endDate },
      { key: "ppdb_quota", value: quota },
    ];

    // Gunakan transaction untuk memastikan semua tersimpan secara atomic
    await prisma.$transaction(
      settings.map((setting) =>
        prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        })
      )
    );

    // Revalidasi route PPDB publik agar UI langsung ter-update
    revalidatePath("/ppdb-public");
    revalidatePath("/ppdb-public/form");
    
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan pengaturan PPDB:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}
