import { createAssessment } from "@/app/(system)/actions";
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
import { getAssessments, getStudents } from "@/lib/data";
import { SearchBar } from "@/components/data-table/search-bar";
import { Pagination } from "@/components/data-table/pagination";
import {
  ClipboardList,
  GraduationCap,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function RaportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  await requirePageAccess("/laporan", [
    "ADMIN",
    "TU",
    "GURU",
    "KEPALA_SEKOLAH",
  ]);

  const user = await getCurrentUser();
  const teacherId = user?.role === "GURU" && user.teacherId ? user.teacherId : undefined;

  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  const page = Number(resolvedParams?.page) || 1;

  const [data, students] = await Promise.all([
    getAssessments({ teacherId, search: query, page: page, limit: 10 }),
    getStudents({ teacherId, limit: 1000 }),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-gradient-to-br from-warm-pink/10 via-warm-purple/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Penilaian E-Raport
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola penilaian perkembangan anak (E-Raport) berbasis indikator kualitatif PAUD.
        </p>
        {!data.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center justify-between w-full">
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
            <div className="mt-4 w-full md:w-64">
              <SearchBar placeholder="Cari raport siswa..." />
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
            <div className="mt-4">
              <Pagination totalPages={data.totalPages || 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
