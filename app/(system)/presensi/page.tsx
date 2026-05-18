import { recordAttendance } from "@/app/(system)/actions";
import { getAttendanceLogs, getStudents } from "@/lib/data";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function PresensiPage() {
  const [logs, students] = await Promise.all([getAttendanceLogs(), getStudents()]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Input Presensi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Catat kehadiran harian siswa untuk pemantauan kelas dan rekap absensi.
        </p>
        <form action={recordAttendance} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Siswa
            <select name="studentId" required className="rounded-xl border bg-background px-3 py-2">
              <option value="">Pilih siswa</option>
              {students.rows.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Tanggal
            <input
              type="date"
              name="date"
              required
              defaultValue={toDateInput(new Date())}
              className="rounded-xl border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Status
            <select name="status" required className="rounded-xl border bg-background px-3 py-2">
              <option value="PRESENT">Hadir</option>
              <option value="SICK">Sakit</option>
              <option value="PERMIT">Izin</option>
              <option value="ABSENT">Alpa</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Catatan
            <textarea name="note" rows={2} className="rounded-xl border bg-background px-3 py-2" />
          </label>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            Simpan Presensi
          </button>
        </form>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Log Presensi Terbaru</h3>
        {!logs.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
            Belum ada koneksi database.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Siswa</th>
                <th className="px-2 py-2 font-medium">Tanggal</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {logs.rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-2 py-2">{row.studentName}</td>
                  <td className="px-2 py-2">{new Date(row.date).toLocaleDateString("id-ID")}</td>
                  <td className="px-2 py-2">{row.status}</td>
                  <td className="px-2 py-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {logs.rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">
                    Belum ada log presensi.
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

