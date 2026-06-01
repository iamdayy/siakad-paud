import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PengumumanClient } from "./PengumumanClient";
import { Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  await requirePageAccess("/pengumuman", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-indigo-500" />
          Papan Pengumuman
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola informasi dan *broadcast* ke seluruh guru dan orang tua.
        </p>
      </div>

      <PengumumanClient initialData={announcements} />
    </section>
  );
}
