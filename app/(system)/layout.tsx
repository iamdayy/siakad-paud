import Link from "next/link";

const menus = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ppdb", label: "PPDB" },
  { href: "/siswa", label: "Siswa" },
  { href: "/presensi", label: "Presensi" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/laporan", label: "Laporan" },
];

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">SIAKAD PAUD</p>
            <h1 className="text-lg font-semibold">Sistem Akademik Terpadu</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                {menu.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}

