import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// This route will be called by Midtrans
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify signature key to ensure request is from Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "YOUR_SERVER_KEY";
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1,
    } = body;

    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Process based on transaction status
    const invoiceId = custom_field1; // We passed invoice ID here

    if (!invoiceId) {
      return NextResponse.json({ error: "No invoice ID in custom_field1" }, { status: 400 });
    }

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (transaction_status === "capture" && fraud_status === "challenge") {
        // Do nothing, wait for accept/deny
        return NextResponse.json({ status: "challenge received" });
      }

      // Check if already processed to prevent duplicate payment records
      const existingPayment = await prisma.payment.findFirst({
        where: { note: `Midtrans Order ID: ${order_id}` },
      });

      if (!existingPayment) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { payments: true }
        });

        if (invoice) {
          // Calculate how much was paid to the invoice (subtracting admin fee)
          // The gross_amount includes 4000 admin fee, so amount to record for invoice is gross - 4000
          const ADMIN_FEE = 4000;
          const invoicePaymentAmount = parseFloat(gross_amount) - ADMIN_FEE;

          // Create payment record
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoicePaymentAmount,
              method: "TRANSFER", // Using TRANSFER as generic online payment representation
              paidAt: new Date(),
              note: `Midtrans Order ID: ${order_id}`,
            },
          });

          // Check if fully paid
          const allPaymentsAmount = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + invoicePaymentAmount;
          const totalRequired = invoice.amount + invoice.fineAmount;

          let newStatus = invoice.status;
          if (allPaymentsAmount >= totalRequired) {
            newStatus = "PAID";
          } else if (allPaymentsAmount > 0) {
            newStatus = "PARTIAL";
          }

          if (newStatus !== invoice.status) {
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: newStatus as any },
            });
          }
        }
      }

      return NextResponse.json({ status: "success" });
    }

    // Other statuses (pending, deny, cancel, expire)
    return NextResponse.json({ status: "received but not settled" });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
