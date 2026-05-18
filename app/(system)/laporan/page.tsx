import { getReportsSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const data = await getReportsSnapshot();

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Laporan Harian</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aktivitas harian siswa untuk komunikasi sekolah-orang tua.
        </p>
        {!data.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {data.reports.map((report) => (
            <li key={report.id} className="rounded-xl border bg-background px-4 py-3">
              <p className="font-medium">{report.studentName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(report.date).toLocaleDateString("id-ID")} • {report.activities}
              </p>
            </li>
          ))}
          {data.reports.length === 0 && (
            <li className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada data laporan harian.
            </li>
          )}
        </ul>
      </article>

      <article className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Ringkasan Penilaian</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Rekap indikator perkembangan utama untuk evaluasi per periode.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Siswa</th>
                <th className="px-2 py-2 font-medium">Periode</th>
                <th className="px-2 py-2 font-medium">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {data.assessments.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-2 py-2">{item.studentName}</td>
                  <td className="px-2 py-2">{item.period}</td>
                  <td className="px-2 py-2">{item.avg}</td>
                </tr>
              ))}
              {data.assessments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-6 text-center text-muted-foreground">
                    Belum ada data penilaian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

