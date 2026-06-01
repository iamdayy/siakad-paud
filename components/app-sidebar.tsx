"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LogOut, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  BarChart3,
  BookOpen,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ppdb", label: "PPDB", icon: FileText },
];

const dataSubMenus = [
  { href: "/siswa", label: "Data Siswa", icon: Users },
  { href: "/orangtua", label: "Data Orang Tua", icon: Users },
  { href: "/guru", label: "Guru & Staf", icon: GraduationCap },
  { href: "/kelas", label: "Data Kelas", icon: BookOpen },
  { href: "/presensi", label: "Presensi", icon: CalendarCheck },
  { href: "/laporan/daily-report", label: "Laporan Harian", icon: BookOpen },
  { href: "/laporan/raport", label: "E-Raport", icon: BarChart3 },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
];

const systemSubMenus = [
  { href: "/laporan/lesson-plan", label: "Logbook Guru", icon: BookOpen },
  { href: "/pengumuman", label: "Pengumuman", icon: GraduationCap },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Sparkles },
]

const guruSubMenus = [
  { href: "/guru/kelas", label: "Kelas Saya", icon: Users },
  { href: "/guru/presensi", label: "Presensi Guru", icon: CalendarCheck },
  { href: "/guru/raport", label: "E-Raport", icon: BookOpen },
  { href: "/guru/lesson-plan", label: "Logbook (RPPH)", icon: FileText },
];

type AppSidebarProps = {
  user: { displayName: string; role: string } | null;
  visiblePaths: string[];
  visibleGuruPaths: string[];
  logoutAction: () => void;
};

export function AppSidebar({
  user,
  visiblePaths,
  visibleGuruPaths,
  logoutAction,
}: AppSidebarProps) {
  const pathname = usePathname();

  const mainMenus = menuItems.filter((m) => visiblePaths.includes(m.href));
  const dataMenus = dataSubMenus.filter((m) => visiblePaths.includes(m.href));
  const systemMenus = systemSubMenus.filter((m) => visiblePaths.includes(m.href));
  const guruMenus = guruSubMenus.filter((m) => visibleGuruPaths.includes(m.href));

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-warm-green shadow-md">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              SIAKAD PAUD
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Ceria Bintang
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenus.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {dataMenus.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Data</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dataMenus.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {systemMenus.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Sistem</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemMenus.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {guruMenus.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Panel Guru</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {guruMenus.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <ThemeToggle />
          {user && (
            <div className="flex flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="flex-1 truncate">
                <p className="truncate text-xs font-semibold text-sidebar-foreground">
                  {user.displayName}
                </p>
                <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user.role}
                </p>
              </div>
              <div className="flex gap-1">
                <ChangePasswordDialog />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Keluar"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
