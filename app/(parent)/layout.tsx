import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby, LogOut } from "lucide-react";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ORANG_TUA") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/portal" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-pink to-warm-purple shadow-md transition-transform group-hover:scale-105">
              <Baby className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">PORTAL WALI MURID</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                PAUD Ceria Bintang
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-1.5 sm:flex">
              <span className="text-xs font-medium text-muted-foreground">
                {currentUser.displayName}
              </span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
