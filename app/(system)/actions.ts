"use server";

import { requireActionAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus, InvoiceStatus, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

const adminAndTu = ["ADMIN", "TU"] as const;
const attendanceRoles = ["ADMIN", "TU", "GURU"] as const;

function safeDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createAdmission(formData: FormData) {
  await requireActionAccess(adminAndTu);

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

export async function approveAdmission(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const admissionId = String(formData.get("admissionId") ?? "").trim();

  if (!admissionId) return;

  try {
    await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { id: admissionId },
      });
      if (!admission || admission.status !== "PENDING") return;

      const student = await tx.student.create({
        data: {
          fullName: admission.childName,
          birthDate: admission.birthDate,
          guardianName: admission.parentName,
          guardianPhone: admission.parentPhone,
          address: admission.address,
        },
      });

      await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          convertedToId: student.id,
        },
      });
    });

    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("approveAdmission failed", { admissionId, error });
  }
}

export async function rejectAdmission(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const admissionId = String(formData.get("admissionId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!admissionId) return;

  try {
    await prisma.admission.update({
      where: { id: admissionId },
      data: { status: "REJECTED", notes: reason || undefined },
    });

    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("rejectAdmission failed", { admissionId, error });
  }
}

export async function createStudent(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!fullName || !birthDate || !guardianName || !guardianPhone) return;

  try {
    await prisma.student.create({
      data: {
        fullName,
        birthDate,
        guardianName,
        guardianPhone,
        address: address || null,
      },
    });

    revalidatePath("/siswa");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createStudent failed", { fullName, guardianPhone, error });
  }
}

export async function deleteStudent(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const studentId = String(formData.get("studentId") ?? "").trim();
  if (!studentId) return;

  try {
    await prisma.student.delete({ where: { id: studentId } });
    revalidatePath("/siswa");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteStudent failed", { studentId, error });
  }
}

export async function createTeacher(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return;

  try {
    await prisma.teacher.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });

    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createTeacher failed", { name, error });
  }
}

export async function updateTeacher(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!teacherId || !name) return;

  try {
    await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });

    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateTeacher failed", { teacherId, name, error });
  }
}

export async function deleteTeacher(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const teacherId = String(formData.get("teacherId") ?? "").trim();
  if (!teacherId) return;

  try {
    await prisma.teacher.delete({ where: { id: teacherId } });
    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteTeacher failed", { teacherId, error });
  }
}

export async function createInvoice(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const periodMonth = Number(formData.get("periodMonth") ?? 0);
  const periodYear = Number(formData.get("periodYear") ?? 0);
  const amount = Number(formData.get("amount") ?? 0);
  const dueDate = safeDate(formData.get("dueDate"));

  if (
    !studentId ||
    !periodMonth ||
    !periodYear ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !dueDate
  ) {
    return;
  }

  const code = `INV-${periodYear}${String(periodMonth).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await prisma.invoice.create({
      data: {
        code,
        studentId,
        periodMonth,
        periodYear,
        amount: Math.round(amount),
        dueDate,
      },
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createInvoice failed", {
      studentId,
      periodMonth,
      periodYear,
      amount,
      error,
    });
  }
}

export async function recordPayment(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "TRANSFER") as PaymentMethod;
  const paidAt = safeDate(formData.get("paidAt")) ?? new Date();
  const note = String(formData.get("note") ?? "").trim();

  if (
    !invoiceId ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Object.values(PaymentMethod).includes(method)
  ) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId,
          amount: Math.round(amount),
          method,
          paidAt,
          note: note || null,
        },
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) return;

      const paidTotal = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const nextStatus =
        paidTotal >= invoice.amount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: nextStatus },
      });
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("recordPayment failed", { invoiceId, amount, method, error });
  }
}

export async function deleteInvoice(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  if (!invoiceId) return;

  try {
    await prisma.invoice.delete({ where: { id: invoiceId } });
    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteInvoice failed", { invoiceId, error });
  }
}

export async function updateInvoice(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const amount = Number(formData.get("amount") ?? NaN);
  const dueDate = safeDate(formData.get("dueDate"));

  if (!invoiceId || !Number.isFinite(amount) || amount <= 0 || !dueDate) return;

  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { amount: Math.round(amount), dueDate },
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateInvoice failed", { invoiceId, amount, error });
  }
}

export async function recordAttendance(formData: FormData) {
  await requireActionAccess(attendanceRoles);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const date = safeDate(formData.get("date")) ?? new Date();
  const status = String(
    formData.get("status") ?? "PRESENT",
  ) as AttendanceStatus;
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
