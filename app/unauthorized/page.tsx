import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
      <section className="max-w-xl rounded-[2rem] border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Akses Ditolak
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Peran Anda belum diizinkan membuka halaman ini.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Hubungi admin sekolah jika role Anda perlu ditambahkan ke modul yang
          relevan.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Kembali ke Dashboard
        </Link>
      </section>
    </main>
  );
}
