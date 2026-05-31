"use client";

import { saveAssessment } from "@/app/(system)/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useState } from "react";

const INDICATORS = [
  { value: "BB", label: "Belum Berkembang (BB)" },
  { value: "MB", label: "Mulai Berkembang (MB)" },
  { value: "BSH", label: "Berkembang Sesuai Harapan (BSH)" },
  { value: "BSB", label: "Berkembang Sangat Baik (BSB)" },
];

const PERIODS = [
  { value: "Semester 1 2025/2026", label: "Semester 1 - 2025/2026" },
  { value: "Semester 2 2025/2026", label: "Semester 2 - 2025/2026" },
  { value: "Semester 1 2026/2027", label: "Semester 1 - 2026/2027" },
  { value: "Semester 2 2026/2027", label: "Semester 2 - 2026/2027" },
];

type AssessmentFormProps = {
  studentId: string;
  studentName: string;
  existingData?: any; // To preload data if we add an edit feature later
  onClose?: () => void;
};

export function RaportForm({ studentId, studentName, existingData, onClose }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false);

  // Using native select since Shadcn Select can be tricky with formData without hidden inputs.
  // We'll use a simple native select for stability in forms.
  return (
    <form
      action={async (formData) => {
        setLoading(true);
        formData.append("studentId", studentId);
        await saveAssessment(formData);
        setLoading(false);
        if (onClose) onClose();
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Periode Penilaian</Label>
          <p className="mb-2 text-sm text-muted-foreground">Pilih semester dan tahun ajaran untuk raport ini.</p>
          <select
            name="periodLabel"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={existingData?.periodLabel || PERIODS[0].value}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Agama & Moral */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">1. Nilai Agama & Moral</Label>
            <select
              name="agamaMoral"
              required
              defaultValue={existingData?.agamaMoral || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiAgamaMoral"
              placeholder="Deskripsi perkembangan agama dan moral anak..."
              defaultValue={existingData?.narasiAgamaMoral || ""}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Fisik-Motorik */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">2. Fisik-Motorik</Label>
            <select
              name="fisikMotorik"
              required
              defaultValue={existingData?.fisikMotorik || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiFisikMotorik"
              placeholder="Deskripsi perkembangan motorik kasar dan halus..."
              defaultValue={existingData?.narasiFisikMotorik || ""}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Kognitif */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">3. Kognitif</Label>
            <select
              name="kognitif"
              required
              defaultValue={existingData?.kognitif || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiKognitif"
              placeholder="Deskripsi kemampuan memecahkan masalah anak..."
              defaultValue={existingData?.narasiKognitif || ""}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Bahasa */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">4. Bahasa</Label>
            <select
              name="bahasa"
              required
              defaultValue={existingData?.bahasa || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiBahasa"
              placeholder="Deskripsi kemampuan memahami dan mengungkapkan bahasa..."
              defaultValue={existingData?.narasiBahasa || ""}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Sosial-Emosional */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">5. Sosial-Emosional</Label>
            <select
              name="sosialEmosional"
              required
              defaultValue={existingData?.sosialEmosional || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiSosialEmosional"
              placeholder="Deskripsi kemandirian dan interaksi sosial anak..."
              defaultValue={existingData?.narasiSosialEmosional || ""}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Seni */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="font-bold text-primary">6. Seni</Label>
            <select
              name="seni"
              required
              defaultValue={existingData?.seni || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>Pilih Indikator...</option>
              {INDICATORS.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
            </select>
            <Textarea
              name="narasiSeni"
              placeholder="Deskripsi eksplorasi dan ekspresi seni anak..."
              defaultValue={existingData?.narasiSeni || ""}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? "Menyimpan..." : <><Save className="h-4 w-4" /> Simpan E-Raport</>}
        </Button>
      </div>
    </form>
  );
}
