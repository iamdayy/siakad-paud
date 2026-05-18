import { recordPayment } from "@/app/(system)/actions";
import { getFinanceSnapshot } from "@/lib/data";

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

export default async function KeuanganPage() {
  const finance = await getFinanceSnapshot();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Input Pembayaran SPP</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Rekam pembayaran berdasarkan invoice agar status tagihan otomatis terbarui.
        </p>
        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
          Total pemasukan tercatat: <span className="font-semibold">{toCurrency(finance.revenue)}</span>
        </div>
        <form action={recordPayment} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Invoice
            <select name="invoiceId" required className="rounded-xl border bg-background px-3 py-2">
              <option value="">Pilih invoice</option>
              {finance.rows.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.code} - {invoice.student} ({toCurrency(invoice.remaining)})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Jumlah Bayar
            <input type="number" name="amount" min={1} required className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Metode
            <select name="method" required className="rounded-xl border bg-background px-3 py-2">
              <option value="TRANSFER">Transfer</option>
              <option value="CASH">Tunai</option>
              <option value="QRIS">QRIS</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Tanggal Bayar
            <input
              type="date"
              name="paidAt"
              required
              defaultValue={toDateInput(new Date())}
              className="rounded-xl border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Catatan
            <textarea name="note" rows={2} className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            Simpan Pembayaran
          </button>
        </form>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Ringkasan Invoice</h3>
        {!finance.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Kode</th>
                <th className="px-2 py-2 font-medium">Siswa</th>
                <th className="px-2 py-2 font-medium">Periode</th>
                <th className="px-2 py-2 font-medium">Nominal</th>
                <th className="px-2 py-2 font-medium">Sisa</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {finance.rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-2 py-2">{row.code}</td>
                  <td className="px-2 py-2">{row.student}</td>
                  <td className="px-2 py-2">{row.period}</td>
                  <td className="px-2 py-2">{toCurrency(row.amount)}</td>
                  <td className="px-2 py-2">{toCurrency(row.remaining)}</td>
                  <td className="px-2 py-2">{row.status}</td>
                </tr>
              ))}
              {finance.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">
                    Belum ada invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

