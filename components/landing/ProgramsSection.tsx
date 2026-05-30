const programs = [
  {
    name: "Daycare",
    age: "1 – 2 Tahun",
    emoji: "🍼",
    color: "from-warm-pink/20 to-warm-pink/5",
    borderColor: "border-warm-pink/30",
    description:
      "Penitipan anak dengan stimulasi sensorik dan motorik dasar dalam lingkungan yang hangat, aman, dan penuh kasih sayang.",
  },
  {
    name: "Kelompok Bermain",
    age: "3 – 4 Tahun",
    emoji: "🧸",
    color: "from-warm-yellow/20 to-warm-yellow/5",
    borderColor: "border-warm-yellow/30",
    description:
      "Belajar melalui bermain untuk mengembangkan kemampuan sosial-emosional, bahasa, dan kreativitas anak secara alami.",
  },
  {
    name: "TK A",
    age: "4 – 5 Tahun",
    emoji: "🎨",
    color: "from-warm-green/20 to-warm-green/5",
    borderColor: "border-warm-green/30",
    description:
      "Pengenalan huruf, angka, dan dunia sekitar melalui kegiatan kreatif yang membangun rasa ingin tahu dan kemandirian.",
  },
  {
    name: "TK B",
    age: "5 – 6 Tahun",
    emoji: "📚",
    color: "from-warm-blue/20 to-warm-blue/5",
    borderColor: "border-warm-blue/30",
    description:
      "Persiapan masuk SD dengan penguatan literasi, numerasi, dan pembentukan karakter yang kuat dan percaya diri.",
  },
];

export function ProgramsSection() {
  return (
    <section id="programs" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Program Belajar
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Kurikulum Sesuai Tahap Perkembangan Anak
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Setiap program dirancang khusus untuk memenuhi kebutuhan tumbuh
            kembang anak pada setiap rentang usia.
          </p>
        </div>

        {/* Program cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program, i) => (
            <article
              key={program.name}
              className={`group relative overflow-hidden rounded-[1.75rem] border ${program.borderColor} bg-gradient-to-b ${program.color} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Emoji icon */}
              <div className="flex size-14 items-center justify-center rounded-2xl bg-card text-2xl shadow-sm">
                {program.emoji}
              </div>

              {/* Content */}
              <div className="mt-5">
                <h3 className="text-lg font-bold text-foreground">
                  {program.name}
                </h3>
                <span className="mt-1 inline-block rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary">
                  {program.age}
                </span>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {program.description}
                </p>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
