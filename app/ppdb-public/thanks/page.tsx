import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PpdbThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-16">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-semibold">Terima kasih!</h1>
        <p className="mt-4 text-muted-foreground">
          Pendaftaran Anda telah diterima. Tim administrasi akan menghubungi
          nomor WhatsApp yang Anda cantumkan untuk langkah selanjutnya.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/">
            Kembali ke Halaman Depan
          </Link>
        </Button>
      </div>
    </main>
  );
}
