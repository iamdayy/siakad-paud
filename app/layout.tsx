import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PAUD Ceria Bintang — Tempat Terbaik Tumbuh, Bermain & Belajar",
    template: "%s | PAUD Ceria Bintang",
  },
  description:
    "PAUD Ceria Bintang menyediakan pendidikan anak usia dini berkualitas dengan kurikulum merdeka belajar, guru bersertifikasi, dan fasilitas ramah anak. Daycare, KB, TK A & TK B.",
  keywords: [
    "PAUD",
    "TK",
    "pendidikan anak usia dini",
    "preschool",
    "kindergarten",
    "PPDB",
    "sekolah anak",
  ],
  openGraph: {
    title: "PAUD Ceria Bintang — Tempat Terbaik Tumbuh, Bermain & Belajar",
    description:
      "Pendidikan anak usia dini berkualitas dengan kurikulum merdeka belajar, guru bersertifikasi, dan fasilitas ramah anak.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full antialiased ${jakarta.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <ThemeProvider defaultTheme="system">
          <NextTopLoader color="#F59E0B" showSpinner={false} />
          {children}
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
