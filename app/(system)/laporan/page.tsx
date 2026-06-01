import {
  createDailyReport,
  createAssessment,
} from "@/app/(system)/actions";
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
import { getReportsSnapshot, getStudents } from "@/lib/data";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Plus,
  Utensils,
  Moon,
  Smile,
} from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

const assessmentIndicators = [
  { value: "BB", label: "BB — Belum Berkembang" },
  { value: "MB", label: "MB — Mulai Berkembang" },
  { value: "BSH", label: "BSH — Berkembang Sesuai Harapan" },
  { value: "BSB", label: "BSB — Berkembang Sangat Baik" },
];

const assessmentAspects = [
  { key: "agamaMoral", label: "Nilai Agama & Moral", narasiKey: "narasiAgamaMoral" },
  { key: "fisikMotorik", label: "Fisik-Motorik", narasiKey: "narasiFisikMotorik" },
  { key: "kognitif", label: "Kognitif", narasiKey: "narasiKognitif" },
  { key: "bahasa", label: "Bahasa", narasiKey: "narasiBahasa" },
  { key: "sosialEmosional", label: "Sosial-Emosional", narasiKey: "narasiSosialEmosional" },
  { key: "seni", label: "Seni", narasiKey: "narasiSeni" },
];

function indicatorColor(indicator: string) {
  switch (indicator) {
    case "Belum Berkembang":
      return "destructive";
    case "Mulai Berkembang":
      return "warning";
    case "Berkembang Sesuai Harapan":
      return "default";
    case "Berkembang Sangat Baik":
      return "success";
    default:
      return "default";
  }
}

export default async function LaporanPage() {
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
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-pink/10 via-warm-purple/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Laporan & Penilaian
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola buku penghubung digital (Daily Report) dan penilaian
          perkembangan anak (E-Raport) berbasis indikator kualitatif PAUD.
        </p>
        {!data.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Daily Report Section ─────────────────────────────────────── */}
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

        {/* ─── Assessment / E-Raport Section ────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-warm-purple" />
                <div>
                  <CardTitle>Penilaian E-Raport</CardTitle>
                  <CardDescription>
                    6 aspek perkembangan PAUD dengan indikator BB, MB, BSH, BSB.
                  </CardDescription>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Buat Penilaian
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Form Penilaian Perkembangan Anak
                    </DialogTitle>
                    <DialogDescription>
                      Isi penilaian berdasarkan 6 aspek perkembangan PAUD.
                      Setiap aspek menggunakan indikator: BB (Belum Berkembang),
                      MB (Mulai Berkembang), BSH (Berkembang Sesuai Harapan),
                      BSB (Berkembang Sangat Baik).
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    action={async (formData) => {
                      "use server";
                      await createAssessment(formData);
                    }}
                    className="mt-2 space-y-6"
                  >
                    {/* Student & Period */}
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
                        <FieldLabel htmlFor="periodLabel">
                          Periode Penilaian
                        </FieldLabel>
                        <Input
                          name="periodLabel"
                          required
                          placeholder="Contoh: Semester 1 2025/2026"
                        />
                      </Field>
                    </FieldGroup>

                    {/* 6 Assessment Aspects */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        Aspek Perkembangan
                      </h3>
                      {assessmentAspects.map((aspect) => (
                        <div
                          key={aspect.key}
                          className="rounded-xl border bg-muted/30 p-4 space-y-3"
                        >
                          <p className="text-sm font-medium">{aspect.label}</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field>
                              <FieldLabel>Indikator</FieldLabel>
                              <Select name={aspect.key} required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih indikator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {assessmentIndicators.map((ind) => (
                                    <SelectItem
                                      key={ind.value}
                                      value={ind.value}
                                    >
                                      {ind.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field>
                              <FieldLabel>Narasi Deskriptif</FieldLabel>
                              <Textarea
                                name={aspect.narasiKey}
                                rows={2}
                                placeholder={`Deskripsi perkembangan ${aspect.label.toLowerCase()}...`}
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* General Narrative */}
                    <FieldGroup>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="narrative">
                          Narasi Keseluruhan (Raport)
                        </FieldLabel>
                        <Textarea
                          name="narrative"
                          rows={4}
                          placeholder="Catatan umum perkembangan anak untuk raport narasi semester..."
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="note">
                          Rekomendasi Guru
                        </FieldLabel>
                        <Textarea
                          name="note"
                          rows={2}
                          placeholder="Saran dan rekomendasi untuk orang tua..."
                        />
                      </Field>
                    </FieldGroup>

                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        Simpan Penilaian
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Agama</TableHead>
                    <TableHead>Motorik</TableHead>
                    <TableHead>Kognitif</TableHead>
                    <TableHead>Bahasa</TableHead>
                    <TableHead>Sosial</TableHead>
                    <TableHead>Seni</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assessments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-xs">{item.period}</TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.agamaMoral)}
                        >
                          {item.agamaMoral.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.fisikMotorik)}
                        >
                          {item.fisikMotorik.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.kognitif)}
                        >
                          {item.kognitif.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.bahasa)}
                        >
                          {item.bahasa.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.sosialEmosional)}
                        >
                          {item.sosialEmosional.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="ghost"
                          color={indicatorColor(item.seni)}
                        >
                          {item.seni.split(" ")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isPublished ? "default" : "secondary"}>
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/raport/${item.id}/print`} target="_blank">
                            Cetak
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.assessments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Belum ada data penilaian.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
