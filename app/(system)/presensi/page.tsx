import { recordAttendance } from "@/app/(system)/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requirePageAccess } from "@/lib/auth";
import { getAttendanceLogs, getStudents } from "@/lib/data";
import { Input } from "@base-ui/react";

export const dynamic = "force-dynamic";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function PresensiPage() {
  await requirePageAccess("/presensi", ["ADMIN", "TU", "GURU"]);

  const [logs, students] = await Promise.all([
    getAttendanceLogs(),
    getStudents(),
  ]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Input Presensi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Catat kehadiran harian siswa untuk pemantauan kelas dan rekap absensi.
        </p>
        <Dialog>
          <DialogTrigger className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            Tambah Presensi
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Presensi Siswa</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk menambahkan presensi siswa.
              </DialogDescription>
            </DialogHeader>
            <form action={recordAttendance} className="mt-2 grid gap-4">
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
                  <FieldLabel htmlFor="date">Tanggal</FieldLabel>
                  <Input
                    type="date"
                    name="date"
                    required
                    defaultValue={toDateInput(new Date())}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select name="status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Hadir</SelectItem>
                      <SelectItem value="SICK">Sakit</SelectItem>
                      <SelectItem value="PERMIT">Izin</SelectItem>
                      <SelectItem value="ABSENT">Alpa</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="note">Catatan</FieldLabel>
                  <Textarea
                    name="note"
                    rows={2}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end mt-4">
                <Button type="submit">Simpan Presensi</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                  <td className="px-2 py-2">
                    {new Date(row.date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-2 py-2">{row.status}</td>
                  <td className="px-2 py-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {logs.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-2 py-6 text-center text-muted-foreground"
                  >
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
