import { createAdmission } from "@/app/(system)/actions";
import { getAdmissions } from "@/lib/data";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function PpdbPage() {
  const admissions = await getAdmissions();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Form Pendaftaran PPDB</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Input data calon siswa baru. Data yang tersimpan akan masuk antrian verifikasi.
        </p>
        <form action={createAdmission} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Nama Anak
            <input name="childName" required className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Tanggal Lahir
            <input
              type="date"
              name="birthDate"
              required
              defaultValue={toDateInput(new Date())}
              className="rounded-xl border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Nama Wali
            <input name="parentName" required className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Telepon Wali
            <input name="parentPhone" required className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Alamat
            <textarea name="address" rows={2} className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Catatan
            <textarea name="notes" rows={2} className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            Simpan Pendaftaran
          </button>
        </form>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Antrian PPDB Terbaru</h3>
        <p className="mt-1 text-sm text-muted-foreground">10 pendaftar terbaru untuk proses validasi admin.</p>
        {!admissions.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Anak</th>
                <th className="px-2 py-2 font-medium">Wali</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {admissions.rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-2 py-2">{row.childName}</td>
                  <td className="px-2 py-2">{row.parentName}</td>
                  <td className="px-2 py-2">{row.status}</td>
                  <td className="px-2 py-2">{new Date(row.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {admissions.rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">
                    Belum ada data pendaftaran.
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

