import { loginAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const next =
    typeof searchParams?.next === "string" ? searchParams.next : "/dashboard";
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e8f5e9,transparent_45%),linear-gradient(180deg,#f7faf7_0%,#ffffff_100%)] px-6 py-12">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            SIAKAD PAUD
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Masuk ke sistem sesuai peran Anda.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            RBAC aktif untuk membatasi akses modul admin, guru, tata usaha,
            kepala sekolah, dan orang tua.
          </p>

          <div className="mt-6 rounded-2xl border bg-secondary/40 p-4 text-sm text-secondary-foreground">
            Akun demo:
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-background px-3 py-2">
                admin / admin123
              </div>
              <div className="rounded-xl bg-background px-3 py-2">
                tu / tu123
              </div>
              <div className="rounded-xl bg-background px-3 py-2">
                guru / guru123
              </div>
              <div className="rounded-xl bg-background px-3 py-2">
                kepsek / kepsek123
              </div>
              <div className="rounded-xl bg-background px-3 py-2">
                orangtua / ortu123
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border bg-background px-4 py-2">
              Signed session cookie
            </span>
            <span className="rounded-full border bg-background px-4 py-2">
              Role-based route guard
            </span>
            <span className="rounded-full border bg-background px-4 py-2">
              Server action checks
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Login</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gunakan akun demo atau akun produksi yang sudah dibuat.
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error === "missing"
                ? "Username dan password wajib diisi."
                : "Username atau password tidak valid."}
            </p>
          )}

          <form action={loginAction} className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={next} />
            <label className="grid gap-2 text-sm">
              Username
              <input
                name="username"
                autoComplete="username"
                required
                className="rounded-xl border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-xl border bg-background px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
            >
              Masuk
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Kembali ke{" "}
            <Link href="/" className="font-medium text-primary">
              beranda
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
