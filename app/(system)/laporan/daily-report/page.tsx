import { createDailyReport } from "@/app/(system)/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess, getCurrentUser } from "@/lib/auth";
import { getReportsSnapshot, getStudents } from "@/lib/data";
import {
  BookOpen,
  Plus,
  Utensils,
  Moon,
  Smile,
} from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function DailyReportPage() {
  await requirePageAccess("/laporan", [
    "ADMIN",
    "TU",
    "GURU",
    "KEPALA_SEKOLAH",
  ]);

  const user = await getCurrentUser();
  const teacherId = user?.role === "GURU" && user.teacherId ? user.teacherId : undefined;

  const [data, students] = await Promise.all([
    getReportsSnapshot(teacherId),
    getStudents(teacherId),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Laporan Harian (Daily Report)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola buku penghubung digital untuk melaporkan aktivitas harian anak.
        </p>
        {!data.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-warm-blue" />
                <div>
                  <CardTitle>Buku Penghubung Digital</CardTitle>
                  <CardDescription>
                    Laporan harian: makan, tidur, mood, dan aktivitas anak.
                  </CardDescription>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Buat Laporan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Buat Laporan Harian</DialogTitle>
                    <DialogDescription>
                      Catat aktivitas harian anak untuk dikirim ke orang tua.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    action={createDailyReport}
                    className="mt-2 grid gap-4"
                  >
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="studentId">Siswa</FieldLabel>
                        <Select name="studentId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih siswa" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.rows.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.fullName}
                                {s.nickName ? ` (${s.nickName})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="reportDate">Tanggal</FieldLabel>
                        <Input
                          type="date"
                          name="reportDate"
                          required
                          defaultValue={toDateInput(new Date())}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="meals">
                          <Utensils className="mr-1 inline h-3.5 w-3.5" />
                          Porsi Makan
                        </FieldLabel>
                        <Input
                          name="meals"
                          placeholder="Contoh: Nasi + sayur (habis), Snack (setengah)"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="napDuration">
                          <Moon className="mr-1 inline h-3.5 w-3.5" />
                          Durasi Tidur Siang
                        </FieldLabel>
                        <Input
                          name="napDuration"
                          placeholder="Contoh: 1 jam 30 menit"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="mood">
                          <Smile className="mr-1 inline h-3.5 w-3.5" />
                          Mood Anak
                        </FieldLabel>
                        <Select name="mood">
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sangat Baik">😊 Sangat Baik</SelectItem>
                            <SelectItem value="Baik">🙂 Baik</SelectItem>
                            <SelectItem value="Biasa">😐 Biasa</SelectItem>
                            <SelectItem value="Kurang Baik">😟 Kurang Baik</SelectItem>
                            <SelectItem value="Rewel">😢 Rewel</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="activities">
                          Aktivitas Hari Ini
                        </FieldLabel>
                        <Textarea
                          name="activities"
                          required
                          rows={3}
                          placeholder="Deskripsi kegiatan utama hari ini..."
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="note">
                          Catatan Tambahan
                        </FieldLabel>
                        <Textarea
                          name="note"
                          rows={2}
                          placeholder="Catatan khusus untuk orang tua (opsional)"
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex justify-end mt-2">
                      <Button type="submit">Simpan Laporan</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.reports.map((report) => (
                <li
                  key={report.id}
                  className="rounded-xl border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{report.studentName}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.activities}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {report.meals && (
                      <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5">
                        <Utensils className="h-3 w-3" />
                        {report.meals}
                      </span>
                    )}
                    {report.napDuration && (
                      <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5">
                        <Moon className="h-3 w-3" />
                        {report.napDuration}
                      </span>
                    )}
                    {report.mood && (
                      <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5">
                        <Smile className="h-3 w-3" />
                        {report.mood}
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {data.reports.length === 0 && (
                <li className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  Belum ada data laporan harian.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
