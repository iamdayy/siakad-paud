import {
  assignStudentsToClass,
  createClassroom,
  deleteClassroom,
  updateClassroom,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentMultiSelect } from "@/components/student-multi-select";
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
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Library, Users, ShieldAlert, MoreHorizontal, Trash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KelasPage() {
  await requirePageAccess("/kelas", ["ADMIN", "KEPALA_SEKOLAH", "TU"]);

  // Fetch data
  const classrooms = await prisma.classroom.findMany({
    include: {
      mainTeacher: true,
      coTeacher: true,
      _count: {
        select: { students: true },
      },
    },
    orderBy: [{ schoolYear: "desc" }, { level: "asc" }, { name: "asc" }],
  });

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  // Ambil siswa yang statusnya ACTIVE tapi belum masuk kelas mana pun (Floating)
  const floatingStudents = await prisma.student.findMany({
    where: {
      status: "ACTIVE",
      classroomId: null,
    },
    orderBy: { fullName: "asc" },
  });

  const levels = ["Daycare", "KB", "TK A", "TK B"];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-pink/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Library className="h-6 w-6 text-primary" />
              Manajemen Kelas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola kelas, tugaskan Wali Kelas, dan pindahkan siswa ke dalam
              kelompok belajar.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Library className="h-4 w-4" />
                Tambah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Kelas Baru</DialogTitle>
                <DialogDescription>
                  Atur kapasitas dan tugaskan guru.
                </DialogDescription>
              </DialogHeader>
              <form action={createClassroom} className="mt-4 space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama Kelas</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Cth: Anggrek"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="level">Tingkatan</FieldLabel>
                    <Select name="level" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="schoolYear">Tahun Ajaran</FieldLabel>
                    <Input
                      id="schoolYear"
                      name="schoolYear"
                      required
                      placeholder="Cth: 2024/2025"
                      defaultValue="2024/2025"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="maxCapacity">
                      Kapasitas Maksimal
                    </FieldLabel>
                    <Input
                      id="maxCapacity"
                      name="maxCapacity"
                      type="number"
                      required
                      defaultValue={15}
                      min={1}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="mainTeacherId">Wali Kelas</FieldLabel>
                    <Select name="mainTeacherId">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih guru utama" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="coTeacherId">Guru Pendamping</FieldLabel>
                    <Select name="coTeacherId">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih guru pendamping" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end pt-2">
                  <Button type="submit">Simpan Kelas</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Tabel Kelas */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kelas Aktif</CardTitle>
            <CardDescription>
              Pantau rasio jumlah siswa terhadap kapasitas maksimal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kelas & Tingkat</TableHead>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Wali Kelas</TableHead>
                    <TableHead>Pendamping</TableHead>
                    <TableHead className="text-center">Kapasitas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classrooms.map((row) => {
                    const isFull = row._count.students >= row.maxCapacity;
                    const isOver = row._count.students > row.maxCapacity;
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.level}
                          </div>
                        </TableCell>
                        <TableCell>{row.schoolYear}</TableCell>
                        <TableCell className="text-sm">
                          {row.mainTeacher?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.coTeacher?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={isOver ? "destructive" : isFull ? "secondary" : "outline"}
                            className="font-mono"
                          >
                            {row._count.students} / {row.maxCapacity}
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="w-full text-left flex items-center cursor-pointer px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground rounded-sm">
                                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                      Isi Kelas
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Masukkan Siswa ke Kelas {row.name}</DialogTitle>
                                      <DialogDescription>
                                        Pilih siswa yang belum memiliki kelas (Floating) untuk ditambahkan ke sini.
                                        Kapasitas tersisa: {Math.max(0, row.maxCapacity - row._count.students)}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form action={assignStudentsToClass} className="mt-4 space-y-4">
                                      <input type="hidden" name="classroomId" value={row.id} />

                                      {floatingStudents.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                          Tidak ada siswa aktif yang berstatus floating (belum memiliki kelas).
                                        </div>
                                      ) : (
                                        <div className="max-h-[40vh] space-y-2 overflow-y-auto rounded-md border p-2">
                                          <StudentMultiSelect students={floatingStudents} />
                                        </div>
                                      )}

                                      <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={floatingStudents.length === 0}>
                                          Tambahkan Siswa
                                        </Button>
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
                                      <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Semua siswa di kelas ini akan kehilangan penugasannya dan kembali berstatus Floating.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <form action={deleteClassroom}>
                                      <input type="hidden" name="classroomId" value={row.id} />
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
                    );
                  })}
                  {classrooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Belum ada kelas yang dibuat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info Floating Students */}
        <div className="space-y-6">
          <Card className="border-warm-orange/30 bg-warm-orange/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-warm-orange">
                <ShieldAlert className="h-5 w-5" />
                Siswa Floating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warm-orange">
                {floatingStudents.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Siswa berstatus AKTIF yang belum dimasukkan ke kelas manapun.
              </p>

              <div className="mt-4 max-h-[30vh] overflow-y-auto space-y-2">
                {floatingStudents.map(s => (
                  <div key={s.id} className="rounded-md bg-background px-3 py-2 text-sm shadow-sm border border-warm-orange/20">
                    <div className="font-medium truncate">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground">{s.nis ? `NIS: ${s.nis}` : 'Belum ada NIS'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
