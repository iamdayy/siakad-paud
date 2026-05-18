import { ArrowRight, CheckCircle2, Database, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Home() {
  const foundations = [
    {
      title: "Next.js App Router",
      description: "Fondasi server-first untuk dashboard admin, form PPDB, dan route handler yang aman.",
      icon: LayoutDashboard,
    },
    {
      title: "Prisma & PostgreSQL",
      description: "Koneksi data inti sudah disiapkan agar schema modul siswa, kelas, dan keuangan dapat dibangun bertahap.",
      icon: Database,
    },
    {
      title: "Tailwind & shadcn/ui-ready",
      description: "Token tema, utilitas cn, dan konfigurasi komponen siap dipakai untuk antarmuka yang rapi dan nyaman di mata.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#e7f8ee,transparent_55%)]">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[2rem] border bg-card/90 p-8 shadow-sm backdrop-blur md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            Bootstrap proyek sudah siap untuk pengembangan modular
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              SIAKAD PAUD siap menjadi fondasi pengelolaan siswa, guru, dan keuangan sekolah.
            </h1>
            <p className="text-base leading-7 text-muted-foreground md:text-lg">
              Starter ini menyiapkan App Router, TypeScript, Tailwind CSS, utilitas shadcn/ui,
              dan koneksi Prisma agar task berikutnya bisa langsung difokuskan ke modul bisnis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border bg-background px-4 py-2">PPDB & validasi dokumen</span>
            <span className="rounded-full border bg-background px-4 py-2">Presensi siswa & notifikasi</span>
            <span className="rounded-full border bg-background px-4 py-2">SPP otomatis & tunggakan</span>
            <span className="rounded-full border bg-background px-4 py-2">Daily report & e-raport</span>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {foundations.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[1.75rem] border bg-card p-6 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 rounded-[2rem] border bg-card p-8 shadow-sm lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Langkah berikutnya</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Lanjutkan dengan task domain: schema Prisma, dashboard admin, atau form PPDB.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Struktur dasar proyek, helper Prisma, utilitas className, dan variabel tema sudah
              tersedia untuk mempercepat pengerjaan fitur berikutnya.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-secondary p-5 text-secondary-foreground">
            <p className="text-sm font-medium">Bootstrap saat ini mencakup:</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 text-primary" />
                Next.js 16 App Router + TypeScript strict mode
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 text-primary" />
                Tailwind CSS v4 dengan token warna dasar
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 text-primary" />
                Prisma starter untuk PostgreSQL
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 text-primary" />
                Setup utilitas shadcn/ui-ready
              </li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
