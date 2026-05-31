"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#programs", label: "Program" },
  { href: "/#keunggulan", label: "Keunggulan" },
  { href: "/#guru", label: "Guru Kami" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#testimoni", label: "Testimoni" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "glass border-b shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
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

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Masuk
          </Link>
          <Link
            href="/ppdb-public"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Daftar Sekarang
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center rounded-xl border bg-card md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-6 py-4 md:hidden animate-fade-in-up">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <Link
              href="/login"
              className="rounded-xl px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
            >
              Masuk
            </Link>
            <Link
              href="/ppdb"
              className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
