import { getStudents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const students = await getStudents();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Data Siswa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Daftar siswa aktif, wali, dan kelas sebagai pusat data akademik.
        </p>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        {!students.dbReady && (
          <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Nama</th>
                <th className="px-2 py-2 font-medium">Wali</th>
                <th className="px-2 py-2 font-medium">Telepon</th>
                <th className="px-2 py-2 font-medium">Kelas</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-2 py-2">{row.fullName}</td>
                  <td className="px-2 py-2">{row.guardianName}</td>
                  <td className="px-2 py-2">{row.guardianPhone}</td>
                  <td className="px-2 py-2">{row.classroom?.name ?? "-"}</td>
                  <td className="px-2 py-2">{row.status}</td>
                </tr>
              ))}
              {students.rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">
                    Belum ada data siswa.
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

