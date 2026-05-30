import { FileText, Phone } from "lucide-react";
import Link from "next/link";

export function PPDBSection() {
  return (
    <section
      id="ppdb"
      className="relative overflow-hidden py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-warm-green p-10 md:p-16">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/10 animate-float" />
            <div className="absolute -bottom-8 -left-8 size-36 rounded-full bg-white/8 animate-float-delayed" />
            <div className="absolute top-1/2 right-1/4 size-20 rounded-full bg-white/5 animate-pulse-soft" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/90">
                📋 Tahun Ajaran 2026/2027
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                Pendaftaran Siswa Baru Telah Dibuka!
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                Segera daftarkan putra-putri Anda untuk bergabung bersama PAUD
                Ceria Bintang. Kuota terbatas untuk menjaga kualitas
                pembelajaran.
              </p>

              {/* Requirements */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Fotokopi Akta Kelahiran",
                  "Fotokopi Kartu Keluarga (KK)",
                  "Fotokopi KTP Orang Tua",
                  "Pas Foto Anak 3×4 (4 lembar)",
                ].map((req) => (
                  <div
                    key={req}
                    className="flex items-center gap-2 text-sm text-white/90"
                  >
                    <FileText className="size-4 shrink-0 text-white/60" />
                    {req}
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/ppdb"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Daftar Online Sekarang
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
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  <Phone className="size-4" />
                  Tanya via WhatsApp
                </a>
              </div>
            </div>

            {/* Side info */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/70">
                  Biaya Pendaftaran
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  Rp 150.000
                </p>
                <p className="mt-1 text-xs text-white/60">
                  * Tidak termasuk uang pangkal dan seragam
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/70">
                  Kuota Tersedia
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  45 Siswa
                </p>
                <p className="mt-1 text-xs text-white/60">
                  * Dari total 60 kuota tahun ini
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/70">
                  Batas Pendaftaran
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  30 Juni 2026
                </p>
                <p className="mt-1 text-xs text-white/60">
                  * Pendaftaran ditutup setelah kuota penuh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
