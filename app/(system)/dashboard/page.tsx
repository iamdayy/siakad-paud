import { requirePageAccess } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

const cards = [
  { key: "students", label: "Total Siswa", href: "/siswa" },
  { key: "admissions", label: "PPDB Menunggu", href: "/ppdb" },
  { key: "attendanceToday", label: "Presensi Hari Ini", href: "/presensi" },
  { key: "unpaidInvoices", label: "Tagihan Aktif", href: "/keuangan" },
  { key: "invoices", label: "Total Invoice", href: "/keuangan" },
  { key: "reports", label: "Laporan Harian", href: "/laporan" },
] as const;

export default async function DashboardPage() {
  await requirePageAccess("/dashboard", [
    "ADMIN",
    "TU",
    "GURU",
    "KEPALA_SEKOLAH",
    "ORANG_TUA",
  ]);

  const stats = await getDashboardStats();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Dashboard Operasional</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ringkasan data lintas modul untuk memantau kondisi akademik dan
          administrasi sekolah.
        </p>
        {!stats.dbReady && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-100/60 px-4 py-3 text-sm text-amber-900">
            Database belum terhubung. Halaman tetap tampil sebagai template
            sistem, lalu akan otomatis aktif saat koneksi DATABASE_URL tersedia.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stats[card.key]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
