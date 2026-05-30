import { prisma } from "@/lib/prisma";
import { AttendanceStatus, InvoiceStatus } from "@prisma/client";

function mapAttendanceLabel(status: AttendanceStatus) {
  const labels: Record<AttendanceStatus, string> = {
    PRESENT: "Hadir",
    SICK: "Sakit",
    PERMIT: "Izin",
    ABSENT: "Alpa",
  };
  return labels[status];
}

function mapInvoiceLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    UNPAID: "Belum Bayar",
    PARTIAL: "Sebagian",
    PAID: "Lunas",
  };
  return labels[status];
}

export async function getDashboardStats() {
  try {
    const [
      students,
      admissions,
      invoices,
      unpaidInvoices,
      attendanceToday,
      reports,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.admission.count({ where: { status: "PENDING" } }),
      prisma.invoice.count(),
      prisma.invoice.count({
        where: { status: { in: ["UNPAID", "PARTIAL"] } },
      }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.dailyReport.count(),
    ]);

    return {
      students,
      admissions,
      invoices,
      unpaidInvoices,
      attendanceToday,
      reports,
      dbReady: true,
    };
  } catch {
    return {
      students: 0,
      admissions: 0,
      invoices: 0,
      unpaidInvoices: 0,
      attendanceToday: 0,
      reports: 0,
      dbReady: false,
    };
  }
}

export async function getAdmissions() {
  try {
    return {
      dbReady: true,
      rows: await prisma.admission.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getStudents() {
  try {
    const rows = await prisma.student.findMany({
      include: { classroom: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { dbReady: true, rows };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getAttendanceLogs() {
  try {
    const rows = await prisma.attendance.findMany({
      include: { student: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return {
      dbReady: true,
      rows: rows.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        date: item.date,
        status: mapAttendanceLabel(item.status),
        note: item.note,
      })),
    };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getFinanceSnapshot() {
  try {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        include: { student: true, payments: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      dbReady: true,
      revenue: payments._sum.amount ?? 0,
      rows: invoices.map((item) => {
        const paid = item.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        return {
          id: item.id,
          code: item.code,
          student: item.student.fullName,
          period: `${item.periodMonth}/${item.periodYear}`,
          amount: item.amount,
          dueDate: item.dueDate,
          paid,
          remaining: Math.max(item.amount - paid, 0),
          status: mapInvoiceLabel(item.status),
        };
      }),
    };
  } catch {
    return { dbReady: false, revenue: 0, rows: [] };
  }
}

export async function getReportsSnapshot() {
  try {
    const [reports, assessments] = await Promise.all([
      prisma.dailyReport.findMany({
        include: { student: true },
        orderBy: { reportDate: "desc" },
        take: 12,
      }),
      prisma.assessment.findMany({
        include: { student: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

    return {
      dbReady: true,
      reports: reports.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        date: item.reportDate,
        activities: item.activities,
      })),
      assessments: assessments.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        period: item.periodLabel,
        avg: Number(
          (
            (item.social + item.cognitive + item.motoric + item.language) /
            4
          ).toFixed(1),
        ),
      })),
    };
  } catch {
    return { dbReady: false, reports: [], assessments: [] };
  }
}

export async function getTeachers() {
  try {
    const rows = await prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { dbReady: true, rows };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getGuardians() {
  try {
    const students = await prisma.student.findMany({
      select: { guardianName: true, guardianPhone: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const map = new Map();
    students.forEach((s) => {
      const key = `${s.guardianName}||${s.guardianPhone}`;
      if (!map.has(key))
        map.set(key, { name: s.guardianName, phone: s.guardianPhone });
    });
    return { dbReady: true, rows: Array.from(map.values()) };
  } catch {
    return { dbReady: false, rows: [] };
  }
}
