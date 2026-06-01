import { prisma } from "@/lib/prisma";
import { AnnouncementTarget } from "@prisma/client";
import { Megaphone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function AnnouncementWidget({ targetRole }: { targetRole: AnnouncementTarget }) {
  // Fetch latest 3 announcements for the specific role (or ALL)
  const announcements = await prisma.announcement.findMany({
    where: {
      targetRole: { in: [targetRole, "ALL"] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-indigo-500" />
        Pengumuman Terbaru
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {announcements.map((item) => (
          <div key={item.id} className="rounded-xl border bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: localeId })}
              </div>
              <h4 className="font-bold text-sm mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
