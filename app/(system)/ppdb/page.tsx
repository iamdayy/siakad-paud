import {
  approveAdmission,
  createAdmission,
  rejectAdmission,
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

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function admissionBadgeVariant(status: string) {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

export default async function PpdbPage() {
  await requirePageAccess("/ppdb", ["ADMIN", "TU"]);

  const admissions = await getAdmissions();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Form Pendaftaran PPDB</CardTitle>
          <CardDescription>
            Input data calon siswa baru dan kirim ke antrian verifikasi admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Buat pendaftaran baru</p>
              <p className="text-xs text-muted-foreground">
                Form tetap memakai server action yang sama, tetapi tampil lebih
                konsisten.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Buat Pendaftaran</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Form Pendaftaran PPDB</DialogTitle>
                  <DialogDescription>
                    Isi form berikut untuk membuat pendaftaran baru.
                  </DialogDescription>
                </DialogHeader>
                <form action={createAdmission} className="mt-4 grid gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="childName">Nama Anak</FieldLabel>
                      <Input id="childName" name="childName" required />
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
                      <FieldLabel htmlFor="parentName">Nama Wali</FieldLabel>
                      <Input id="parentName" name="parentName" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="parentPhone">
                        Telepon Wali
                      </FieldLabel>
                      <Input id="parentPhone" name="parentPhone" required />
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
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                      <Textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        placeholder="Kesehatan, alergi, atau kebutuhan khusus"
                      />
                    </Field>
                  </FieldGroup>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="submit">Simpan Pendaftaran</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Antrian PPDB Terbaru</CardTitle>
          <CardDescription>
            10 pendaftar terbaru untuk proses validasi admin.
          </CardDescription>
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
                <TableHead>Wali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.childName}</TableCell>
                  <TableCell>{row.parentName}</TableCell>
                  <TableCell>
                    <Badge variant={admissionBadgeVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {row.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <form action={approveAdmission}>
                          <input
                            type="hidden"
                            name="admissionId"
                            value={row.id}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          >
                            Terima
                          </Button>
                        </form>
                        <form
                          action={rejectAdmission}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="admissionId"
                            value={row.id}
                          />
                          <Input
                            name="reason"
                            placeholder="Alasan"
                            className="w-40"
                          />
                          <Button type="submit" size="sm" variant="destructive">
                            Tolak
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {admissions.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Belum ada data pendaftaran.
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
