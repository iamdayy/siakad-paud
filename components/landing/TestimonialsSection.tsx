const testimonials = [
  {
    name: "Ibu Sarah Amelia",
    role: "Orang Tua Siswa TK B",
    initials: "SA",
    color: "bg-warm-pink",
    quote:
      "Anak saya jadi lebih percaya diri dan mandiri sejak bersekolah di sini. Guru-gurunya sangat perhatian dan selalu memberikan update perkembangan anak melalui laporan harian digital.",
    stars: 5,
  },
  {
    name: "Bapak Ahmad Fauzi",
    role: "Orang Tua Siswa KB",
    initials: "AF",
    color: "bg-warm-blue",
    quote:
      "Laporan harian yang dikirim setiap sore sangat membantu kami memahami apa yang dipelajari anak di sekolah. Fasilitasnya juga sangat bersih dan aman untuk anak-anak.",
    stars: 5,
  },
  {
    name: "Ibu Rina Kartika",
    role: "Orang Tua Siswa TK A",
    initials: "RK",
    color: "bg-warm-green",
    quote:
      "Guru-gurunya sangat sabar dan penuh kasih sayang. Kurikulumnya juga bagus, anak saya sudah mulai bisa membaca dan berhitung dengan cara yang menyenangkan.",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Testimoni
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Apa Kata Orang Tua Siswa
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Kepercayaan orang tua adalah bukti nyata kualitas pendidikan kami.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="group relative overflow-hidden rounded-[1.75rem] border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Quote icon */}
              <div className="mb-4 text-4xl leading-none text-primary/20">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg
                    key={i}
                    className="size-4 fill-warm-yellow text-warm-yellow"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-7 text-muted-foreground">
                {t.quote}
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t pt-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute top-0 right-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
