import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendEmail } from "@/lib/email"; // Ensure sendEmail accepts attachments

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const invoiceId = resolvedParams.id;
    
    if (!invoiceId) {
      return NextResponse.json({ error: "ID invoice tidak valid" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            parent: true,
            classroom: true,
          }
        },
        payments: true,
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const parentEmail = invoice.student?.parent?.email;
    if (!parentEmail) {
      return NextResponse.json({ error: "Parent does not have an email address" }, { status: 400 });
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send Email
    const isPaid = invoice.status === "PAID";
    const subject = isPaid ? `[PAUD/TK] Kwitansi Pembayaran Resmi: ${invoice.category}` : `[PAUD/TK] Tagihan Baru: ${invoice.category}`;
    const text = isPaid
      ? `*TANDA TERIMA PEMBAYARAN (KWITANSI)*\n\nYth. Bapak/Ibu Orang Tua dari Ananda ${invoice.student?.fullName},\n\nSemoga Bapak/Ibu senantiasa dalam keadaan sehat.\n\nMelalui email ini, kami mengonfirmasi bahwa pembayaran untuk tagihan ${invoice.category} (Ref: ${invoice.code}) telah kami *TERIMA* dan *TERVERIFIKASI*.\n\nSebagai bukti transaksi yang sah, kami telah melampirkan Kwitansi Pembayaran resmi. Kami mengucapkan terima kasih atas kelancaran pembayaran Bapak/Ibu yang sangat mendukung kelangsungan proses pendidikan Ananda.\n\nHormat kami,\nBagian Keuangan PAUD/TK`
      : `*PEMBERITAHUAN TAGIHAN BARU*\n\nYth. Bapak/Ibu Orang Tua dari Ananda ${invoice.student?.fullName},\n\nSemoga Bapak/Ibu senantiasa dalam keadaan sehat.\n\nBersama email ini, kami menerbitkan tagihan (invoice) baru untuk komponen ${invoice.category} dengan nomor referensi *${invoice.code}*. \n\nBapak/Ibu dapat meninjau rincian tagihan beserta tenggat waktu pembayarannya pada dokumen PDF yang terlampir. Kami mohon agar pembayaran dapat dilakukan sebelum tanggal jatuh tempo guna menghindari denda keterlambatan administrasi.\n\nAtas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\nHormat kami,\nBagian Keuangan PAUD/TK`;

    await sendEmail({
      to: parentEmail,
      subject,
      text,
      attachments: [
        {
          filename: `Invoice_${invoice.category}_${invoice.student?.fullName}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    return NextResponse.json({ message: "Email successfully sent" });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
