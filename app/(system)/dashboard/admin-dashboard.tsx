import { requirePageAccess } from "@/lib/auth";
import {
  getDashboardStats,
  getPendingAdmissionsForDashboard,
  getArrearsStudents,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  Wallet,
  FileCheck,
  CalendarCheck,
  BookOpen,
  Building2,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export async function AdminDashboard() {
  const [stats, pendingAdmissions, arrears] = await Promise.all([
    getDashboardStats(),
    getPendingAdmissionsForDashboard(),
    getArrearsStudents(),
  ]);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/10 to-warm-yellow/10 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-warm-yellow/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-warm-green shadow-md">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Dashboard Operasional
              </h2>
              <p className="text-sm text-muted-foreground">
                Ringkasan data akademik dan administrasi sekolah secara
                real-time.
              </p>
            </div>
          </div>
        </div>
        {!stats.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Database belum terhubung. Halaman tetap tampil sebagai template
            sistem.
          </p>
        )}
      </div>

      {/* Primary Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Siswa Aktif */}
        <Link href="/siswa" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-warm-blue/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Siswa Aktif
              </CardTitle>
              <div className="rounded-xl bg-warm-blue/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-5 w-5 text-warm-blue" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold">{stats.activeStudents}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                dari {stats.totalStudents} total siswa
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Siswa Tidak Masuk Hari Ini */}
        <Link href="/presensi" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tidak Masuk Hari Ini
              </CardTitle>
              <div className="rounded-xl bg-destructive/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-destructive">
                {stats.absentToday}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.attendanceToday} presensi tercatat hari ini
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* SPP Terkumpul Bulan Ini */}
        <Link href="/keuangan" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-warm-green/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SPP Masuk Bulan Ini
              </CardTitle>
              <div className="rounded-xl bg-warm-green/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <Wallet className="h-5 w-5 text-warm-green" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.monthlyPaidInvoices} invoice lunas
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Tagihan Menunggak */}
        <Link href="/keuangan" className="group">
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-warm-orange/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tagihan Menunggak
              </CardTitle>
              <div className="rounded-xl bg-warm-orange/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                <ClipboardList className="h-5 w-5 text-warm-orange" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-warm-orange">
                {stats.unpaidInvoices}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                invoice belum lunas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/ppdb" className="group">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PPDB Menunggu
              </CardTitle>
              <div className="rounded-lg bg-warm-purple/10 p-2">
                <FileCheck className="h-4 w-4 text-warm-purple" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.pendingAdmissions}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/guru" className="group">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Guru & Staf
              </CardTitle>
              <div className="rounded-lg bg-warm-blue/10 p-2">
                <GraduationCap className="h-4 w-4 text-warm-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.totalTeachers}</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kelas
            </CardTitle>
            <div className="rounded-lg bg-warm-green/10 p-2">
              <Building2 className="h-4 w-4 text-warm-green" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalClasses}</p>
          </CardContent>
        </Card>

        <Link href="/laporan" className="group">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Laporan Harian
              </CardTitle>
              <div className="rounded-lg bg-warm-pink/10 p-2">
                <BookOpen className="h-4 w-4 text-warm-pink" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.reports}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Bottom Section: Pending PPDB + Arrears */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending PPDB */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-warm-purple/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-warm-purple" />
                  Verifikasi PPDB
                </CardTitle>
                <CardDescription>
                  Pendaftar baru yang menunggu validasi admin.
                </CardDescription>
              </div>
              <Link
                href="/ppdb"
                className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:bg-secondary/80 hover:gap-2"
              >
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingAdmissions.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <CalendarCheck className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Tidak ada pendaftaran yang menunggu verifikasi.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Anak</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAdmissions.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.childName}
                        {row.nickName && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({row.nickName})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{row.whatsapp}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(row.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          PENDING
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Arrears / Tunggakan */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-warm-orange/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-warm-orange" />
                  Daftar Tunggakan
                </CardTitle>
                <CardDescription>
                  Siswa dengan tagihan belum lunas.
                </CardDescription>
              </div>
              <Link
                href="/keuangan"
                className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:bg-secondary/80 hover:gap-2"
              >
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {arrears.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <Wallet className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Semua tagihan sudah lunas. Bravo! 🎉
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrears.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.studentName}
                        {row.nickName && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({row.nickName})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            row.category === "SPP"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }
                        >
                          {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-destructive">
                        {formatCurrency(row.remaining)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(row.dueDate).toLocaleDateString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
