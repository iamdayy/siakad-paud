import {
  createInvoice,
  deleteInvoice,
  recordPayment,
  updateInvoice,
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
import { getFinanceSnapshot, getStudents } from "@/lib/data";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusBadgeVariant(status: string) {
  if (status === "Lunas") return "default";
  if (status === "Sebagian") return "secondary";
  return "outline";
}

export default async function KeuanganPage() {
  await requirePageAccess("/keuangan", ["ADMIN", "TU"]);

  const finance = await getFinanceSnapshot();
  const students = await getStudents();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <CardTitle>Input Pembayaran SPP</CardTitle>
          <CardDescription>
            Rekam pembayaran, perbarui invoice, dan hapus tagihan dengan UI
            shadcn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border bg-secondary/60 p-4 text-sm">
            Total pemasukan tercatat:{" "}
            <span className="font-semibold">{toCurrency(finance.revenue)}</span>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">Buat Invoice Baru</h3>
                <p className="text-xs text-muted-foreground">
                  Buat tagihan bulanan untuk siswa aktif.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Buat Invoice Baru</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buat Invoice Baru</DialogTitle>
                    <DialogDescription>
                      Isi form berikut untuk membuat invoice baru.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={createInvoice}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="studentId">Siswa</FieldLabel>
                        <Select name="studentId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih siswa" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.rows.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="periodMonth">Bulan</FieldLabel>
                        <Input
                          id="periodMonth"
                          name="periodMonth"
                          type="number"
                          min={1}
                          max={12}
                          defaultValue={new Date().getMonth() + 1}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="periodYear">Tahun</FieldLabel>
                        <Input
                          id="periodYear"
                          name="periodYear"
                          type="number"
                          min={2000}
                          defaultValue={new Date().getFullYear()}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="amount">Nominal</FieldLabel>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          min={1}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="dueDate">
                          Tanggal Jatuh Tempo
                        </FieldLabel>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          defaultValue={toDateInput(new Date())}
                        />
                      </Field>
                    </FieldGroup>
                    <div className="sm:col-span-2 flex justify-end space-y-2 mt-4">
                      <Button type="submit">Simpan Invoice</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">Rekam Pembayaran</h3>
                <p className="text-xs text-muted-foreground">
                  Simpan pembayaran dan status invoice akan ikut diperbarui.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Rekam Pembayaran</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rekam Pembayaran</DialogTitle>
                    <DialogDescription>
                      Isi form berikut untuk merekam pembayaran baru.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={recordPayment}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="invoiceId">Invoice</FieldLabel>
                        <Select name="invoiceId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {finance.rows.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.code} - {invoice.student} (
                                {toCurrency(invoice.remaining)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="amount">Jumlah Bayar</FieldLabel>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          min={1}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="method">Metode</FieldLabel>
                        <Select name="method" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRANSFER">Transfer</SelectItem>
                            <SelectItem value="CASH">Tunai</SelectItem>
                            <SelectItem value="QRIS">QRIS</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="paidAt">Tanggal Bayar</FieldLabel>
                        <Input
                          id="paidAt"
                          name="paidAt"
                          type="date"
                          required
                          defaultValue={toDateInput(new Date())}
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="note">Catatan</FieldLabel>
                        <Textarea
                          id="note"
                          name="note"
                          rows={3}
                          placeholder="Opsional"
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex justify-end mt-4 gap-2">
                      <Button type="submit">Simpan Pembayaran</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Invoice</CardTitle>
          <CardDescription>
            Daftar tagihan, status pembayaran, dan aksi edit/hapus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!finance.dbReady && (
            <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Belum ada koneksi database.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Sisa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finance.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.code}</TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{toCurrency(row.amount)}</TableCell>
                  <TableCell>{toCurrency(row.remaining)}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Invoice</DialogTitle>
                            <DialogDescription>
                              Perbarui informasi invoice berikut.
                            </DialogDescription>
                          </DialogHeader>
                          <form action={updateInvoice}>
                            <input
                              type="hidden"
                              name="invoiceId"
                              value={row.id}
                            />
                            <FieldGroup>
                              <Field>
                                <FieldLabel htmlFor={`amount-${row.id}`}>
                                  Nominal
                                </FieldLabel>
                                <Input
                                  id={`amount-${row.id}`}
                                  name="amount"
                                  type="number"
                                  min={1}
                                  defaultValue={String(row.amount)}
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`dueDate-${row.id}`}>
                                  Tanggal Jatuh Tempo
                                </FieldLabel>
                                <Input
                                  id={`dueDate-${row.id}`}
                                  name="dueDate"
                                  type="date"
                                  defaultValue={toDateInput(
                                    new Date(row.dueDate ?? new Date()),
                                  )}
                                />
                              </Field>
                            </FieldGroup>
                            <div className="flex justify-end gap-2 mt-4">
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

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Hapus
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus Invoice</DialogTitle>
                            <DialogDescription>
                              Apakah Anda yakin ingin menghapus invoice{" "}
                              <strong>{row.code}</strong>?
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            action={deleteInvoice}
                            className="mt-4 grid gap-4"
                          >
                            <input
                              type="hidden"
                              name="invoiceId"
                              value={row.id}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                data-modal-close
                              >
                                Batal
                              </Button>
                              <Button type="submit" variant="destructive">
                                Hapus
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {finance.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Belum ada invoice.
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
