import { ActionForm } from "@/components/action-form";
import { recordAttendance } from "@/app/(system)/actions";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess, getCurrentUser } from "@/lib/auth";
import { getAttendanceLogs, getStudents } from "@/lib/data";
import { SearchBar } from "@/components/data-table/search-bar";
import { Pagination } from "@/components/data-table/pagination";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function statusColor(status: string) {
  switch (status) {
    case "Hadir":
      return "success";
    case "Sakit":
      return "warning";
    case "Izin":
      return "default";
    case "Alpa":
      return "destructive";
    default:
      return "default";
  }
}

export default async function PresensiPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  await requirePageAccess("/presensi", ["ADMIN", "TU", "GURU"]);

  const user = await getCurrentUser();
  const teacherId = user?.role === "GURU" && user.teacherId ? user.teacherId : undefined;

  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  const page = Number(resolvedParams?.page) || 1;

  const [logs, students] = await Promise.all([
    getAttendanceLogs({ teacherId, search: query, page: page, limit: 10 }),
    getStudents({ teacherId, limit: 1000 }),
  ]);

  // Count today's stats
  const today = new Date().toDateString();
  const todayLogs = logs.rows.filter(
    (r) => new Date(r.date).toDateString() === today,
  );
  const presentToday = todayLogs.filter((r) => r.rawStatus === "PRESENT").length;
  const absentToday = todayLogs.filter(
    (r) => r.rawStatus !== "PRESENT",
  ).length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Presensi Harian Siswa
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat dan pantau kehadiran harian siswa. Notifikasi otomatis akan
          dikirim ke orang tua saat anak tercatat hadir.
        </p>
      </div>

      {/* Quick Stats + Add Attendance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hadir Hari Ini
            </CardTitle>
            <UserCheck className="h-4 w-4 text-warm-green" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{presentToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tidak Hadir
            </CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{absentToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Log
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{logs.rows.length}</p>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Presensi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Presensi Siswa</DialogTitle>
                <DialogDescription>
                  Catat kehadiran siswa. Notifikasi WhatsApp akan dikirim ke
                  orang tua jika siswa hadir.
                </DialogDescription>
              </DialogHeader>
              <ActionForm action={recordAttendance} className="mt-2 grid gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="studentId">Siswa</FieldLabel>
                    <Select name="studentId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.rows.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.fullName}
                            {student.nickName
                              ? ` (${student.nickName})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="date">Tanggal</FieldLabel>
                    <Input
                      type="date"
                      name="date"
                      required
                      defaultValue={toDateInput(new Date())}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select name="status" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">Hadir</SelectItem>
                        <SelectItem value="SICK">Sakit</SelectItem>
                        <SelectItem value="PERMITTED">Izin</SelectItem>
                        <SelectItem value="ABSENT">Alpa</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note">Catatan</FieldLabel>
                    <Textarea
                      name="note"
                      rows={2}
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end mt-4">
                  <Button type="submit">Simpan Presensi</Button>
                </div>
              </ActionForm>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* Log Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Log Presensi Terbaru</CardTitle>
              <CardDescription>
                Daftar entri presensi dari seluruh kelas.
              </CardDescription>
            </div>
          </div>
          <div className="w-full md:w-64">
            <SearchBar placeholder="Cari siswa..." />
          </div>
        </CardHeader>
        <CardContent>
          {!logs.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.studentName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(row.date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="ghost"
                        color={statusColor(row.status)}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.note ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Belum ada log presensi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination totalPages={logs.totalPages || 0} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
