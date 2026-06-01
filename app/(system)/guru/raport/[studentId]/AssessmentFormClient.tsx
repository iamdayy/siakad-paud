"use client";

import { createAssessment } from "@/app/(system)/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const INDICATORS = [
  { value: "BB", label: "Belum Berkembang (BB)" },
  { value: "MB", label: "Mulai Berkembang (MB)" },
  { value: "BSH", label: "Berkembang Sesuai Harapan (BSH)" },
  { value: "BSB", label: "Berkembang Sangat Baik (BSB)" },
];

type AssessmentFormClientProps = {
  studentId: string;
  periodLabel: string;
  existingData?: any;
};

export function AssessmentFormClient({ studentId, periodLabel, existingData }: AssessmentFormClientProps) {
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>, isPublished: boolean) {
    e.preventDefault();
    if (!formRef.current) return;
    
    if (isPublished) {
      setLoadingPublish(true);
    } else {
      setLoadingDraft(true);
    }

    const formData = new FormData(formRef.current);
    formData.append("studentId", studentId);
    formData.append("periodLabel", periodLabel);
    formData.append("isPublished", String(isPublished));

    const result = await createAssessment(formData);

    if (result && result.error) {
      toast.error(result.error);
    } else {
      toast.success(result?.message || "Raport berhasil disimpan.");
      router.push("/guru/raport?period=" + encodeURIComponent(periodLabel));
    }

    setLoadingDraft(false);
    setLoadingPublish(false);
  }

  return (
    <div className="space-y-6">
      {existingData?.isPublished && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-6">
          <p className="text-sm text-green-800 font-medium">Raport ini telah dipublikasikan dan dapat dilihat oleh orang tua. Anda masih dapat mengubah nilainya dan mempublikasikan ulang.</p>
        </div>
      )}
      
      {/* 
        We use two submit buttons triggering the same form but with different action modes.
        To do this efficiently in React, we handle onSubmit on the form and pass a specific flag based on which button was clicked.
        Since native HTML doesn't pass the clicked button value in formData automatically without extra wiring,
        we'll use a hidden input or manage submit via a state or custom handler.
        Alternatively, simpler: We intercept onSubmit by assigning an onClick to buttons that sets a ref or state.
      */}
      <form 
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-6"
      >
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
              rows={4}
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
              rows={4}
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
              rows={4}
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
              rows={4}
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
              rows={4}
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
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        {/* Narrative General */}
        <div className="space-y-2 rounded-lg border p-4 bg-muted/20">
          <Label className="font-bold">Kesimpulan & Catatan Guru (Opsional)</Label>
          <Textarea
            name="narrative"
            placeholder="Ringkasan atau kesimpulan secara umum..."
            defaultValue={existingData?.narrative || ""}
            rows={3}
            className="mt-2"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => handleSubmit(e, false)} 
            disabled={loadingDraft || loadingPublish} 
            className="gap-2"
          >
            <Save className="h-4 w-4" /> 
            {loadingDraft ? "Menyimpan..." : "Simpan Draft"}
          </Button>
          <Button 
            type="button" 
            onClick={(e) => handleSubmit(e, true)} 
            disabled={loadingDraft || loadingPublish} 
            className="gap-2"
          >
            <Send className="h-4 w-4" /> 
            {loadingPublish ? "Mempublikasi..." : "Publikasikan Raport"}
          </Button>
        </div>
      </form>
    </div>
  );
}
