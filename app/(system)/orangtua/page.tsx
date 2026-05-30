import { requirePageAccess } from "@/lib/auth";
import { getGuardians } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OrangTuaPage() {
  await requirePageAccess("/orangtua", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const guardians = await getGuardians();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Daftar Orang Tua / Wali</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ringkasan data wali yang terdaftar melalui siswa.
        </p>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        {!guardians.dbReady && (
          <p className="mb-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Nama Wali</th>
                <th className="px-2 py-2 font-medium">Telepon</th>
              </tr>
            </thead>
            <tbody>
              {guardians.rows.map((g, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-2">{g.name}</td>
                  <td className="px-2 py-2">{g.phone ?? "-"}</td>
                </tr>
              ))}
              {guardians.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-2 py-6 text-center text-muted-foreground"
                  >
                    Belum ada data wali.
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
