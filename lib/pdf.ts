import PDFDocument from "pdfkit";

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header (Kop Surat)
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("PAUD Ceria Bintang", { align: "center" });
      
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Jl. Pendidikan No. 1, Jakarta Selatan", { align: "center" })
        .text("Telp: 081234567890 | Email: admin@paudceriabintang.com", { align: "center" })
        .moveDown(2);

      // Garis Pemisah
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(2);

      // Judul Invoice
      const isPaid = invoice.status === "PAID";
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(isPaid ? "KWITANSI PEMBAYARAN" : "TAGIHAN (INVOICE)", { align: "center" })
        .moveDown(1.5);

      // Info Tagihan
      const startY = doc.y;
      
      doc.fontSize(12).font("Helvetica");
      doc.text("No. Tagihan", 50, startY);
      doc.text(`: INV-${invoice.id.substring(0, 8).toUpperCase()}`, 150, startY);

      doc.text("Kategori", 50, startY + 20);
      doc.text(`: ${invoice.category}`, 150, startY + 20);

      doc.text("Tanggal", 50, startY + 40);
      doc.text(`: ${invoice.createdAt.toLocaleDateString("id-ID")}`, 150, startY + 40);

      doc.text("Status", 50, startY + 60);
      doc.fillColor(isPaid ? "green" : (invoice.status === "PARTIAL" ? "orange" : "red"));
      doc.text(`: ${invoice.status}`, 150, startY + 60);
      doc.fillColor("black");

      // Info Siswa
      doc.text("Nama Siswa", 300, startY);
      doc.text(`: ${invoice.student?.fullName || "-"}`, 400, startY);

      doc.text("Kelas", 300, startY + 20);
      doc.text(`: ${invoice.student?.classroom?.name || "-"}`, 400, startY + 20);

      doc.text("Wali Murid", 300, startY + 40);
      const parentName = invoice.student?.parent?.fatherName || invoice.student?.parent?.motherName || "-";
      doc.text(`: ${parentName}`, 400, startY + 40);

      doc.moveDown(4);

      // Tabel Rincian
      const tableTop = doc.y + 10;
      doc.font("Helvetica-Bold");
      doc.text("Deskripsi", 50, tableTop);
      doc.text("Jumlah", 400, tableTop, { width: 150, align: "right" });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font("Helvetica");
      let itemY = tableTop + 25;
      
      doc.text(`Tagihan ${invoice.category} - ${invoice.title || ""}`, 50, itemY);
      doc.text(`Rp ${invoice.amount.toLocaleString("id-ID")}`, 400, itemY, { width: 150, align: "right" });
      
      if (invoice.fineAmount > 0) {
        itemY += 20;
        doc.text(`Denda Keterlambatan`, 50, itemY);
        doc.text(`Rp ${invoice.fineAmount.toLocaleString("id-ID")}`, 400, itemY, { width: 150, align: "right" });
      }

      // Pembayaran Sebelumnya jika ada
      let totalPaid = 0;
      if (invoice.payments && invoice.payments.length > 0) {
        totalPaid = invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
        itemY += 20;
        doc.text(`Total Pembayaran Diterima`, 50, itemY);
        doc.text(`- Rp ${totalPaid.toLocaleString("id-ID")}`, 400, itemY, { width: 150, align: "right" });
      }

      // Total
      const totalY = itemY + 30;
      doc.moveTo(50, totalY - 10).lineTo(550, totalY - 10).stroke();
      doc.font("Helvetica-Bold").fontSize(14);
      doc.text("Sisa Tagihan", 50, totalY);
      const sisa = Math.max(0, invoice.amount + invoice.fineAmount - totalPaid);
      doc.text(`Rp ${sisa.toLocaleString("id-ID")}`, 400, totalY, { width: 150, align: "right" });

      // Footer Catatan
      doc.moveDown(4);
      doc.font("Helvetica-Oblique").fontSize(10);
      if (!isPaid) {
        doc.text("Harap melakukan pembayaran tepat waktu untuk menghindari denda tambahan.", { align: "center" });
        doc.text("Silakan login ke Portal Wali Murid untuk membayar via Midtrans.", { align: "center" });
      } else {
        doc.text("Terima kasih atas pembayaran Anda.", { align: "center" });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
