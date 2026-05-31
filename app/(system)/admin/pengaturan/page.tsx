import { getPpdbConfig } from "@/lib/ppdb-config";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Pengaturan Sistem | Admin PAUD Ceria Bintang",
};

export default async function AdminSettingsPage() {
  const config = await getPpdbConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">
          Kelola konfigurasi inti aplikasi, seperti jadwal pendaftaran dan fitur lainnya.
        </p>
      </div>

      <div className="grid gap-6">
        <SettingsClient initialConfig={config} />
        {/* Di masa depan, pengaturan Modul Keuangan atau lainnya bisa ditambahkan di bawah ini */}
      </div>
    </div>
  );
}
