import { createStudent, deleteStudent } from "@/app/(system)/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess } from "@/lib/auth";
import { getStudents } from "@/lib/data";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function studentBadgeVariant(status: string) {
  if (status === "ACTIVE") return "default";
  if (status === "GRADUATED") return "secondary";
  return "outline";
}

export default async function SiswaPage() {
  await requirePageAccess("/siswa", ["ADMIN", "TU"]);

  const students = await getStudents();

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Siswa Manual</CardTitle>
          <CardDescription>
            Tambahkan siswa langsung ke database dengan tampilan yang konsisten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Form input cepat</p>
              <p className="text-xs text-muted-foreground">
                Gunakan modal agar alur tambah data tetap fokus dan ringkas.
              </p>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button>Tambah Siswa</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Siswa</DialogTitle>
                  <DialogDescription>
                    Isi form berikut untuk menambahkan siswa baru.
                  </DialogDescription>
                </DialogHeader>
                <form
                  action={createStudent}
                  className="mt-4 grid gap-4 sm:grid-cols-2"
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
                      <Input id="fullName" name="fullName" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="birthDate">Tanggal Lahir</FieldLabel>
                      <Input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        required
                        defaultValue={toDateInput(new Date())}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="guardianName">Nama Wali</FieldLabel>
                      <Input id="guardianName" name="guardianName" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="guardianPhone">
                        Telepon Wali
                      </FieldLabel>
                      <Input id="guardianPhone" name="guardianPhone" required />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="address">Alamat</FieldLabel>
                      <Textarea
                        id="address"
                        name="address"
                        rows={2}
                        placeholder="Alamat rumah"
                      />
                    </Field>
                  </FieldGroup>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Siswa</CardTitle>
          <CardDescription>
            Daftar siswa aktif, wali, dan kelas sebagai pusat data akademik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Wali</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.fullName}</TableCell>
                  <TableCell>{row.guardianName}</TableCell>
                  <TableCell>{row.guardianPhone}</TableCell>
                  <TableCell>{row.classroom?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={studentBadgeVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Hapus Guru
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus guru ini?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <form action={deleteStudent} className="grid gap-4">
                            <input
                              type="hidden"
                              name="studentId"
                              value={row.id}
                            />
                            <p>
                              Yakin ingin menghapus siswa{" "}
                              <strong>{row.fullName}</strong>?
                            </p>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button type="submit" variant="destructive">
                                  Hapus
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Belum ada data siswa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
