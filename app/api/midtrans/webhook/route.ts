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

    // Acknowledge Midtrans Dashboard Test Notifications
    if (order_id && order_id.startsWith("payment_notif_test")) {
      return NextResponse.json({ status: "test notification acknowledged" }, { status: 200 });
    }

    // Always respond 200 OK to Midtrans if the signature is valid, 
    // even if we decide not to process (e.g. pending/challenge/deny status),
    // to prevent Midtrans from endlessly retrying.
    const invoiceId = custom_field1;

    if (!invoiceId) {
      // Return 200 to acknowledge but ignore, rather than 400 which triggers retries
      return NextResponse.json({ status: "ignored: no invoice ID in custom_field1" }, { status: 200 });
    }

    // Validate based on Midtrans Best Practices:
    // 1. Status Code == 200
    // 2. Transaction Status == capture or settlement
    // 3. Fraud Status == accept (if exists)
    const isSuccess =
      status_code === "200" &&
      (transaction_status === "capture" || transaction_status === "settlement") &&
      (!fraud_status || fraud_status === "accept");

    if (isSuccess) {

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

      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    // For any other status (pending, expire, deny, challenge), we just acknowledge with 200
    // so Midtrans knows we received it and won't retry.
    return NextResponse.json({ status: "ignored or not success" }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
