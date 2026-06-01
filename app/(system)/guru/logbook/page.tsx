import { ActionForm } from "@/components/action-form";
import { deleteLessonPlan, submitLessonPlan } from "@/app/(system)/actions";
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
import { requirePageAccess } from "@/lib/auth";
import { getLessonPlans, getTeachers } from "@/lib/data";
import { BookOpen, Link as LinkIcon, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function LogbookPage() {
  await requirePageAccess("/guru/logbook", ["ADMIN", "TU", "GURU"]);

  const teachers = await getTeachers();
  const lessonPlans = await getLessonPlans();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-orange/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BookOpen className="h-6 w-6 text-primary" />
              Logbook Guru (RPPH / RPPM)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unggah dan kelola Rencana Pelaksanaan Pembelajaran Harian (RPPH)
              atau Mingguan (RPPM).
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Unggah Logbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Unggah RPPH / RPPM</DialogTitle>
                <DialogDescription>
                  Masukkan rencana pembelajaran. Anda dapat mencantumkan URL file
                  dokumen atau menulis konten secara langsung.
                </DialogDescription>
              </DialogHeader>
              <ActionForm action={submitLessonPlan} className="mt-4 space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="teacherId">Guru Pendidik</FieldLabel>
                    <Select name="teacherId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Guru" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.rows.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="title">Judul Tema / Subtema</FieldLabel>
                    <Input
                      id="title"
                      name="title"
                      required
                      placeholder="Cth: Tema Diriku / Tubuhku"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="type">Jenis</FieldLabel>
                    <Select name="type" required defaultValue="RPPH">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RPPH">RPPH (Harian)</SelectItem>
                        <SelectItem value="RPPM">RPPM (Mingguan)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="weekDate">Tanggal Berlaku</FieldLabel>
                    <Input
                      id="weekDate"
                      name="weekDate"
                      type="date"
                      required
                      defaultValue={toDateInput(new Date())}
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="fileUrl">Tautan File (Opsional)</FieldLabel>
                    <Input
                      id="fileUrl"
                      name="fileUrl"
                      type="url"
                      placeholder="https://docs.google.com/..."
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Gunakan tautan Google Drive atau layanan cloud lainnya.</p>
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="content">Isi Rencana / Catatan (Opsional)</FieldLabel>
                    <Textarea
                      id="content"
                      name="content"
                      rows={4}
                      placeholder="Tulis garis besar pembelajaran..."
                    />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end pt-2">
                  <Button type="submit">Simpan Logbook</Button>
                </div>
              </ActionForm>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Rencana Pembelajaran</CardTitle>
          <CardDescription>
            Dokumen persiapan mengajar pendidik yang telah disubmit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Guru Pendidik</TableHead>
                  <TableHead>Judul Tema</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tautan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessonPlans.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(row.weekDate).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="font-medium">{row.teacher.name}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{row.title}</TableCell>
                    <TableCell>
                      <Badge variant={row.type === "RPPH" ? "default" : "secondary"}>
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.fileUrl ? (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" /> Buka
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ActionForm action={deleteLessonPlan}>
                          <input type="hidden" name="lessonPlanId" value={row.id} />
                          <Button size="sm" variant="destructive" type="submit">
                            Hapus
                          </Button>
                        </ActionForm>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lessonPlans.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada logbook yang diunggah.
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
