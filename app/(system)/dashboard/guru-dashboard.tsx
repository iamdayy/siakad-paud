import { getGuruDashboardStats } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, AlertCircle, CheckCircle2, Sparkles, Calendar, Bell } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function GuruDashboard({ user }: { user: any }) {
  if (!user.teacherId) return null;

  const stats = await getGuruDashboardStats(user.teacherId);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-pink-500/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Selamat Datang, {user.displayName || user.username}!
              </h2>
              <p className="text-sm text-muted-foreground">
                Berikut adalah ringkasan aktivitas kelas Anda hari ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Anak Asuh */}
        <Link href="/guru/kelas" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Anak Asuh</CardTitle>
              <div className="rounded-xl bg-blue-500/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
              <p className="mt-1 text-xs text-muted-foreground">di {stats.classesCount} kelas</p>
            </CardContent>
          </Card>
        </Link>

        {/* Hadir Hari Ini */}
        <Card className="relative overflow-hidden">
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hadir Hari Ini</CardTitle>
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-emerald-600">{stats.presentToday}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.absentToday} absen, {stats.unrecordedAttendance} belum dicatat
            </p>
          </CardContent>
        </Card>

        {/* Buku Penghubung Selesai */}
        <Card className="relative overflow-hidden">
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buku Penghubung</CardTitle>
            <div className="rounded-xl bg-amber-500/10 p-2.5">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-3xl font-bold text-amber-600">{stats.filledReports}</p>
            <p className="mt-1 text-xs text-muted-foreground">laporan harian diselesaikan</p>
          </CardContent>
        </Card>

        {/* Laporan Menunggu */}
        <Link href="/guru/kelas" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Laporan Tertunda</CardTitle>
              <div className="rounded-xl bg-destructive/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-destructive">{stats.pendingReports}</p>
              <p className="mt-1 text-xs text-muted-foreground">anak belum mendapat laporan</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Informatif Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Jadwal Mengajar Anda
            </CardTitle>
            <CardDescription>Jadwal rutin harian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 text-sm font-semibold text-muted-foreground">07:30</div>
                <div className="flex-1 rounded-md bg-muted p-2 text-sm border-l-4 border-emerald-500">
                  <div className="font-medium">Penyambutan Anak</div>
                  <div className="text-xs text-muted-foreground">Halaman Sekolah</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-sm font-semibold text-muted-foreground">08:00</div>
                <div className="flex-1 rounded-md bg-muted p-2 text-sm border-l-4 border-blue-500">
                  <div className="font-medium">Kegiatan Inti (RPPH)</div>
                  <div className="text-xs text-muted-foreground">Sesuai Tema Kelas</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-sm font-semibold text-muted-foreground">10:00</div>
                <div className="flex-1 rounded-md bg-muted p-2 text-sm border-l-4 border-amber-500">
                  <div className="font-medium">Makan & Istirahat</div>
                  <div className="text-xs text-muted-foreground">Ruang Makan</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Pengumuman Sekolah
            </CardTitle>
            <CardDescription>Pesan terbaru dari Kepala Sekolah / Admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                  Persiapan Lomba Mewarnai
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bunda-bunda harap mengingatkan anak-anak membawa krayon besok. Lomba akan diadakan di aula utama jam 09:00.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">Dari: Kepala Sekolah • 2 Jam yang lalu</div>
              </div>
              
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-2 w-2 rounded-full bg-muted-foreground" />
                  Batas Akhir Pengumpulan RPPM
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mohon segera unggah RPPM minggu depan paling lambat hari Jumat pukul 14:00.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">Dari: Admin TU • Kemarin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
