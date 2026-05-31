import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    // We expect the user to be ORANG_TUA to pay, or ADMIN.
    if (!user || (user.role !== "ORANG_TUA" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    // Get the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            parent: {
              include: { user: true }
            },
          }
        },
        payments: true,
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    // Verify ownership if user is ORANG_TUA
    if (user.role === "ORANG_TUA" && invoice.student.parentId !== user.parentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate remaining amount
    const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    let remainingAmount = invoice.amount + invoice.fineAmount - paidAmount;
    
    if (remainingAmount <= 0) {
      return NextResponse.json({ error: "Invoice already fully paid" }, { status: 400 });
    }

    // Midtrans Payment Gateway Fee (Admin Fee)
    const ADMIN_FEE = 4000;
    const grossAmount = remainingAmount + ADMIN_FEE;

    // Create unique order ID to avoid duplicate order ID in midtrans for retries
    const orderId = `${invoice.id}-${Date.now()}`;

    // Create Snap transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: `INV-${invoice.category}`,
          price: remainingAmount,
          quantity: 1,
          name: `Tagihan ${invoice.category} - ${invoice.student.fullName}`,
        },
        {
          id: 'ADMIN-FEE',
          price: ADMIN_FEE,
          quantity: 1,
          name: 'Biaya Layanan Payment Gateway',
        }
      ],
      customer_details: {
        first_name: invoice.student.parent?.user?.displayName || "Orang Tua",
        email: invoice.student.parent?.email || "ortu@example.com",
        phone: invoice.student.parent?.whatsapp || "08123456789",
      },
      custom_field1: invoice.id, // Store invoice ID to easily reference it in webhook
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("Error creating snap token:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
