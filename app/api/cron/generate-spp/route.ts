import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET ?? "siakad-cron-secret";

// Default SPP amount — can be configured via environment variable
const DEFAULT_SPP_AMOUNT = Number(process.env.SPP_AMOUNT) || 350000;

// Late fee per day (configurable)
const LATE_FEE_PER_DAY = Number(process.env.LATE_FEE_PER_DAY) || 5000;

// Maximum late fee cap
const MAX_LATE_FEE = Number(process.env.MAX_LATE_FEE) || 100000;

/**
 * TASK 5: Automated SPP Invoicing (Cron Job API Route)
 *
 * This endpoint is designed to be called monthly (e.g., via Vercel Cron or external scheduler).
 * It performs two operations:
 *
 * 1. Calculate late fees for overdue invoices from previous months
 * 2. Generate new SPP invoices for all ACTIVE students for the current month
 *
 * Authorization: Requires `CRON_SECRET` header to prevent unauthorized access.
 *
 * Usage:
 *   curl -X POST http://localhost:3001/api/cron/generate-spp \
 *     -H "Authorization: Bearer siakad-cron-secret"
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // ─── Step 1: Calculate late fees for overdue invoices ─────────────────

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["UNPAID", "PARTIAL"] },
        dueDate: { lt: now },
      },
      include: { 
        payments: true,
        student: { include: { parent: true, classroom: true } }
      },
    });

    let lateFeesApplied = 0;

    for (const invoice of overdueInvoices) {
      const daysLate = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLate <= 0) continue;

      const calculatedFine = Math.min(daysLate * LATE_FEE_PER_DAY, MAX_LATE_FEE);

      // Only update if the fine has increased
      if (calculatedFine > invoice.fineAmount && invoice.category === "SPP") {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { fineAmount: calculatedFine },
        });
        lateFeesApplied++;
      }

      // Send Reminder Email if parent has email
      if (invoice.student.parent?.email) {
        try {
          const pdfBuffer = await generateInvoicePDF(invoice);
          await sendEmail({
            to: invoice.student.parent.email,
            subject: `PENGINGAT: Tagihan ${invoice.category} Belum Lunas`,
            text: `Yth. Orang Tua dari ${invoice.student.fullName},\n\nKami menginformasikan bahwa terdapat tagihan ${invoice.category} (Kode: ${invoice.code}) yang telah melewati jatuh tempo pada ${invoice.dueDate.toLocaleDateString("id-ID")}.\n\nTotal tunggakan dan denda (jika ada) dapat dilihat pada invoice terlampir. Mohon segera melakukan pembayaran.\n\nAbaikan pesan ini jika Anda sudah melakukan pembayaran dalam 24 jam terakhir.`,
            attachments: [
              {
                filename: `Reminder_${invoice.code}.pdf`,
                content: pdfBuffer,
              }
            ]
          });
        } catch (emailErr) {
          console.error(`Failed to send reminder email to ${invoice.student.parent.email}`, emailErr);
        }
      }
    }

    // ─── Step 2: Generate new SPP invoices ───────────────────────────────

    const activeStudents = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, parent: { select: { email: true } } },
    });

    let invoicesCreated = 0;
    let skipped = 0;

    for (const student of activeStudents) {
      // Check if invoice already exists for this month
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          studentId: student.id,
          category: "SPP",
          periodMonth: currentMonth,
          periodYear: currentYear,
        },
      });

      if (existingInvoice) {
        skipped++;
        continue;
      }

      // Generate unique invoice code
      const code = `SPP-${currentYear}${String(currentMonth).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // Due date: 10th of the current month
      const dueDate = new Date(currentYear, currentMonth - 1, 10);
      if (dueDate < now) {
        // If we're past the 10th, set due date to 10th of next month
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const newInvoice = await prisma.invoice.create({
        data: {
          code,
          studentId: student.id,
          category: "SPP",
          periodMonth: currentMonth,
          periodYear: currentYear,
          amount: DEFAULT_SPP_AMOUNT,
          dueDate,
        }
      });

      invoicesCreated++;
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      period: `${currentMonth}/${currentYear}`,
      summary: {
        activeStudents: activeStudents.length,
        invoicesCreated,
        skipped,
        lateFeesApplied,
        defaultSppAmount: DEFAULT_SPP_AMOUNT,
        lateFeePerDay: LATE_FEE_PER_DAY,
        maxLateFee: MAX_LATE_FEE,
      },
    });
  } catch (error) {
    console.error("generate-spp cron failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Also support GET for easy testing via browser
export async function GET(request: NextRequest) {
  return POST(request);
}
