import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PrintButton } from "./PrintButton";

// We want this page to be dynamically rendered
export const dynamic = "force-dynamic";

const indicatorLabels = {
  BB: "Belum Berkembang",
  MB: "Mulai Berkembang",
  BSH: "Berkembang Sesuai Harapan",
  BSB: "Berkembang Sangat Baik",
};

export default async function PrintRaportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return notFound();

  const { id } = await params;

  // Find the assessment by ID
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          classroom: {
            include: {
              mainTeacher: true
            }
          }
        }
      }
    }
  });

  if (!assessment) return notFound();

  // If user is parent, they can only see published reports
  if (user.role === "ORANG_TUA" && !assessment.isPublished) {
    return notFound();
  }

  const { student } = assessment;

  const aspekList = [
    { label: "Nilai Agama & Moral", indicator: assessment.agamaMoral, narasi: assessment.narasiAgamaMoral },
    { label: "Fisik-Motorik", indicator: assessment.fisikMotorik, narasi: assessment.narasiFisikMotorik },
    { label: "Kognitif", indicator: assessment.kognitif, narasi: assessment.narasiKognitif },
    { label: "Bahasa", indicator: assessment.bahasa, narasi: assessment.narasiBahasa },
    { label: "Sosial-Emosional", indicator: assessment.sosialEmosional, narasi: assessment.narasiSosialEmosional },
    { label: "Seni", indicator: assessment.seni, narasi: assessment.narasiSeni },
  ];

  return (
    <div className="bg-white text-black min-h-screen">
      {/* 
        Container for Print:
        A4 size approx 210mm x 297mm. F4 is approx 210mm x 330mm.
        We will rely on print media queries for page breaks and margins.
      */}
      <div className="print-container mx-auto p-8 max-w-4xl font-serif">

        {/* Header / Kop Surat */}
        <div className="border-b-4 border-black pb-4 mb-6 flex items-center justify-between">
          <div className="flex-1 text-center space-y-1">
            <h1 className="text-2xl font-bold uppercase tracking-widest">PAUD Ceria Bintang</h1>
            <p className="text-sm">Jl. Pendidikan No. 123, Kota Harapan, Indonesia</p>
            <p className="text-sm">Telp: (021) 1234567 | Email: info@paudceriabintang.com</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold uppercase mb-8 underline">
          Laporan Pencapaian Perkembangan Anak Usia Dini
        </h2>

        {/* Student Data */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-32 py-1">Nama Anak</td>
                  <td className="w-4">:</td>
                  <td className="font-semibold">{student.fullName}</td>
                </tr>
                <tr>
                  <td className="py-1">Nama Panggilan</td>
                  <td>:</td>
                  <td>{student.nickName || "-"}</td>
                </tr>
                <tr>
                  <td className="py-1">Nomor Induk</td>
                  <td>:</td>
                  <td>{student.nis || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-32 py-1">Kelas / Kelompok</td>
                  <td className="w-4">:</td>
                  <td>{student.classroom?.name || "-"} ({student.classroom?.level || "-"})</td>
                </tr>
                <tr>
                  <td className="py-1">Tahun Ajaran</td>
                  <td>:</td>
                  <td>{student.classroom?.schoolYear || "-"}</td>
                </tr>
                <tr>
                  <td className="py-1">Periode Penilaian</td>
                  <td>:</td>
                  <td className="font-semibold">{assessment.periodLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Development Aspects */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg border-b pb-1">A. Perkembangan Aspek</h3>

          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left w-8 text-center">No</th>
                <th className="border border-black p-2 text-left w-1/4">Aspek Perkembangan</th>
                <th className="border border-black p-2 text-left">Narasi Deskriptif & Capaian</th>
              </tr>
            </thead>
            <tbody>
              {aspekList.map((aspek, i) => (
                <tr key={i} className="break-inside-avoid">
                  <td className="border border-black p-2 text-center align-top">{i + 1}</td>
                  <td className="border border-black p-2 align-top font-medium">
                    {aspek.label}
                    <div className="mt-2 text-xs font-normal px-2 py-1 bg-gray-200 inline-block rounded">
                      {indicatorLabels[aspek.indicator as keyof typeof indicatorLabels] || aspek.indicator}
                    </div>
                  </td>
                  <td className="border border-black p-3 align-top whitespace-pre-wrap leading-relaxed">
                    {aspek.narasi || "Belum ada catatan deskriptif."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* General Narrative & Recommendations */}
        <div className="mt-8 space-y-4 break-inside-avoid">
          <h3 className="font-bold text-lg border-b pb-1">B. Catatan Perkembangan Keseluruhan</h3>
          <div className="border border-black p-4 min-h-[100px] whitespace-pre-wrap text-sm leading-relaxed">
            {assessment.narrative || "-"}
          </div>

          <h3 className="font-bold text-lg border-b pb-1 mt-6">C. Rekomendasi Guru untuk Orang Tua</h3>
          <div className="border border-black p-4 min-h-[80px] whitespace-pre-wrap text-sm leading-relaxed">
            {assessment.note || "-"}
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-8 text-sm break-inside-avoid">
          <div className="text-center">
            <p className="mb-24">Mengetahui,<br />Orang Tua / Wali</p>
            <p className="font-bold underline">( ........................................ )</p>
          </div>
          <div className="text-center">
            <p className="mb-24">Mengetahui,<br />Guru Kelas</p>
            <p className="font-bold underline">{student.classroom?.mainTeacher?.name || "Guru Pengampu"}</p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm break-inside-avoid">
          <p className="mb-24">Mengetahui,<br />Kepala Sekolah</p>
          <p className="font-bold underline">Nama Kepala Sekolah, S.Pd., M.Pd.</p>
        </div>

        {/* Print Instruction for Dev (will be hidden in print) */}
        <PrintButton />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            /* Default to A4, but user can change to F4 in browser print dialog */
            size: A4 portrait;
            margin: 2cm;
          }
          .print-container {
            width: 100%;
            max-width: none;
            padding: 0;
            margin: 0;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}
