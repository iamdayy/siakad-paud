import { requirePageAccess, getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "./admin-dashboard";
import { GuruDashboard } from "./guru-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requirePageAccess("/dashboard", [
    "ADMIN",
    "TU",
    "GURU",
    "KEPALA_SEKOLAH",
    "ORANG_TUA",
  ]);

  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "GURU") {
    return <GuruDashboard user={user} />;
  }

  // Admin, TU, and Kepala Sekolah see the Admin Dashboard
  return <AdminDashboard />;
}
