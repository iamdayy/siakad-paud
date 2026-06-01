import { ActionForm } from "@/components/action-form";
import {
  approveAdmission,
  createAdmission,
  rejectAdmission,
} from "@/app/(system)/actions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
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
  DialogFooter,
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
import { getAdmissions } from "@/lib/data";
import { SearchBar } from "@/components/data-table/search-bar";
import { Pagination } from "@/components/data-table/pagination";
import {
  EllipsisVertical,
  UserPlus,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function mapAdmissionStatusToVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "destructive";
    default:
      return "default";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="h-3.5 w-3.5" />;
    case "APPROVED":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "REJECTED":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

export default async function PpdbPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  await requirePageAccess("/ppdb", ["ADMIN", "TU"]);

  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  const page = Number(resolvedParams?.page) || 1;

  const admissions = await getAdmissions({
    search: query,
    page: page,
    limit: 10,
  });

  const pendingCount = admissions.rows.filter(
    (r) => r.status === "PENDING",
  ).length;
  const approvedCount = admissions.rows.filter(
    (r) => r.status === "APPROVED",
  ).length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-purple/10 via-accent/10 to-transparent p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Penerimaan Peserta Didik Baru (PPDB)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola pendaftaran calon siswa baru: input data anak & orang tua,
          validasi dokumen, dan proses persetujuan.
        </p>
      </div>

      {/* Stats + Action */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Verifikasi
            </CardTitle>
            <Clock className="h-4 w-4 text-warm-orange" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warm-orange">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diterima
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-warm-green" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warm-green">
              {approvedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Buat Pendaftaran
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Form Pendaftaran PPDB</DialogTitle>
                <DialogDescription>
                  Isi data calon siswa dan orang tua secara lengkap.
                </DialogDescription>
              </DialogHeader>
              <ActionForm action={createAdmission} className="mt-4 space-y-6">
                {/* Step 1: Data Anak */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                    Data Anak
                  </h3>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="childName">Nama Lengkap</FieldLabel>
                      <Input id="childName" name="childName" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="nickName">Nama Panggilan</FieldLabel>
                      <Input
                        id="nickName"
                        name="nickName"
                        placeholder="Nama panggilan anak"
                      />
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
                      <FieldLabel htmlFor="childNik">NIK Anak</FieldLabel>
                      <Input id="childNik" name="childNik" />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="allergies">
                        Alergi / Kebutuhan Khusus
                      </FieldLabel>
                      <Textarea
                        id="allergies"
                        name="allergies"
                        rows={2}
                        placeholder="Riwayat alergi, kebutuhan khusus, riwayat imunisasi..."
                      />
                    </Field>
                  </FieldGroup>
                </div>

                {/* Step 2: Data Orang Tua */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                    Data Orang Tua / Wali
                  </h3>
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
                      <FieldLabel htmlFor="fatherJob">Pekerjaan Ayah</FieldLabel>
                      <Input id="fatherJob" name="fatherJob" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="motherJob">Pekerjaan Ibu</FieldLabel>
                      <Input id="motherJob" name="motherJob" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="whatsapp">
                        No. WhatsApp (Wajib Aktif)
                      </FieldLabel>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        required
                        placeholder="08xxxxxxxxxx"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="parentNik">
                        NIK Orang Tua
                      </FieldLabel>
                      <Input id="parentNik" name="parentNik" />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="address">Alamat</FieldLabel>
                      <Textarea
                        id="address"
                        name="address"
                        rows={2}
                        placeholder="Alamat rumah lengkap"
                      />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="notes">
                        Catatan Tambahan
                      </FieldLabel>
                      <Textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        placeholder="Catatan tambahan (opsional)"
                      />
                    </Field>
                  </FieldGroup>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" size="lg">
                    Simpan Pendaftaran
                  </Button>
                </div>
              </ActionForm>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Antrian PPDB</CardTitle>
              <CardDescription>
                Daftar pendaftar terbaru untuk proses validasi admin.
              </CardDescription>
            </div>
          </div>
          <div className="w-full md:w-64">
            <SearchBar placeholder="Cari nama anak..." />
          </div>
        </CardHeader>
        <CardContent>
          {!admissions.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anak</TableHead>
                <TableHead>Orang Tua</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.childName}
                    {row.nickName && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({row.nickName})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {[row.fatherName, row.motherName]
                      .filter(Boolean)
                      .join(" & ") || "-"}
                  </TableCell>
                  <TableCell className="text-xs">{row.whatsapp}</TableCell>
                  <TableCell>
                    <Badge
                      variant="ghost"
                      color={mapAdmissionStatusToVariant(row.status)}
                      className="gap-1"
                    >
                      {statusIcon(row.status)}
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(row.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <span className="sr-only">Actions</span>
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-40 grid gap-1">
                        {/* Detail Dialog */}
                        <DropdownMenuItem asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Lihat Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>
                                  Detail Pendaftaran {row.childName}
                                </DialogTitle>
                                <DialogDescription>
                                  Informasi lengkap pendaftaran untuk proses
                                  validasi.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-3 text-sm">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Nama Anak</p>
                                    <p>{row.childName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Nama Panggilan</p>
                                    <p>{row.nickName || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Tempat Lahir</p>
                                    <p>{row.birthPlace || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Tanggal Lahir</p>
                                    <p>{new Date(row.birthDate).toLocaleDateString("id-ID")}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Jenis Kelamin</p>
                                    <p>{row.gender || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">NIK Anak</p>
                                    <p>{row.childNik || "-"}</p>
                                  </div>
                                </div>
                                <hr />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Nama Ayah</p>
                                    <p>{row.fatherName || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Nama Ibu</p>
                                    <p>{row.motherName || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">WhatsApp</p>
                                    <p>{row.whatsapp}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Alamat</p>
                                    <p>{row.address || "-"}</p>
                                  </div>
                                </div>
                                {(row.allergies || row.specialNeeds) && (
                                  <>
                                    <hr />
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Alergi / Kebutuhan Khusus</p>
                                      <p>{row.allergies || row.specialNeeds || "-"}</p>
                                    </div>
                                  </>
                                )}
                                {row.notes && (
                                  <>
                                    <hr />
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Catatan</p>
                                      <p>{row.notes}</p>
                                    </div>
                                  </>
                                )}
                              </div>
                              <DialogFooter />
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuItem>

                        {row.status === "PENDING" && (
                          <>
                            {/* Approve */}
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Setujui pendaftaran
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Setujui pendaftaran {row.childName}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini akan membuat data Siswa dan
                                      Orang Tua baru, serta mengirim notifikasi
                                      WhatsApp ke {row.whatsapp}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <ActionForm action={approveAdmission}>
                                    <input
                                      type="hidden"
                                      name="admissionId"
                                      value={row.id}
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                      <Button type="submit">
                                        Ya, setujui
                                      </Button>
                                    </div>
                                  </ActionForm>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>

                            {/* Reject */}
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Tolak pendaftaran
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Tolak pendaftaran {row.childName}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Notifikasi penolakan akan dikirim ke{" "}
                                      {row.whatsapp}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <ActionForm
                                    action={rejectAdmission}
                                    className="flex flex-col gap-4 mt-4"
                                  >
                                    <input
                                      type="hidden"
                                      name="admissionId"
                                      value={row.id}
                                    />
                                    <Input
                                      name="reason"
                                      placeholder="Alasan penolakan"
                                      required
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        type="submit"
                                        variant="destructive"
                                      >
                                        Ya, tolak
                                      </Button>
                                    </div>
                                  </ActionForm>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {admissions.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Belum ada data pendaftaran.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination totalPages={admissions.totalPages || 0} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
