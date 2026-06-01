import { Suspense } from "react";
import { requirePageAccess, getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "./admin-dashboard";
import { GuruDashboard } from "./guru-dashboard";


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
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <GuruDashboard user={user} />
      </Suspense>
    );
  }

  // Admin, TU, and Kepala Sekolah see the Admin Dashboard
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 w-full animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 w-full animate-pulse rounded-xl bg-muted/60" />
        <div className="h-80 w-full animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
