"use server";

import { AttendanceStatus, InvoiceStatus, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function safeDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createAdmission(formData: FormData) {
  const childName = String(formData.get("childName") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!childName || !birthDate || !parentName || !parentPhone) {
    return;
  }

  try {
    await prisma.admission.create({
      data: {
        childName,
        birthDate,
        parentName,
        parentPhone,
        address: address || null,
        notes: notes || null,
      },
    });
    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createAdmission failed", {
      childName,
      parentPhone,
      error,
    });
  }
}

export async function recordAttendance(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const date = safeDate(formData.get("date")) ?? new Date();
  const status = String(formData.get("status") ?? "PRESENT") as AttendanceStatus;
  const note = String(formData.get("note") ?? "").trim();

  if (!studentId || !Object.values(AttendanceStatus).includes(status)) {
    return;
  }

  try {
    await prisma.attendance.create({
      data: {
        studentId,
        date,
        status,
        note: note || null,
      },
    });
    revalidatePath("/presensi");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("recordAttendance failed", {
      studentId,
      date,
      status,
      error,
    });
  }
}

export async function recordPayment(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "TRANSFER") as PaymentMethod;
  const paidAt = safeDate(formData.get("paidAt")) ?? new Date();
  const note = String(formData.get("note") ?? "").trim();

  if (!invoiceId || !Number.isFinite(amount) || amount <= 0 || !Object.values(PaymentMethod).includes(method)) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          paidAt,
          note: note || null,
        },
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) {
        return;
      }

      const paidTotal = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const nextStatus = paidTotal >= invoice.amount ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: nextStatus },
      });
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("recordPayment failed", {
      invoiceId,
      amount,
      method,
      error,
    });
  }
}
