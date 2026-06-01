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
    const subject = isPaid ? `Kwitansi Pembayaran: ${invoice.category}` : `Tagihan Invoice: ${invoice.category}`;
    const text = isPaid
      ? `Yth. Orang Tua dari ${invoice.student?.fullName},\n\nTerima kasih, pembayaran Anda untuk tagihan ${invoice.category} telah kami terima. Terlampir kwitansi pembayaran resmi dari PAUD Ceria Bintang.`
      : `Yth. Orang Tua dari ${invoice.student?.fullName},\n\nBerikut kami lampirkan invoice tagihan ${invoice.category}. Mohon segera melakukan pembayaran. Rincian lebih lanjut terdapat pada dokumen terlampir.`;

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
