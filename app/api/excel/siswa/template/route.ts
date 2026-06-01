import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Tentukan kolom-kolom untuk template Excel
    const columns = [
      "Nama Lengkap",
      "Nama Panggilan",
      "Tempat Lahir",
      "Tanggal Lahir (YYYY-MM-DD)",
      "Jenis Kelamin (Laki-laki/Perempuan)",
      "NIK Anak",
      "Alergi",
      "Kebutuhan Khusus",
      "Nama Ayah",
      "Nama Ibu",
      "Pekerjaan Ayah",
      "Pekerjaan Ibu",
      "No WhatsApp",
      "NIK Orang Tua",
      "Alamat Lengkap",
    ];

    // Buat worksheet dengan satu baris header
    const worksheet = XLSX.utils.aoa_to_sheet([columns]);

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");

    // Tulis workbook ke dalam buffer
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="Template_Siswa.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Error generating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
