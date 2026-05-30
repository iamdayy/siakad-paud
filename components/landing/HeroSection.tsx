import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/8 animate-blob" />
        <div className="absolute top-20 -right-24 h-[400px] w-[400px] rounded-full bg-warm-yellow/15 animate-blob delay-200" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-warm-pink/10 animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16">
        {/* Text Content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <span className="animate-bounce-gentle inline-block">✨</span>
            Pendaftaran Tahun Ajaran 2026/2027 Dibuka!
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-balance md:text-5xl lg:text-6xl">
            Tempat Terbaik untuk{" "}
            <span className="bg-gradient-to-r from-primary via-warm-green to-primary bg-clip-text text-transparent animate-gradient">
              Tumbuh, Bermain,
            </span>{" "}
            dan Belajar
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            PAUD Ceria Bintang hadir dengan lingkungan yang aman, kurikulum
            merdeka belajar, dan guru-guru berdedikasi untuk mendampingi tumbuh
            kembang buah hati Anda.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/ppdb"
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Daftar Sekarang
              <svg
                className="size-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <a
              href="#programs"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              Lihat Program
            </a>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up delay-400 mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["bg-warm-pink", "bg-warm-yellow", "bg-warm-blue", "bg-warm-green"].map(
                  (bg, i) => (
                    <div
                      key={i}
                      className={`flex size-8 items-center justify-center rounded-full ${bg} border-2 border-card text-xs font-bold text-white`}
                    >
                      {["👧", "👦", "👧", "👦"][i]}
                    </div>
                  )
                )}
              </div>
              <span className="font-medium">500+ siswa terdaftar</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="size-4 fill-warm-yellow text-warm-yellow"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 font-medium">4.9/5 rating orang tua</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative flex-1 animate-fade-in-up delay-300">
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            {/* Decorative ring */}
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-warm-yellow/10 to-warm-pink/10 blur-sm" />
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-white/60 shadow-2xl">
              <Image
                src="/hero-illustration.png"
                alt="Anak-anak bermain bahagia di PAUD Ceria Bintang"
                width={600}
                height={500}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            {/* Floating badges */}
            <div className="absolute -left-4 top-8 animate-float rounded-2xl border bg-card px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold text-muted-foreground">Kurikulum</p>
              <p className="text-sm font-bold text-primary">Merdeka Belajar</p>
            </div>
            <div className="absolute -right-4 bottom-12 animate-float-delayed rounded-2xl border bg-card px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold text-muted-foreground">Rasio Guru</p>
              <p className="text-sm font-bold text-primary">1 : 10 Anak</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
