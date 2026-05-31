import { getPpdbConfig } from "@/lib/ppdb-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, CheckCircle2, FileText, Info } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Penerimaan Peserta Didik Baru (PPDB)",
  description: "Informasi Pendaftaran Peserta Didik Baru PAUD Ceria Bintang",
};

export default async function PpdbPublicLandingPage({
  searchParams,
}: {
  searchParams: { closed?: string };
}) {
  const config = await getPpdbConfig();
  const showClosedAlert = searchParams.closed === "1";

  // Format dates
  const startDateStr = new Date(config.startDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateStr = new Date(config.endDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24 w-full flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6 relative z-10 w-full">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Tahun Ajaran {config.year}
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
                Penerimaan Peserta Didik Baru (PPDB)
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Mari bergabung bersama keluarga besar PAUD Ceria Bintang.
                Kami menyediakan lingkungan belajar yang aman, nyaman, dan menyenangkan untuk tumbuh kembang optimal ananda.
              </p>

              {/* Status Alert if redirected from closed form */}
              {showClosedAlert && (
                <div className="mx-auto max-w-md mt-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3 text-left">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>
                    <strong>Mohon Maaf!</strong> Anda dialihkan ke halaman ini karena formulir pendaftaran saat ini sedang ditutup.
                  </p>
                </div>
              )}

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {config.isOpen ? (
                  <Button size="lg" className="rounded-full px-8 text-lg h-14 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all" asChild>
                    <Link href="/ppdb-public/form">
                      Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" variant="secondary" className="rounded-full px-8 text-lg h-14 pointer-events-none opacity-80" disabled>
                    Pendaftaran Ditutup
                  </Button>
                )}

                <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14" asChild>
                  <a href="#informasi">Pelajari Lebih Lanjut</a>
                </Button>
              </div>

              {/* Status Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium">
                <span className="relative flex h-3 w-3">
                  {config.isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${config.isOpen ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                </span>
                {config.isOpen ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Pendaftaran Dibuka hingga {endDateStr}</span>
                ) : (
                  <span className="text-destructive">Pendaftaran Belum Dibuka / Telah Berakhir</span>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-3xl rounded-full opacity-50"></div>
          <div className="absolute top-1/4 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-accent/20 blur-3xl rounded-full opacity-50"></div>
        </section>

        {/* Info Grid Section */}
        <section id="informasi" className="container px-4 md:px-6 py-12 md:py-20">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-16 items-start">
            {/* Timeline & Alur */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Jadwal & Alur Pendaftaran</h2>
                <p className="text-muted-foreground text-lg">
                  Perhatikan jadwal dan tahapan pendaftaran agar proses penerimaan berjalan lancar.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-full h-fit">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">1. Pendaftaran Online</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {startDateStr} — {endDateStr}
                      </p>
                      <p className="text-sm mt-2">
                        Mengisi formulir data anak & orang tua, serta mengunggah dokumen persyaratan (KK, KTP, Akta).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4">
                    <div className="bg-accent/10 p-3 rounded-full h-fit">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">2. Validasi & Seleksi</h3>
                      <p className="text-sm text-muted-foreground mt-1">1 - 3 Hari Kerja</p>
                      <p className="text-sm mt-2">
                        Tim admin kami akan memvalidasi data dan kelengkapan dokumen. Anda akan menerima notifikasi via WhatsApp.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-full h-fit">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">3. Daftar Ulang & Pembayaran</h3>
                      <p className="text-sm text-muted-foreground mt-1">Setelah Dinyatakan Diterima</p>
                      <p className="text-sm mt-2">
                        Melakukan pembayaran biaya masuk (Uang Pangkal, Seragam, dll) melalui Parent Portal untuk mendapatkan NIS resmi.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-8 rounded-2xl bg-muted/50 p-6 sm:p-10 border">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Persyaratan Dokumen</h2>
                <p className="text-muted-foreground">
                  Siapkan *scan* atau foto dokumen asli berikut untuk diunggah pada tahap pendaftaran:
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-foreground">Akta Kelahiran Anak</strong>
                    <span className="text-sm text-muted-foreground">Format JPG/PNG/PDF maks 5MB</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-foreground">Kartu Keluarga (KK)</strong>
                    <span className="text-sm text-muted-foreground">Format JPG/PNG/PDF maks 5MB</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-foreground">KTP Orang Tua / Wali</strong>
                    <span className="text-sm text-muted-foreground">Ayah atau Ibu, Format JPG/PNG/PDF maks 5MB</span>
                  </div>
                </li>
              </ul>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold mb-3">Ketentuan Usia (Per Juli {config.year.split("/")[0]})</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong className="text-foreground">Daycare:</strong> 1 - 3 Tahun</li>
                  <li><strong className="text-foreground">Kelompok Bermain (KB):</strong> 3 - 4 Tahun</li>
                  <li><strong className="text-foreground">TK A:</strong> 4 - 5 Tahun</li>
                  <li><strong className="text-foreground">TK B:</strong> 5 - 6 Tahun</li>
                </ul>
              </div>

              {/* Info Kuota */}
              <div className="rounded-lg bg-background p-4 border flex items-center justify-between shadow-sm">
                <span className="font-medium text-sm">Kuota Tersedia:</span>
                <span className="text-lg font-bold text-primary">{config.quota} Siswa</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
