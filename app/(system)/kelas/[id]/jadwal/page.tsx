import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionForm } from "@/components/action-form";
import { deleteClassSchedule } from "@/app/actions/schedule";
import { ScheduleForm } from "./ScheduleForm";

export const dynamic = "force-dynamic";

const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" },
];

export default async function ClassSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePageAccess("/kelas", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const { id } = await params;
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      schedules: {
        orderBy: [
          { dayOfWeek: "asc" },
          { startTime: "asc" }
        ]
      }
    }
  });

  if (!classroom) return notFound();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/kelas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jadwal Kelas: {classroom.name}</h2>
          <p className="text-sm text-muted-foreground">Kelola rutinitas dan jadwal mengajar untuk kelas ini.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <ScheduleForm classroomId={classroom.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((day) => {
          const daySchedules = classroom.schedules.filter((s) => s.dayOfWeek === day.id);

          if (daySchedules.length === 0) return null;

          return (
            <Card key={day.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {day.name}
                  <Badge variant="secondary">{daySchedules.length} Kegiatan</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySchedules.map((schedule) => (
                  <div key={schedule.id} className="group flex justify-between items-start rounded-md bg-muted/50 p-3 text-sm border hover:border-primary/50 transition-colors">
                    <div>
                      <div className="font-semibold text-primary mb-1">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="font-medium leading-tight">{schedule.activity}</div>
                      {schedule.location && (
                        <div className="text-xs text-muted-foreground mt-1">📍 {schedule.location}</div>
                      )}
                    </div>
                    <form action={deleteClassSchedule}>
                      <input type="hidden" name="id" value={schedule.id} />
                      <input type="hidden" name="classroomId" value={classroom.id} />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </form>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {classroom.schedules.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed bg-card/50">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="font-semibold text-lg">Belum Ada Jadwal</h3>
            <p className="text-sm text-muted-foreground mt-1">Silakan tambahkan kegiatan untuk kelas ini.</p>
          </div>
        )}
      </div>
    </section>
  );
}
