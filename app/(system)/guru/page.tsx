import {
  createTeacher,
  deleteTeacher,
  updateTeacher,
} from "@/app/(system)/actions";
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
import { requirePageAccess } from "@/lib/auth";
import { getTeachers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  await requirePageAccess("/guru", ["ADMIN", "TU"]);

  const teachers = await getTeachers();

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Guru</CardTitle>
          <CardDescription>
            Tambah dan kelola data guru dengan komponen shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Tambah Guru</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Guru</DialogTitle>
                <DialogDescription>
                  Isi form berikut untuk menambahkan guru baru ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <form
                action={createTeacher}
                className="mt-2 grid gap-4 sm:grid-cols-3"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama</FieldLabel>
                    <Input id="name" name="name" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Telepon</FieldLabel>
                    <Input id="phone" name="phone" />
                  </Field>
                </FieldGroup>
                <div className="sm:col-span-3 flex justify-end gap-2 mt-4">
                  <Button type="submit">Simpan Guru</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {!teachers.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.email ?? "-"}</TableCell>
                  <TableCell>{t.phone ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Guru</DialogTitle>
                            <DialogDescription>
                              Ubah informasi guru sesuai kebutuhan.
                            </DialogDescription>
                          </DialogHeader>
                          <form action={updateTeacher}>
                            <FieldGroup className="mt-4">
                              <Field>
                                <FieldLabel htmlFor={`name-${t.id}`}>
                                  Nama
                                </FieldLabel>
                                <Input
                                  id={`name-${t.id}`}
                                  name="name"
                                  defaultValue={t.name}
                                  required
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`email-${t.id}`}>
                                  Email
                                </FieldLabel>
                                <Input
                                  id={`email-${t.id}`}
                                  name="email"
                                  type="email"
                                  defaultValue={t.email ?? ""}
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`phone-${t.id}`}>
                                  Telepon
                                </FieldLabel>
                                <Input
                                  id={`phone-${t.id}`}
                                  name="phone"
                                  defaultValue={t.phone ?? ""}
                                />
                              </Field>
                            </FieldGroup>
                            <div className="mt-2 flex justify-end gap-2 mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                data-modal-close
                              >
                                Batal
                              </Button>
                              <Button type="submit">Simpan</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

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
                          <form action={deleteTeacher} className="grid gap-4">
                            <input
                              type="hidden"
                              name="teacherId"
                              value={t.id}
                            />
                            <p>
                              Yakin ingin menghapus guru{" "}
                              <strong>{t.name}</strong>?
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
              {teachers.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Belum ada data guru.
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
