import {
  createExpense,
  createInvoice,
  deleteExpense,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess } from "@/lib/auth";
import { getExpenses, getFinanceSnapshot, getStudents } from "@/lib/data";
import { Banknote, CreditCard, DollarSign, Wallet } from "lucide-react";

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
  const expenses = await getExpenses();

  const balance = finance.revenue - finance.totalExpenses;

  return (
    <section className="space-y-6">
      {/* Header Arus Kas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {toCurrency(finance.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari SPP, Uang Pangkal, dan lainnya
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {toCurrency(finance.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini: {toCurrency(finance.monthlyExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {toCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? "Surplus" : "Defisit"} berjalan
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pemasukan" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="pemasukan" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Pemasukan (SPP/Invoice)
          </TabsTrigger>
          <TabsTrigger value="pengeluaran" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Pengeluaran (Belanja)
          </TabsTrigger>
        </TabsList>

        {/* TAB PEMASUKAN */}
        <TabsContent value="pemasukan" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card>
              <CardHeader>
                <CardTitle>Input Pemasukan</CardTitle>
                <CardDescription>
                  Rekam pembayaran SPP, Uang Pangkal, atau buat invoice baru.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                              <FieldLabel htmlFor="category">Kategori</FieldLabel>
                              <Select name="category" required defaultValue="SPP">
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SPP">SPP</SelectItem>
                                  <SelectItem value="PANGKAL">Uang Pangkal</SelectItem>
                                  <SelectItem value="CATERING">Catering</SelectItem>
                                  <SelectItem value="JEMPUTAN">Jemputan</SelectItem>
                                  <SelectItem value="OUTING">Outing/Kunjungan</SelectItem>
                                  <SelectItem value="BUKU">Buku/Alat Peraga</SelectItem>
                                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
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
                        Simpan pembayaran untuk mengurangi saldo invoice.
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
                                  {finance.rows.filter(r => r.remaining > 0).map((invoice) => (
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
                <CardTitle>Daftar Invoice Terakhir</CardTitle>
                <CardDescription>
                  Daftar tagihan, status pembayaran, dan aksi edit/hapus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Sisa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finance.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium text-xs">{row.code}</div>
                          <div className="text-muted-foreground">{row.category}</div>
                        </TableCell>
                        <TableCell>{row.student}</TableCell>
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
                                </DialogHeader>
                                <form action={updateInvoice}>
                                  <input type="hidden" name="invoiceId" value={row.id} />
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
                                        Jatuh Tempo
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
                                    <Button type="submit">Simpan</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>

                            <form action={deleteInvoice}>
                              <input type="hidden" name="invoiceId" value={row.id} />
                              <Button size="sm" variant="destructive" type="submit">
                                Hapus
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {finance.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                          Belum ada invoice.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB PENGELUARAN */}
        <TabsContent value="pengeluaran" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Pengeluaran Operasional</CardTitle>
                <CardDescription>
                  Catat semua biaya operasional, gaji, dan belanja sekolah.
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Catat Pengeluaran Baru</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan rincian pengeluaran kas sekolah.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={createExpense}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="category">Kategori Biaya</FieldLabel>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GAJI">Gaji Guru/Staf</SelectItem>
                            <SelectItem value="OPERASIONAL">Operasional (Listrik, Air, Internet)</SelectItem>
                            <SelectItem value="APE">Alat Permainan Edukatif (APE)</SelectItem>
                            <SelectItem value="ATK">Alat Tulis Kantor (ATK)</SelectItem>
                            <SelectItem value="PEMELIHARAAN">Pemeliharaan Gedung</SelectItem>
                            <SelectItem value="LAINNYA">Biaya Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="description">Deskripsi Pengeluaran</FieldLabel>
                        <Input
                          id="description"
                          name="description"
                          required
                          placeholder="Cth: Pembayaran listrik bulan ini"
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
                        <FieldLabel htmlFor="date">Tanggal</FieldLabel>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          required
                          defaultValue={toDateInput(new Date())}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="recipient">Penerima Dana (Opsional)</FieldLabel>
                        <Input id="recipient" name="recipient" placeholder="Nama penerima/vendor" />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="note">Keterangan Tambahan</FieldLabel>
                        <Textarea id="note" name="note" rows={2} />
                      </Field>
                    </FieldGroup>
                    <div className="flex justify-end pt-2 mt-4">
                      <Button type="submit" variant="destructive" className="bg-red-600">Simpan Pengeluaran</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode / Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium text-xs">{row.code}</div>
                        <div className="text-muted-foreground">{new Date(row.date).toLocaleDateString('id-ID')}</div>
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{row.description}</TableCell>
                      <TableCell>{row.recipient || "-"}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {toCurrency(row.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <form action={deleteExpense}>
                            <input type="hidden" name="expenseId" value={row.id} />
                            <Button size="sm" variant="outline" type="submit" className="text-red-500 hover:text-red-700">
                              Batal/Hapus
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Belum ada data pengeluaran yang dicatat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
