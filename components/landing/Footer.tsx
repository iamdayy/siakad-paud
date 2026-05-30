import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const programLinks = [
  { label: "Daycare", href: "#programs" },
  { label: "Kelompok Bermain", href: "#programs" },
  { label: "TK A", href: "#programs" },
  { label: "TK B", href: "#programs" },
];

const infoLinks = [
  { label: "Pendaftaran (PPDB)", href: "#ppdb" },
  { label: "Keunggulan Kami", href: "#keunggulan" },
  { label: "Galeri Kegiatan", href: "#galeri" },
  { label: "Testimoni", href: "#testimoni" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground">
                🌟
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-foreground">
                  PAUD Ceria Bintang
                </p>
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                  Tumbuh · Bermain · Belajar
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Membangun generasi cerdas, kreatif, dan berkarakter melalui
              pendidikan anak usia dini yang berkualitas.
            </p>
            {/* Social icons placeholder */}
            <div className="mt-6 flex gap-3">
              {["📘", "📸", "▶️"].map((icon, i) => (
                <div
                  key={i}
                  className="flex size-10 items-center justify-center rounded-full border bg-secondary text-sm transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Program */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Program
            </h3>
            <ul className="mt-4 space-y-3">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Informasi
            </h3>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Kontak
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Jl. Pendidikan No. 123, Kelurahan Ceria, Kecamatan Bintang, Kota Harapan
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>info@paudceriabintang.sch.id</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Senin – Jumat
                  <br />
                  07.00 – 15.00 WIB
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-muted-foreground">
          <p>© 2026 PAUD Ceria Bintang. Hak cipta dilindungi.</p>
          <p>
            Dikelola dengan{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              SIAKAD PAUD
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
