import { ActionForm } from "@/components/action-form";
import { createStudent, deleteStudent, updateStudentStatus, updateStudent } from "@/app/(system)/actions";
import Link from "next/link";
import { ExcelActions } from "./excel-actions";
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
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess } from "@/lib/auth";
import { getStudents } from "@/lib/data";
import { Users, UserPlus, Eye, Edit, MoreHorizontal, Trash } from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function studentBadgeColor(status: string) {
  if (status === "ACTIVE") return "default";
  if (status === "GRADUATED") return "secondary";
  if (status === "MUTATED") return "warning";
  return "destructive";
}

export default async function SiswaPage() {
  await requirePageAccess("/siswa", ["ADMIN", "KEPALA_SEKOLAH", "TU"]);

  const students = await getStudents();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Manajemen Siswa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola data siswa aktif, lulus, dan mutasi secara lengkap.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExcelActions />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Siswa Manual</DialogTitle>
                  <DialogDescription>
                    Input data siswa baru langsung ke database.
                  </DialogDescription>
                </DialogHeader>
                <ActionForm action={createStudent} className="mt-4 space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
                      <Input id="fullName" name="fullName" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="nickName">Nama Panggilan</FieldLabel>
                      <Input id="nickName" name="nickName" placeholder="Nama panggilan anak" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="birthPlace">Tempat Lahir</FieldLabel>
                      <Input id="birthPlace" name="birthPlace" />
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
                      <FieldLabel htmlFor="gender">Jenis Kelamin</FieldLabel>
                      <Select name="gender">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="nik">NIK Anak</FieldLabel>
                      <Input id="nik" name="nik" />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="allergies">Alergi / Kebutuhan Khusus</FieldLabel>
                      <Textarea
                        id="allergies"
                        name="allergies"
                        rows={2}
                        placeholder="Riwayat alergi atau kebutuhan khusus"
                      />
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
                  <div className="flex justify-end">
                    <Button type="submit">Simpan Siswa</Button>
                  </div>
                </ActionForm>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Siswa</CardTitle>
          <CardDescription>
            Daftar siswa beserta informasi wali dan kelas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Panggilan</TableHead>
                  <TableHead>Orang Tua</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.nickName || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.parent
                        ? [row.parent.fatherName, row.parent.motherName]
                          .filter(Boolean)
                          .join(" & ") || "-"
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.parent?.whatsapp || "-"}
                    </TableCell>
                    <TableCell>{row.classroom?.name ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="ghost" color={studentBadgeColor(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
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
                            <Link href={`/siswa/${row.id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                              Lihat Profil
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="w-full text-left flex items-center cursor-pointer px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground rounded-sm">
                                  <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Ubah Status
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Ubah Status Siswa</DialogTitle>
                                  <DialogDescription>
                                    Ubah status dari {row.fullName}. Jika siswa Lulus atau Mutasi, mereka akan dikeluarkan dari kelas saat ini.
                                  </DialogDescription>
                                </DialogHeader>
                                <ActionForm action={updateStudentStatus} className="space-y-4">
                                  <input type="hidden" name="studentId" value={row.id} />
                                  <FieldGroup>
                                    <Field>
                                      <FieldLabel htmlFor="status">Status Baru</FieldLabel>
                                      <Select name="status" defaultValue={row.status}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ACTIVE">Active (Aktif)</SelectItem>
                                          <SelectItem value="GRADUATED">Graduated (Lulus)</SelectItem>
                                          <SelectItem value="MUTATED">Mutated (Pindah/Mutasi)</SelectItem>
                                          <SelectItem value="INACTIVE">Inactive (Tidak Aktif)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </Field>
                                  </FieldGroup>
                                  <div className="flex justify-end pt-2">
                                    <Button type="submit">Simpan Perubahan</Button>
                                  </div>
                                </ActionForm>
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
                                    Konfirmasi Hapus Siswa
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus siswa ini?
                                    Semua data presensi, tagihan, dan laporan terkait
                                    juga akan terhapus.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <ActionForm action={deleteStudent} className="grid gap-4">
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
                                </ActionForm>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {students.rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Belum ada data siswa.
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
