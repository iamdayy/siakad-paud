"use client";

import { Assessment } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type RaportViewerProps = {
  assessment: Assessment;
  studentName: string;
};

const indicatorLabels = {
  BB: "Belum Berkembang (BB)",
  MB: "Mulai Berkembang (MB)",
  BSH: "Berkembang Sesuai Harapan (BSH)",
  BSB: "Berkembang Sangat Baik (BSB)",
};

export function RaportViewer({ assessment, studentName }: RaportViewerProps) {
  const aspekList = [
    { label: "Nilai Agama & Moral", indicator: assessment.agamaMoral, narasi: assessment.narasiAgamaMoral },
    { label: "Fisik-Motorik", indicator: assessment.fisikMotorik, narasi: assessment.narasiFisikMotorik },
    { label: "Kognitif", indicator: assessment.kognitif, narasi: assessment.narasiKognitif },
    { label: "Bahasa", indicator: assessment.bahasa, narasi: assessment.narasiBahasa },
    { label: "Sosial-Emosional", indicator: assessment.sosialEmosional, narasi: assessment.narasiSosialEmosional },
    { label: "Seni", indicator: assessment.seni, narasi: assessment.narasiSeni },
  ];

  return (
    <div className="space-y-6 text-sm text-foreground">
      <div className="rounded-md border p-4 bg-muted/20 text-center">
        <h3 className="text-xl font-bold uppercase tracking-wider text-primary">Laporan Perkembangan Anak</h3>
        <p className="font-semibold text-lg">{studentName}</p>
        <p className="text-muted-foreground">{assessment.periodLabel}</p>
      </div>

      <div className="space-y-4">
        {aspekList.map((aspek, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-2 mb-2">
              <h4 className="font-bold">{i + 1}. {aspek.label}</h4>
              <Badge variant={aspek.indicator === "BSB" ? "default" : "secondary"}>
                {indicatorLabels[aspek.indicator as keyof typeof indicatorLabels] || aspek.indicator}
              </Badge>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {aspek.narasi || <i>Guru belum memberikan catatan deskriptif.</i>}
            </p>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-4 pb-2 text-xs text-muted-foreground">
        Dicetak secara digital oleh Sistem Informasi Akademik Terpadu PAUD
      </div>
    </div>
  );
}
