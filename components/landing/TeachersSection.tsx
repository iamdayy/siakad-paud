const teachers = [
  {
    name: "Ibu Siti Nurhaliza, S.Pd.",
    role: "Kepala Sekolah",
    initials: "SN",
    color: "bg-primary text-primary-foreground",
    description:
      "Berpengalaman 15 tahun di dunia PAUD dengan visi menciptakan generasi cerdas dan berkarakter.",
  },
  {
    name: "Ibu Ratna Dewi, S.Pd.",
    role: "Guru TK B",
    initials: "RD",
    color: "bg-warm-pink text-white",
    description:
      "Spesialis persiapan masuk SD yang dikenal sabar, kreatif, dan penuh perhatian terhadap setiap anak.",
  },
  {
    name: "Ibu Aisyah Putri, S.Pd.",
    role: "Guru TK A",
    initials: "AP",
    color: "bg-warm-blue text-white",
    description:
      "Ahli dalam pendekatan bermain sambil belajar dengan kemampuan storytelling yang memukau anak-anak.",
  },
  {
    name: "Ibu Maya Kartini",
    role: "Guru Kelompok Bermain",
    initials: "MK",
    color: "bg-warm-yellow text-white",
    description:
      "Guru penuh kasih sayang yang pandai menangani anak-anak usia dini dengan pendekatan yang lembut.",
  },
];

export function TeachersSection() {
  return (
    <section id="guru" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Tim Pengajar
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Guru Kami yang Berdedikasi
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Didampingi oleh guru-guru profesional yang mencintai dunia anak dan
            berpengalaman di bidang pendidikan usia dini.
          </p>
        </div>

        {/* Teacher cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher) => (
            <article
              key={teacher.name}
              className="group flex flex-col items-center rounded-[1.75rem] border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Avatar */}
              <div
                className={`flex size-20 items-center justify-center rounded-full ${teacher.color} text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                {teacher.initials}
              </div>
              <h3 className="mt-5 text-base font-bold text-foreground">
                {teacher.name}
              </h3>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {teacher.role}
              </span>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {teacher.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
