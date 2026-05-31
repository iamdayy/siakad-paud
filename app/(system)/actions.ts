"use server";

import { requireActionAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AttendanceStatus,
  InvoiceStatus,
  PaymentMethod,
  InvoiceCategory,
  ExpenseCategory,
  AssessmentIndicator,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const adminAndTu = ["ADMIN", "TU"] as const;
const attendanceRoles = ["ADMIN", "TU", "GURU"] as const;
const reportRoles = ["ADMIN", "TU", "GURU"] as const;

function safeDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function safeInt(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

// ─── Mock WhatsApp Notification ────────────────────────────────────────────────

async function sendWhatsAppNotification(
  phone: string,
  message: string,
) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.log(`[WhatsApp Mock] To: ${phone} | Message: ${message}`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("target", phone);
    formData.append("message", message);
    formData.append("countryCode", "62"); // Auto format local numbers to +62

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const json = await res.json();
    if (!json.status) {
      console.error(`[Fonnte Error] Failed to send WhatsApp to ${phone}:`, json.reason);
    } else {
      console.log(`[Fonnte Success] To: ${phone}`);
    }
  } catch (error) {
    console.error(`[Fonnte Error] Failed to send WhatsApp to ${phone}`, error);
  }
}

// ─── PPDB / Admission ──────────────────────────────────────────────────────────

export async function createAdmission(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const childName = String(formData.get("childName") ?? "").trim();
  const nickName = String(formData.get("nickName") ?? "").trim();
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const gender = String(formData.get("gender") ?? "").trim();
  const childNik = String(formData.get("childNik") ?? "").trim();
  const siblingCount = safeInt(formData.get("siblingCount"));
  const immunizationHistory = String(formData.get("immunizationHistory") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const specialNeeds = String(formData.get("specialNeeds") ?? "").trim();

  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const motherName = String(formData.get("motherName") ?? "").trim();
  const parentNik = String(formData.get("parentNik") ?? "").trim();
  const fatherJob = String(formData.get("fatherJob") ?? "").trim();
  const motherJob = String(formData.get("motherJob") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!childName || !birthDate || !whatsapp) {
    return;
  }

  try {
    await prisma.admission.create({
      data: {
        childName,
        nickName: nickName || null,
        birthPlace: birthPlace || null,
        birthDate,
        gender: gender || null,
        childNik: childNik || null,
        siblingCount: siblingCount || null,
        immunizationHistory: immunizationHistory || null,
        allergies: allergies || null,
        specialNeeds: specialNeeds || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        parentNik: parentNik || null,
        fatherJob: fatherJob || null,
        motherJob: motherJob || null,
        whatsapp,
        parentPhone: parentPhone || null,
        address: address || null,
        notes: notes || null,
      },
    });
    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createAdmission failed", {
      childName,
      whatsapp,
      error,
    });
  }
}

// Public-facing admission submit (no RBAC)
export async function submitAdmissionPublic(formData: FormData) {
  const childName = String(formData.get("childName") ?? "").trim();
  const nickName = String(formData.get("nickName") ?? "").trim();
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const gender = String(formData.get("gender") ?? "").trim();
  const childNik = String(formData.get("childNik") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const specialNeeds = String(formData.get("specialNeeds") ?? "").trim();

  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const motherName = String(formData.get("motherName") ?? "").trim();
  const fatherJob = String(formData.get("fatherJob") ?? "").trim();
  const motherJob = String(formData.get("motherJob") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "").trim();

  // Simple honeypot anti-spam: if filled, silently ignore submission
  if (honeypot) return;

  if (!childName || !birthDate || !whatsapp) {
    return;
  }

  try {
    await prisma.admission.create({
      data: {
        childName,
        nickName: nickName || null,
        birthPlace: birthPlace || null,
        birthDate,
        gender: gender || null,
        childNik: childNik || null,
        allergies: allergies || null,
        specialNeeds: specialNeeds || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        fatherJob: fatherJob || null,
        motherJob: motherJob || null,
        whatsapp,
        parentPhone: parentPhone || null,
        address: address || null,
        notes: notes || null,
      },
    });
    revalidatePath("/ppdb-public");
    revalidatePath("/ppdb");
    revalidatePath("/dashboard");

    redirect("/ppdb-public/thanks");
  } catch (error) {
    console.error("submitAdmissionPublic failed", {
      childName,
      whatsapp,
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

      // Create or find parent record
      let parent = await tx.parent.findFirst({
        where: { whatsapp: admission.whatsapp },
      });

      if (!parent) {
        parent = await tx.parent.create({
          data: {
            fatherName: admission.fatherName,
            motherName: admission.motherName,
            nik: admission.parentNik,
            fatherJob: admission.fatherJob,
            motherJob: admission.motherJob,
            whatsapp: admission.whatsapp,
            phone: admission.parentPhone,
            address: admission.address,
          },
        });
      }

      // Create student with full data from admission
      const student = await tx.student.create({
        data: {
          fullName: admission.childName,
          nickName: admission.nickName,
          birthPlace: admission.birthPlace,
          birthDate: admission.birthDate,
          gender: admission.gender,
          nik: admission.childNik,
          siblingCount: admission.siblingCount,
          immunizationHistory: admission.immunizationHistory,
          allergies: admission.allergies,
          specialNeeds: admission.specialNeeds,
          address: admission.address,
          parentId: parent.id,
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

      // Generate Uang Pangkal Invoice (Default Amount: 1,500,000 for PAUD)
      const now = new Date();
      const code = `INV-UP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      await tx.invoice.create({
        data: {
          code,
          studentId: student.id,
          category: "PANGKAL",
          periodMonth: now.getMonth() + 1,
          periodYear: now.getFullYear(),
          amount: 1500000,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      });

      // Send notification to parent
      await sendWhatsAppNotification(
        admission.whatsapp,
        `Selamat! Pendaftaran ananda ${admission.childName} telah disetujui. Silakan masuk ke dashboard untuk melihat dan melunasi tagihan Uang Pangkal. Nomor Induk Siswa (NIS) akan otomatis terbit setelah tagihan lunas.`,
      );
    });

    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
    revalidatePath("/siswa");
    revalidatePath("/keuangan");
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
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });

    await prisma.admission.update({
      where: { id: admissionId },
      data: { status: "REJECTED", notes: reason || undefined },
    });

    if (admission) {
      await sendWhatsAppNotification(
        admission.whatsapp,
        `Mohon maaf, pendaftaran ${admission.childName} belum dapat diterima. Alasan: ${reason || "Tidak disebutkan"}. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.`,
      );
    }

    revalidatePath("/ppdb");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("rejectAdmission failed", { admissionId, error });
  }
}

// ─── Student ───────────────────────────────────────────────────────────────────

export async function createStudent(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const nickName = String(formData.get("nickName") ?? "").trim();
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const gender = String(formData.get("gender") ?? "").trim();
  const nik = String(formData.get("nik") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const specialNeeds = String(formData.get("specialNeeds") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim();

  if (!fullName || !birthDate) return;

  try {
    await prisma.student.create({
      data: {
        fullName,
        nickName: nickName || null,
        birthPlace: birthPlace || null,
        birthDate,
        gender: gender || null,
        nik: nik || null,
        allergies: allergies || null,
        specialNeeds: specialNeeds || null,
        address: address || null,
        parentId: parentId || null,
      },
    });

    revalidatePath("/siswa");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createStudent failed", { fullName, error });
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

export async function updateStudentStatus(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE") as any;

  if (!studentId || !["ACTIVE", "GRADUATED", "MUTATED", "INACTIVE"].includes(status)) return;

  try {
    // If graduated or mutated, we might want to clear their classroom assignment
    const dataToUpdate: any = { status };
    if (status !== "ACTIVE") {
      dataToUpdate.classroomId = null;
    }

    await prisma.student.update({
      where: { id: studentId },
      data: dataToUpdate,
    });

    revalidatePath("/siswa");
    revalidatePath("/kelas");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateStudentStatus failed", { studentId, status, error });
  }
}

// ─── Teacher ───────────────────────────────────────────────────────────────────

export async function createTeacher(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const name = String(formData.get("name") ?? "").trim();
  const nik = String(formData.get("nik") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const lastEducation = String(formData.get("lastEducation") ?? "").trim();
  const certificationNumber = String(formData.get("certificationNumber") ?? "").trim();
  const position = String(formData.get("position") ?? "GURU_KELAS").trim();

  if (!name) return;

  try {
    await prisma.teacher.create({
      data: {
        name,
        nik: nik || null,
        email: email || null,
        phone: phone || null,
        birthPlace: birthPlace || null,
        birthDate: birthDate || null,
        lastEducation: lastEducation || null,
        certificationNumber: certificationNumber || null,
        position: position as "KEPALA_SEKOLAH" | "GURU_KELAS" | "GURU_PENDAMPING" | "STAFF_ADMINISTRASI",
      },
    });

    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createTeacher failed", { name, error });
  }
}

export async function updateSystemConfig(formData: FormData) {
  // Mock implementation for the config save
  await requireActionAccess(adminAndTu);
  revalidatePath("/dashboard");
}

export async function teacherCheckIn(formData: FormData) {
  const user = await requireActionAccess(["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"]);
  
  // Identify which teacher this is
  const teacherId = user.teacherId;
  if (!teacherId) return;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // See if already checked in today
    const existing = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existing) {
      // Update checkIn if needed, but normally just ignore
      return;
    }

    await prisma.teacherAttendance.create({
      data: {
        teacherId,
        date: new Date(),
        status: "PRESENT",
        checkIn: new Date(),
      }
    });

    revalidatePath("/guru/presensi");
  } catch (error) {
    console.error("teacherCheckIn failed", error);
  }
}

export async function saveAssessment(formData: FormData) {
  await requireActionAccess(["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"]);
  
  const studentId = formData.get("studentId") as string;
  const periodLabel = formData.get("periodLabel") as string;
  
  if (!studentId || !periodLabel) return;

  const data = {
    agamaMoral: formData.get("agamaMoral") as any,
    fisikMotorik: formData.get("fisikMotorik") as any,
    kognitif: formData.get("kognitif") as any,
    bahasa: formData.get("bahasa") as any,
    sosialEmosional: formData.get("sosialEmosional") as any,
    seni: formData.get("seni") as any,
    
    narasiAgamaMoral: formData.get("narasiAgamaMoral") as string,
    narasiFisikMotorik: formData.get("narasiFisikMotorik") as string,
    narasiKognitif: formData.get("narasiKognitif") as string,
    narasiBahasa: formData.get("narasiBahasa") as string,
    narasiSosialEmosional: formData.get("narasiSosialEmosional") as string,
    narasiSeni: formData.get("narasiSeni") as string,
  };

  try {
    const existing = await prisma.assessment.findFirst({
      where: { studentId, periodLabel }
    });

    if (existing) {
      await prisma.assessment.update({
        where: { id: existing.id },
        data
      });
    } else {
      await prisma.assessment.create({
        data: {
          studentId,
          periodLabel,
          ...data
        }
      });
    }

    revalidatePath("/guru/raport");
  } catch (error) {
    console.error("saveAssessment failed", error);
  }
}

export async function teacherCheckOut(formData: FormData) {
  const user = await requireActionAccess(["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"]);
  
  const teacherId = user.teacherId;
  if (!teacherId) return;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!existing) return;

    await prisma.teacherAttendance.update({
      where: { id: existing.id },
      data: { checkOut: new Date() }
    });

    revalidatePath("/guru/presensi");
  } catch (error) {
    console.error("teacherCheckOut failed", error);
  }
}

export async function updateTeacher(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lastEducation = String(formData.get("lastEducation") ?? "").trim();
  const certificationNumber = String(formData.get("certificationNumber") ?? "").trim();
  const position = String(formData.get("position") ?? "GURU_KELAS").trim();

  if (!teacherId || !name) return;

  try {
    await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        lastEducation: lastEducation || null,
        certificationNumber: certificationNumber || null,
        position: position as "KEPALA_SEKOLAH" | "GURU_KELAS" | "GURU_PENDAMPING" | "STAFF_ADMINISTRASI",
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

export async function submitLessonPlan(formData: FormData) {
  await requireActionAccess(["ADMIN", "TU", "GURU"]);

  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "RPPH").trim();
  const weekDate = safeDate(formData.get("weekDate")) ?? new Date();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!teacherId || !title || !type) return;

  try {
    await prisma.lessonPlan.create({
      data: {
        teacherId,
        title,
        type,
        weekDate,
        fileUrl: fileUrl || null,
        content: content || null,
      },
    });

    revalidatePath("/guru/logbook");
    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("submitLessonPlan failed", { teacherId, title, error });
  }
}

export async function deleteLessonPlan(formData: FormData) {
  await requireActionAccess(["ADMIN", "TU", "GURU"]);

  const lessonPlanId = String(formData.get("lessonPlanId") ?? "").trim();
  if (!lessonPlanId) return;

  try {
    await prisma.lessonPlan.delete({ where: { id: lessonPlanId } });
    revalidatePath("/guru/logbook");
    revalidatePath("/guru");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteLessonPlan failed", { lessonPlanId, error });
  }
}

// ─── Invoice & Payment ─────────────────────────────────────────────────────────

export async function createInvoice(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const category = String(formData.get("category") ?? "SPP") as InvoiceCategory;
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
        category,
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
        include: { payments: true, student: { include: { parent: true } } },
      });

      if (!invoice) return;

      const paidTotal = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const totalDue = invoice.amount + invoice.fineAmount;
      const nextStatus =
        paidTotal >= totalDue
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: nextStatus },
      });

      // Generate NIS if this is PANGKAL and fully paid
      if (invoice.category === "PANGKAL" && nextStatus === InvoiceStatus.PAID && !invoice.student.nis) {
        // Find last NIS in the same year to generate sequential number
        const currentYear = new Date().getFullYear();
        const yearPrefix = currentYear.toString();
        
        const lastStudent = await tx.student.findFirst({
          where: { nis: { startsWith: yearPrefix } },
          orderBy: { nis: 'desc' }
        });

        let nextNum = 1;
        if (lastStudent?.nis) {
          const lastNum = parseInt(lastStudent.nis.substring(6), 10);
          if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
          }
        }

        const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
        const newNis = `${yearPrefix}${currentMonth}${String(nextNum).padStart(3, "0")}`;

        await tx.student.update({
          where: { id: invoice.studentId },
          data: { nis: newNis },
        });

        // Notify parent
        if (invoice.student.parent?.whatsapp) {
          await sendWhatsAppNotification(
            invoice.student.parent.whatsapp,
            `Terima kasih. Pembayaran Uang Pangkal untuk ananda ${invoice.student.fullName} telah kami terima secara penuh. Nomor Induk Siswa (NIS) resmi ananda adalah: ${newNis}.`,
          );
        }
      }
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
    revalidatePath("/siswa");
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

// ─── Expense (Pengeluaran Kas) ─────────────────────────────────────────────────

export async function createExpense(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const category = String(formData.get("category") ?? "LAINNYA") as ExpenseCategory;
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const date = safeDate(formData.get("date")) ?? new Date();
  const recipient = String(formData.get("recipient") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!description || !Number.isFinite(amount) || amount <= 0) return;

  const code = `EXP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await prisma.expense.create({
      data: {
        code,
        category,
        description,
        amount: Math.round(amount),
        date,
        recipient: recipient || null,
        note: note || null,
      },
    });

    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createExpense failed", { description, amount, error });
  }
}

export async function deleteExpense(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const expenseId = String(formData.get("expenseId") ?? "").trim();
  if (!expenseId) return;

  try {
    await prisma.expense.delete({ where: { id: expenseId } });
    revalidatePath("/keuangan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteExpense failed", { expenseId, error });
  }
}

// ─── Attendance (Bulk — TASK 4) ────────────────────────────────────────────────

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
    await prisma.attendance.upsert({
      where: {
        studentId_date: { studentId, date },
      },
      create: {
        studentId,
        date,
        status,
        note: note || null,
      },
      update: {
        status,
        note: note || null,
      },
    });

    // Notify parent when student arrives
    if (status === "PRESENT") {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { parent: true },
      });
      if (student?.parent?.whatsapp) {
        await sendWhatsAppNotification(
          student.parent.whatsapp,
          `${student.nickName || student.fullName} sudah tiba di sekolah pada ${date.toLocaleDateString("id-ID")}. Terima kasih.`,
        );
      }
    }

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

type BulkAttendanceEntry = {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
};

export async function recordBulkAttendance(formData: FormData) {
  await requireActionAccess(attendanceRoles);

  const dateStr = String(formData.get("date") ?? "").trim();
  const entriesJson = String(formData.get("entries") ?? "[]");
  const date = safeDate(dateStr) ?? new Date();

  let entries: BulkAttendanceEntry[];
  try {
    entries = JSON.parse(entriesJson);
  } catch {
    return;
  }

  if (!Array.isArray(entries) || entries.length === 0) return;

  try {
    await prisma.$transaction(async (tx) => {
      for (const entry of entries) {
        if (!entry.studentId || !Object.values(AttendanceStatus).includes(entry.status)) {
          continue;
        }

        await tx.attendance.upsert({
          where: {
            studentId_date: { studentId: entry.studentId, date },
          },
          create: {
            studentId: entry.studentId,
            date,
            status: entry.status,
            note: entry.note || null,
          },
          update: {
            status: entry.status,
            note: entry.note || null,
          },
        });
      }
    });

    // After bulk save, notify parents of present students
    const presentStudentIds = entries
      .filter((e) => e.status === "PRESENT")
      .map((e) => e.studentId);

    if (presentStudentIds.length > 0) {
      const students = await prisma.student.findMany({
        where: { id: { in: presentStudentIds } },
        include: { parent: true },
      });

      for (const student of students) {
        if (student.parent?.whatsapp) {
          await sendWhatsAppNotification(
            student.parent.whatsapp,
            `${student.nickName || student.fullName} sudah tiba di sekolah pada ${date.toLocaleDateString("id-ID")}. Terima kasih.`,
          );
        }
      }
    }

    revalidatePath("/presensi");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("recordBulkAttendance failed", { date, error });
  }
}

// ─── Daily Report ──────────────────────────────────────────────────────────────

export async function createDailyReport(formData: FormData) {
  await requireActionAccess(reportRoles);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const reportDate = safeDate(formData.get("reportDate")) ?? new Date();
  const meals = String(formData.get("meals") ?? "").trim();
  const napDuration = String(formData.get("napDuration") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();
  const activities = String(formData.get("activities") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!studentId || !activities) return;

  try {
    await prisma.dailyReport.upsert({
      where: {
        studentId_reportDate: { studentId, reportDate },
      },
      create: {
        studentId,
        reportDate,
        meals: meals || null,
        napDuration: napDuration || null,
        mood: mood || null,
        activities,
        note: note || null,
      },
      update: {
        meals: meals || null,
        napDuration: napDuration || null,
        mood: mood || null,
        activities,
        note: note || null,
      },
    });

    // Notify parent about daily report
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true },
    });
    if (student?.parent?.whatsapp) {
      await sendWhatsAppNotification(
        student.parent.whatsapp,
        `Laporan harian ${student.nickName || student.fullName}: ${activities}. Mood: ${mood || "-"}. Makan: ${meals || "-"}. Tidur siang: ${napDuration || "-"}.`,
      );
    }

    revalidatePath("/laporan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createDailyReport failed", { studentId, error });
  }
}

// ─── Assessment / E-Raport ─────────────────────────────────────────────────────

export async function createAssessment(formData: FormData) {
  await requireActionAccess(reportRoles);

  const studentId = String(formData.get("studentId") ?? "").trim();
  const periodLabel = String(formData.get("periodLabel") ?? "").trim();

  const agamaMoral = String(formData.get("agamaMoral") ?? "BB") as AssessmentIndicator;
  const fisikMotorik = String(formData.get("fisikMotorik") ?? "BB") as AssessmentIndicator;
  const kognitif = String(formData.get("kognitif") ?? "BB") as AssessmentIndicator;
  const bahasa = String(formData.get("bahasa") ?? "BB") as AssessmentIndicator;
  const sosialEmosional = String(formData.get("sosialEmosional") ?? "BB") as AssessmentIndicator;
  const seni = String(formData.get("seni") ?? "BB") as AssessmentIndicator;

  const narasiAgamaMoral = String(formData.get("narasiAgamaMoral") ?? "").trim();
  const narasiFisikMotorik = String(formData.get("narasiFisikMotorik") ?? "").trim();
  const narasiKognitif = String(formData.get("narasiKognitif") ?? "").trim();
  const narasiBahasa = String(formData.get("narasiBahasa") ?? "").trim();
  const narasiSosialEmosional = String(formData.get("narasiSosialEmosional") ?? "").trim();
  const narasiSeni = String(formData.get("narasiSeni") ?? "").trim();
  const narrative = String(formData.get("narrative") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const isPublished = formData.get("isPublished") === "true";

  if (!studentId || !periodLabel) return;

  const indicators = [agamaMoral, fisikMotorik, kognitif, bahasa, sosialEmosional, seni];
  if (!indicators.every((i) => Object.values(AssessmentIndicator).includes(i))) {
    return;
  }

  try {
    await prisma.assessment.upsert({
      where: {
        studentId_periodLabel: { studentId, periodLabel },
      },
      create: {
        studentId,
        periodLabel,
        agamaMoral,
        fisikMotorik,
        kognitif,
        bahasa,
        sosialEmosional,
        seni,
        narasiAgamaMoral: narasiAgamaMoral || null,
        narasiFisikMotorik: narasiFisikMotorik || null,
        narasiKognitif: narasiKognitif || null,
        narasiBahasa: narasiBahasa || null,
        narasiSosialEmosional: narasiSosialEmosional || null,
        narasiSeni: narasiSeni || null,
        narrative: narrative || null,
        note: note || null,
        isPublished,
      },
      update: {
        agamaMoral,
        fisikMotorik,
        kognitif,
        bahasa,
        sosialEmosional,
        seni,
        narasiAgamaMoral: narasiAgamaMoral || null,
        narasiFisikMotorik: narasiFisikMotorik || null,
        narasiKognitif: narasiKognitif || null,
        narasiBahasa: narasiBahasa || null,
        narasiSosialEmosional: narasiSosialEmosional || null,
        narasiSeni: narasiSeni || null,
        narrative: narrative || null,
        note: note || null,
        isPublished,
      },
    });

    revalidatePath("/laporan");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createAssessment failed", { studentId, periodLabel, error });
  }
}

// ─── Classroom Management ────────────────────────────────────────────────────────

export async function createClassroom(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const name = String(formData.get("name") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const schoolYear = String(formData.get("schoolYear") ?? "").trim();
  const maxCapacity = safeInt(formData.get("maxCapacity"), 15);
  const mainTeacherId = String(formData.get("mainTeacherId") ?? "").trim();
  const coTeacherId = String(formData.get("coTeacherId") ?? "").trim();

  if (!name || !level || !schoolYear) return;

  try {
    await prisma.classroom.create({
      data: {
        name,
        level,
        schoolYear,
        maxCapacity,
        mainTeacherId: mainTeacherId || null,
        coTeacherId: coTeacherId || null,
      },
    });

    revalidatePath("/kelas");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createClassroom failed", { name, error });
  }
}

export async function updateClassroom(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const classroomId = String(formData.get("classroomId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const schoolYear = String(formData.get("schoolYear") ?? "").trim();
  const maxCapacity = safeInt(formData.get("maxCapacity"), 15);
  const mainTeacherId = String(formData.get("mainTeacherId") ?? "").trim();
  const coTeacherId = String(formData.get("coTeacherId") ?? "").trim();

  if (!classroomId || !name || !level || !schoolYear) return;

  try {
    await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        name,
        level,
        schoolYear,
        maxCapacity,
        mainTeacherId: mainTeacherId || null,
        coTeacherId: coTeacherId || null,
      },
    });

    revalidatePath("/kelas");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateClassroom failed", { classroomId, error });
  }
}

export async function deleteClassroom(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const classroomId = String(formData.get("classroomId") ?? "").trim();
  if (!classroomId) return;

  try {
    await prisma.classroom.delete({ where: { id: classroomId } });
    revalidatePath("/kelas");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteClassroom failed", { classroomId, error });
  }
}

export async function assignStudentsToClass(formData: FormData) {
  await requireActionAccess(adminAndTu);

  const classroomId = String(formData.get("classroomId") ?? "").trim();
  const studentIdsJson = String(formData.get("studentIds") ?? "[]");

  if (!classroomId) return;

  let studentIds: string[];
  try {
    studentIds = JSON.parse(studentIdsJson);
  } catch {
    return;
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) return;

  try {
    // Validasi kapasitas kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { _count: { select: { students: true } } },
    });

    if (!classroom) return;

    const currentCount = classroom._count.students;
    const newCount = currentCount + studentIds.length;

    if (newCount > classroom.maxCapacity) {
      console.warn(`assignStudentsToClass warning: Exceeds capacity. Current: ${currentCount}, Adding: ${studentIds.length}, Max: ${classroom.maxCapacity}`);
      // In production you might want to return an error object and display it,
      // but here we just log it. Some schools might allow slight over-capacity.
    }

    await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { classroomId },
    });

    revalidatePath("/kelas");
    revalidatePath("/siswa");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("assignStudentsToClass failed", { classroomId, error });
  }
}

// ─── Student (Siswa) Extensions ──────────────────────────────────────────────

export async function updateStudent(formData: FormData) {
  await requireActionAccess(adminAndTu);
  const id = String(formData.get("id") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const nickName = String(formData.get("nickName") ?? "").trim();
  const nik = String(formData.get("childNik") ?? "").trim();
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const birthDate = safeDate(formData.get("birthDate"));
  const gender = String(formData.get("gender") ?? "").trim();

  if (!id || !fullName) return { success: false, message: "ID & Nama Wajib" };

  try {
    await prisma.student.update({
      where: { id },
      data: { fullName, nickName, nik, birthPlace, birthDate: birthDate || undefined, gender },
    });
    revalidatePath(`/siswa`);
    revalidatePath(`/siswa/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}

// ─── Parent (Orang Tua) ────────────────────────────────────────────────────────

export async function createParent(formData: FormData) {
  await requireActionAccess(adminAndTu);
  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const motherName = String(formData.get("motherName") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!fatherName && !motherName) return { success: false, message: "Nama Ayah atau Ibu wajib diisi" };

  try {
    await prisma.parent.create({
      data: { fatherName, motherName, whatsapp, phone, address },
    });
    revalidatePath(`/orangtua`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}

export async function updateParent(formData: FormData) {
  await requireActionAccess(adminAndTu);
  const id = String(formData.get("id") ?? "").trim();
  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const motherName = String(formData.get("motherName") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!id) return { success: false, message: "ID Wajib" };

  try {
    await prisma.parent.update({
      where: { id },
      data: { fatherName, motherName, whatsapp, phone, address },
    });
    revalidatePath(`/orangtua`);
    revalidatePath(`/orangtua/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}

export async function deleteParent(formData: FormData) {
  await requireActionAccess(adminAndTu);
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    await prisma.parent.delete({ where: { id } });
    revalidatePath(`/orangtua`);
  } catch (err) {
    console.error("deleteParent failed", err);
  }
}

