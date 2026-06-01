import { requirePageAccess, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonPlanForm } from "./LessonPlanForm";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { FileText, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteLessonPlan } from "@/app/actions/lesson-plan";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GuruLessonPlanPage() {
  await requirePageAccess("/guru/lesson-plan", ["GURU"]);
  const user = await getCurrentUser();

  if (!user || !user.teacherId) return null;

  const lessonPlans = await prisma.lessonPlan.findMany({
    where: { teacherId: user.teacherId },
    orderBy: { weekDate: "desc" }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-500" />
            Logbook Guru (RPPH/RPPM)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Unggah dan kelola Rencana Pelaksanaan Pembelajaran Anda.
          </p>
        </div>
        <LessonPlanForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessonPlans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl bg-card border-dashed">
            Belum ada Lesson Plan yang diunggah.
          </div>
        ) : (
          lessonPlans.map((lp) => (
            <div key={lp.id} className="relative group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <Badge variant={lp.type === "RPPH" ? "default" : "secondary"}>{lp.type}</Badge>
                <form action={deleteLessonPlan}>
                  <input type="hidden" name="id" value={lp.id} />
                  <Button variant="ghost" size="icon" type="submit" className="h-6 w-6 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{lp.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                Mulai: {format(new Date(lp.weekDate), "dd MMM yyyy", { locale: localeId })}
              </div>

              {lp.content && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 bg-muted/30 p-2 rounded-md">
                  {lp.content}
                </p>
              )}

              {lp.fileUrl && (
                <div className="pt-2 border-t mt-auto">
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <Link href={lp.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      Buka Dokumen
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
