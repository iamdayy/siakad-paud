import {
  createTeacher,
  deleteTeacher,
  updateTeacher,
} from "@/app/(system)/actions";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { requirePageAccess } from "@/lib/auth";
import { getTeachers } from "@/lib/data";
import { Eye, Plus, UserCheck, MoreHorizontal, Edit, Trash, GraduationCap, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  await requirePageAccess("/guru", ["ADMIN", "TU"]);

  const teachers = await getTeachers();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-green/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Manajemen Guru & Staf
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola data pendidik dan tenaga kependidikan (PTK).
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Tambah Guru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Guru / Staf</DialogTitle>
                <DialogDescription>
                  Isi biodata guru baru ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <form action={createTeacher} className="mt-2 space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                    <Input id="name" name="name" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="position">Jabatan</FieldLabel>
                    <Select name="position">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KEPALA_SEKOLAH">Kepala Sekolah</SelectItem>
                        <SelectItem value="GURU_KELAS">Guru Kelas</SelectItem>
                        <SelectItem value="GURU_PENDAMPING">Guru Pendamping</SelectItem>
                        <SelectItem value="STAFF_ADMINISTRASI">Staff Administrasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Telepon</FieldLabel>
                    <Input id="phone" name="phone" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastEducation">Pendidikan Terakhir</FieldLabel>
                    <Input id="lastEducation" name="lastEducation" placeholder="S1 PGPAUD" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="certificationNumber">No. Sertifikasi</FieldLabel>
                    <Input id="certificationNumber" name="certificationNumber" placeholder="Opsional" />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end">
                  <Button type="submit">Simpan Guru</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                <TableHead>Jabatan</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="ghost" color="default">
                      {t.position.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.email ?? "-"}</TableCell>
                  <TableCell className="text-sm">{t.phone ?? "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.lastEducation ?? "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/guru/${t.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            Lihat Profil
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-full text-left flex items-center cursor-pointer px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground rounded-sm">
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Guru
                              </button>
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
                                <div className="mt-4 flex justify-end gap-2">
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
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="w-full text-left flex items-center cursor-pointer px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive/10 hover:text-destructive rounded-sm">
                                <Trash className="mr-2 h-4 w-4" />
                                Hapus
                              </button>
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
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {teachers.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
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
