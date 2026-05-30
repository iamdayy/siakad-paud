import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { canAccessPath } from "@/lib/session";
import Link from "next/link";

const menus = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ppdb", label: "PPDB" },
  { href: "/siswa", label: "Siswa" },
  { href: "/guru", label: "Guru" },
  { href: "/presensi", label: "Presensi" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/laporan", label: "Laporan" },
];

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const visibleMenus = currentUser
    ? menus.filter((menu) => canAccessPath(currentUser.role, menu.href))
    : [];

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              SIAKAD PAUD
            </p>
            <h1 className="text-lg font-semibold">Sistem Akademik Terpadu</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              {visibleMenus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  {menu.label}
                </Link>
              ))}
            </nav>
            {currentUser && (
              <div className="flex items-center gap-3 rounded-full border bg-background px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">
                  {currentUser.displayName}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wide">
                  {currentUser.role}
                </span>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-primary"
                  >
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
