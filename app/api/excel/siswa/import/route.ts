import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse as array of objects (using headers)
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Excel file is empty" }, { status: 400 });
    }

    let successCount = 0;
    const defaultPassword = await bcrypt.hash("ortu123", 10);

    // Process rows sequentially to avoid overwhelming DB connection
    for (const row of data) {
      const childName = row["Nama Lengkap"];
      if (!childName) continue;

      const whatsappRaw = row["No WhatsApp"] ? String(row["No WhatsApp"]) : "";
      const whatsapp = whatsappRaw.replace(/[^0-9+]/g, "");

      // If mother or father name is provided, ensure Parent exists
      const fatherName = row["Nama Ayah"] || "";
      const motherName = row["Nama Ibu"] || "";
      
      let parentId = null;

      if (fatherName || motherName) {
        const parent = await prisma.parent.create({
          data: {
            fatherName,
            motherName,
            fatherJob: row["Pekerjaan Ayah"] || "",
            motherJob: row["Pekerjaan Ibu"] || "",
            whatsapp,
            nik: String(row["NIK Orang Tua"] || ""),
            address: row["Alamat Lengkap"] || "",
          }
        });
        parentId = parent.id;

        // Create user for parent if whatsapp is available
        if (whatsapp) {
          const existingUser = await prisma.user.findUnique({ where: { username: whatsapp } });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                username: whatsapp,
                passwordHash: defaultPassword,
                role: "ORANG_TUA",
                displayName: fatherName || motherName,
                parentId: parent.id,
              }
            });
          } else if (!existingUser.parentId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { parentId: parent.id }
            });
          }
        }
      }

      // Handle Birth Date (Excel might give a serial number or string)
      let parsedDate = new Date();
      if (row["Tanggal Lahir (YYYY-MM-DD)"]) {
        const d = row["Tanggal Lahir (YYYY-MM-DD)"];
        if (typeof d === 'number') {
          // Excel serial date to JS Date
          parsedDate = new Date((d - (25567 + 2)) * 86400 * 1000);
        } else {
          parsedDate = new Date(d);
        }
      }

      // Create Student
      await prisma.student.create({
        data: {
          fullName: childName,
          nickName: row["Nama Panggilan"] || "",
          birthPlace: row["Tempat Lahir"] || "",
          birthDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
          gender: row["Jenis Kelamin (Laki-laki/Perempuan)"] === "Perempuan" ? "Perempuan" : "Laki-laki",
          nik: String(row["NIK Anak"] || ""),
          allergies: row["Alergi"] || "",
          specialNeeds: row["Kebutuhan Khusus"] || "",
          status: "ACTIVE",
          parentId,
        }
      });
      successCount++;
    }

    return NextResponse.json({ message: `Successfully imported ${successCount} students` }, { status: 200 });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
