import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SIAKAD PAUD",
    template: "%s | SIAKAD PAUD",
  },
  description: "Sistem Informasi Akademik untuk PAUD dan TK berbasis Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
