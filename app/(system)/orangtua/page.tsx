import { ActionForm } from "@/components/action-form";
import {
  createParent,
  deleteParent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getGuardians } from "@/lib/data";
import { Users, UserPlus, Eye, Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { EditParentForm } from "./[id]/edit-form";

export const dynamic = "force-dynamic";

export default async function OrangTuaPage() {
  await requirePageAccess("/orangtua", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const guardians = await getGuardians();

  const handleCreate = async (formData: FormData) => {
    "use server";
    await createParent(formData);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-pink/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-warm-pink" />
              Daftar Orang Tua / Wali
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Data orang tua/wali yang terdaftar dan anak-anak terkait.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Tambah Orang Tua
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Data Orang Tua</DialogTitle>
                <DialogDescription>
                  Masukkan kontak dan biodata orang tua baru.
                </DialogDescription>
              </DialogHeader>
              <ActionForm action={handleCreate} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="fatherName">Nama Ayah</FieldLabel>
                    <Input id="fatherName" name="fatherName" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="motherName">Nama Ibu</FieldLabel>
                    <Input id="motherName" name="motherName" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="whatsapp">No. WhatsApp</FieldLabel>
                    <Input id="whatsapp" name="whatsapp" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address">Alamat</FieldLabel>
                    <Input id="address" name="address" />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" data-modal-close>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </ActionForm>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Orang Tua</CardTitle>
          <CardDescription>Informasi kontak dan relasi ke siswa.</CardDescription>
        </CardHeader>
        <CardContent>
          {!guardians.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Ayah</TableHead>
                  <TableHead>Nama Ibu</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Anak</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardians.rows.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.fatherName || "-"}</TableCell>
                    <TableCell>{g.motherName || "-"}</TableCell>
                    <TableCell className="text-xs">{g.whatsapp}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                      {g.address || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {g.children.length > 0 ? g.children.join(", ") : "-"}
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
                            <Link href={`/orangtua/${g.id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                              Lihat Profil
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <EditParentForm parent={g} asMenuItem />
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
                                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus data orang tua ini? Ini juga dapat melepaskan relasi anak dari orang tua.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <ActionForm action={deleteParent} className="space-y-4">
                                  <input type="hidden" name="id" value={g.id} />
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
                {guardians.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada data orang tua.
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
