import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { BookOpen, Calendar, ExternalLink, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminLessonPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requirePageAccess("/laporan/lesson-plan", ["ADMIN", "KEPALA_SEKOLAH"]);

  const { t } = await searchParams; // teacher filter (optional)
  const teacherFilter = typeof t === "string" ? t : undefined;

  const lessonPlans = await prisma.lessonPlan.findMany({
    where: teacherFilter ? { teacherId: teacherFilter } : undefined,
    include: {
      teacher: true,
    },
    orderBy: { weekDate: "desc" },
  });

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            Rekap Logbook Guru
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau pengumpulan Rencana Pelaksanaan Pembelajaran (RPPH/RPPM) dari seluruh guru.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Simple Teacher Filter Links */}
          <Button variant={!teacherFilter ? "default" : "outline"} size="sm" asChild>
            <Link href="/laporan/lesson-plan">Semua Guru</Link>
          </Button>
          {teachers.map((teacher) => (
            <Button
              key={teacher.id}
              variant={teacherFilter === teacher.id ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/laporan/lesson-plan?t=${teacher.id}`}>{teacher.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Guru</TableHead>
              <TableHead>Tipe & Judul</TableHead>
              <TableHead>Dokumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessonPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Belum ada logbook yang diunggah.
                </TableCell>
              </TableRow>
            ) : (
              lessonPlans.map((lp) => (
                <TableRow key={lp.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {format(new Date(lp.weekDate), "dd MMM yyyy", { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="font-semibold text-sm">{lp.teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={lp.type === "RPPH" ? "default" : "secondary"}>{lp.type}</Badge>
                      <span className="font-semibold">{lp.title}</span>
                    </div>
                    {lp.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{lp.content}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {lp.fileUrl ? (
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                        <Link href={lp.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" /> Buka
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Tidak ada</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
