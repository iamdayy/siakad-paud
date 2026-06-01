import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { parent: true, classroom: true },
      orderBy: { createdAt: "desc" },
    });

    const data = students.map((s) => ({
      "NIS": s.nis || "-",
      "Nama Lengkap": s.fullName,
      "Nama Panggilan": s.nickName || "-",
      "Tempat Lahir": s.birthPlace || "-",
      "Tanggal Lahir": s.birthDate.toISOString().split("T")[0],
      "Jenis Kelamin": s.gender,
      "Status": s.status,
      "Kelas": s.classroom?.name || "-",
      "Nama Ayah": s.parent?.fatherName || "-",
      "Nama Ibu": s.parent?.motherName || "-",
      "WhatsApp": s.parent?.whatsapp || "-",
      "Alamat": s.parent?.address || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="Data_Siswa.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
