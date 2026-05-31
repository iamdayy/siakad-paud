import { teacherCheckIn, teacherCheckOut } from "@/app/(system)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherAttendances } from "@/lib/data";
import { Clock, LogIn, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherAttendancePage() {
  const user = await getCurrentUser();
  const attendances = await getTeacherAttendances();

  const isTeacher = user?.role === "GURU";
  
  // Find current teacher's attendance for today if they are a teacher
  const myAttendance = isTeacher 
    ? attendances.rows.find(a => a.teacherId === user?.teacherId)
    : null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Clock className="h-6 w-6 text-primary" />
              Absensi Kehadiran Guru
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sistem pencatatan waktu masuk dan pulang pendidik.
            </p>
          </div>
        </div>
      </div>

      {isTeacher && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Kehadiran Anda Hari Ini</CardTitle>
            <CardDescription>
              Silakan lakukan check-in saat tiba di sekolah dan check-out saat pulang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {!myAttendance ? (
                <form action={teacherCheckIn}>
                  <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
                    <LogIn className="h-4 w-4" /> Check In Sekarang
                  </Button>
                </form>
              ) : !myAttendance.checkOut ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-green-700">
                    Telah Check In pada {myAttendance.checkIn?.toLocaleTimeString('id-ID')}
                  </div>
                  <form action={teacherCheckOut}>
                    <Button type="submit" variant="destructive" className="gap-2">
                      <LogOut className="h-4 w-4" /> Check Out
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-sm font-medium text-muted-foreground">
                  Absensi hari ini telah selesai. (Check In: {myAttendance.checkIn?.toLocaleTimeString('id-ID')} - Check Out: {myAttendance.checkOut.toLocaleTimeString('id-ID')})
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Kehadiran Hari Ini</CardTitle>
          <CardDescription>
            Daftar kehadiran seluruh guru pada hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Guru</TableHead>
                  <TableHead>Waktu Check-In</TableHead>
                  <TableHead>Waktu Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.teacher.name}</TableCell>
                    <TableCell>
                      {row.checkIn ? row.checkIn.toLocaleTimeString('id-ID') : "-"}
                    </TableCell>
                    <TableCell>
                      {row.checkOut ? row.checkOut.toLocaleTimeString('id-ID') : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Hadir
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {attendances.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Belum ada guru yang melakukan check-in hari ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
