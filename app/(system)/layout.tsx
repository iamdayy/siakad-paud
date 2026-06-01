import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { canAccessPath } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
const ALL_MAIN_PATHS = [
  "/dashboard",
  "/ppdb",
  "/siswa",
  "/orangtua",
  "/guru",
  "/kelas",
  "/presensi",
  "/keuangan",
  "/laporan",
  "/laporan/lesson-plan",
  "/pengumuman",
  "/admin/pengaturan",
];

const ALL_GURU_PATHS = ["/guru/kelas", "/guru/presensi", "/guru/raport", "/guru/lesson-plan"];

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const visiblePaths = currentUser
    ? ALL_MAIN_PATHS.filter((path) => canAccessPath(currentUser.role, path))
    : [];

  const visibleGuruPaths =
    currentUser?.role === "GURU" || currentUser?.role === "ADMIN" || currentUser?.role === "KEPALA_SEKOLAH"
      ? ALL_GURU_PATHS
      : [];

  return (
    <SidebarProvider>
      <AppSidebar
        user={currentUser}
        visiblePaths={visiblePaths}
        visibleGuruPaths={visibleGuruPaths}
        logoutAction={logoutAction}
      />

      <SidebarInset>
        {/* Top bar for mobile trigger */}
        <header className="flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-lg md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-bold tracking-tight">SIAKAD PAUD</span>
        </header>

        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
