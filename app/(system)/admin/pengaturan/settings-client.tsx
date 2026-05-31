"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updatePpdbSettings } from "@/app/actions/settings";
import { PpdbConfig } from "@/lib/ppdb-config";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export function SettingsClient({ initialConfig }: { initialConfig: PpdbConfig }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    // Switch element usually doesn't send value if unchecked. We will set it manually based on state if needed, or get from form.
    // To ensure the switch value is captured correctly, we rely on the hidden input or state. Let's use the native FormData from the form.
    const res = await updatePpdbSettings(formData);

    if (res.success) {
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan. Perubahan sudah langsung aktif di halaman PPDB Publik." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menyimpan." });
    }
    setLoading(false);
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Penerimaan Peserta Didik Baru (PPDB)</CardTitle>
        <CardDescription>
          Atur status pendaftaran, periode jadwal, dan kuota yang akan langsung tampil di halaman publik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-md border text-sm flex gap-2 items-start ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <p>{message.text}</p>
            </div>
          )}

          <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Status Pendaftaran</Label>
              <p className="text-sm text-muted-foreground">
                Buka atau tutup akses publik ke formulir pendaftaran PPDB.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="isOpen" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Buka PPDB</Label>
              <Switch id="isOpen" name="isOpen" value="true" defaultChecked={initialConfig.isOpen} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Tahun Ajaran</Label>
              <Input id="year" name="year" defaultValue={initialConfig.year} placeholder="Contoh: 2026/2027" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quota">Kuota Penerimaan Siswa</Label>
              <Input id="quota" name="quota" type="number" defaultValue={initialConfig.quota} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai Pendaftaran</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={initialConfig.startDate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir Pendaftaran</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={initialConfig.endDate} required />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
