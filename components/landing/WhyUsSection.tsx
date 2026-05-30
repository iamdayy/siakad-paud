import {
  Building2,
  GraduationCap,
  Heart,
  Palette,
  Smartphone,
  Users,
} from "lucide-react";

const advantages = [
  {
    icon: Building2,
    title: "Fasilitas Aman & Nyaman",
    description:
      "Ruang kelas ramah anak dilengkapi taman bermain outdoor dan indoor yang terawat dan aman.",
    color: "bg-warm-pink/10 text-warm-pink",
  },
  {
    icon: GraduationCap,
    title: "Guru Bersertifikasi",
    description:
      "Tenaga pendidik profesional, berpengalaman, dan memiliki sertifikasi pendidikan PAUD.",
    color: "bg-warm-blue/10 text-warm-blue",
  },
  {
    icon: Users,
    title: "Rasio Guru Ideal",
    description:
      "Maksimal 1 guru berbanding 10 anak untuk memastikan perhatian optimal pada setiap siswa.",
    color: "bg-warm-green/10 text-warm-green",
  },
  {
    icon: Smartphone,
    title: "Laporan Digital Harian",
    description:
      "Orang tua menerima update aktivitas, makan, dan perkembangan anak setiap hari melalui aplikasi.",
    color: "bg-warm-purple/10 text-warm-purple",
  },
  {
    icon: Palette,
    title: "Kurikulum Merdeka",
    description:
      "Pendekatan bermain sambil belajar sesuai Kurikulum Merdeka PAUD untuk perkembangan holistik.",
    color: "bg-warm-yellow/10 text-warm-yellow",
  },
  {
    icon: Heart,
    title: "Catering Sehat & Bergizi",
    description:
      "Menu harian disusun oleh ahli gizi, dengan perhatian khusus pada alergi dan kebutuhan anak.",
    color: "bg-warm-orange/10 text-warm-orange",
  },
];

export function WhyUsSection() {
  return (
    <section
      id="keunggulan"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 md:py-28"
    >
      {/* Decorative bg pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-10 left-10 size-32 rounded-full bg-warm-yellow/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 size-40 rounded-full bg-warm-pink/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Mengapa Kami
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Keunggulan PAUD Ceria Bintang
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Kami berkomitmen memberikan yang terbaik untuk tumbuh kembang putra-putri
            Anda dengan standar pendidikan yang tinggi.
          </p>
        </div>

        {/* Advantages grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item) => (
            <article
              key={item.title}
              className="group rounded-[1.75rem] border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex size-14 items-center justify-center rounded-2xl ${item.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <item.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
