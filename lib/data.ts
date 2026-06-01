import { prisma } from "@/lib/prisma";
import { AttendanceStatus, InvoiceStatus, AssessmentIndicator } from "@prisma/client";

function mapAttendanceLabel(status: AttendanceStatus) {
  const labels: Record<AttendanceStatus, string> = {
    PRESENT: "Hadir",
    SICK: "Sakit",
    PERMITTED: "Izin",
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

function mapAssessmentLabel(indicator: AssessmentIndicator | null) {
  if (!indicator) return "-";
  const labels: Record<AssessmentIndicator, string> = {
    BB: "Belum Berkembang",
    MB: "Mulai Berkembang",
    BSH: "Berkembang Sesuai Harapan",
    BSB: "Berkembang Sangat Baik",
  };
  return labels[indicator];
}

export async function getDashboardStats() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      totalStudents,
      activeStudents,
      pendingAdmissions,
      totalInvoices,
      unpaidInvoices,
      attendanceToday,
      absentToday,
      reports,
      monthlyPaidInvoices,
      monthlyRevenue,
      totalTeachers,
      totalClasses,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.admission.count({ where: { status: "PENDING" } }),
      prisma.invoice.count(),
      prisma.invoice.count({
        where: { status: { in: ["UNPAID", "PARTIAL"] } },
      }),
      prisma.attendance.count({
        where: { date: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.attendance.count({
        where: {
          date: { gte: todayStart, lt: todayEnd },
          status: { in: ["SICK", "PERMITTED", "ABSENT"] },
        },
      }),
      prisma.dailyReport.count(),
      prisma.invoice.count({
        where: {
          status: "PAID",
          periodMonth: currentMonth,
          periodYear: currentYear,
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paidAt: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
      prisma.teacher.count(),
      prisma.classroom.count(),
    ]);

    return {
      totalStudents,
      activeStudents,
      pendingAdmissions,
      totalInvoices,
      unpaidInvoices,
      attendanceToday,
      absentToday,
      reports,
      monthlyPaidInvoices,
      monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
      totalTeachers,
      totalClasses,
      dbReady: true,
    };
  } catch {
    return {
      totalStudents: 0,
      activeStudents: 0,
      pendingAdmissions: 0,
      totalInvoices: 0,
      unpaidInvoices: 0,
      attendanceToday: 0,
      absentToday: 0,
      reports: 0,
      monthlyPaidInvoices: 0,
      monthlyRevenue: 0,
      totalTeachers: 0,
      totalClasses: 0,
      dbReady: false,
    };
  }
}

export async function getAdmissions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  try {
    const { page = 1, limit = 10, search, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { childName: { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [total, rows] = await Promise.all([
      prisma.admission.count({ where }),
      prisma.admission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    return { dbReady: true, rows, total, totalPages: Math.ceil(total / limit) };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getStudents(params?: {
  teacherId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  try {
    const { teacherId, page = 1, limit = 10, search, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(teacherId && {
        classroom: {
          OR: [
            { mainTeacherId: teacherId },
            { coTeacherId: teacherId },
          ]
        }
      }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { nis: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [total, rows] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { classroom: true, parent: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    return { dbReady: true, rows, total, totalPages: Math.ceil(total / limit) };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getAttendanceLogs(params?: {
  teacherId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { teacherId, page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(teacherId && {
        student: {
          classroom: {
            OR: [
              { mainTeacherId: teacherId },
              { coTeacherId: teacherId },
            ]
          }
        }
      }),
      ...(search && {
        student: {
          fullName: { contains: search, mode: 'insensitive' }
        }
      })
    };

    const [total, rows] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        include: { student: true },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      })
    ]);

    return {
      dbReady: true,
      rows: rows.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        date: item.date,
        status: mapAttendanceLabel(item.status),
        rawStatus: item.status,
        note: item.note,
      })),
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getFinanceSnapshot(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  try {
    const { page = 1, limit = 10, search, status } = params || {};
    const skip = (page - 1) * limit;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const where: any = {
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { student: { fullName: { contains: search, mode: 'insensitive' } } },
        ]
      })
    };

    const [totalInvoices, invoices, payments, expenses, monthlyExpenses] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: { student: true, payments: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
    ]);

    return {
      dbReady: true,
      revenue: payments._sum.amount ?? 0,
      totalExpenses: expenses._sum.amount ?? 0,
      monthlyExpenses: monthlyExpenses._sum.amount ?? 0,
      rows: invoices.map((item) => {
        const paid = item.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        return {
          id: item.id,
          code: item.code,
          student: item.student.fullName,
          category: item.category,
          period: `${item.periodMonth}/${item.periodYear}`,
          amount: item.amount,
          fineAmount: item.fineAmount,
          dueDate: item.dueDate,
          paid,
          remaining: Math.max(item.amount + item.fineAmount - paid, 0),
          status: mapInvoiceLabel(item.status),
        };
      }),
      total: totalInvoices,
      totalPages: Math.ceil(totalInvoices / limit)
    };
  } catch {
    return { dbReady: false, revenue: 0, totalExpenses: 0, monthlyExpenses: 0, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getExpenses(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [total, rows] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      })
    ]);
    return { dbReady: true, rows, total, totalPages: Math.ceil(total / limit) };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getDailyReports(params?: {
  teacherId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { teacherId, page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(teacherId && {
        student: {
          classroom: {
            OR: [
              { mainTeacherId: teacherId },
              { coTeacherId: teacherId },
            ]
          }
        }
      }),
      ...(search && {
        student: { fullName: { contains: search, mode: 'insensitive' } }
      })
    };

    const [total, reports] = await Promise.all([
      prisma.dailyReport.count({ where }),
      prisma.dailyReport.findMany({
        where,
        include: { student: true },
        orderBy: { reportDate: "desc" },
        skip,
        take: limit,
      })
    ]);

    return {
      dbReady: true,
      reports: reports.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        date: item.reportDate,
        meals: item.meals,
        napDuration: item.napDuration,
        mood: item.mood,
        activities: item.activities,
      })),
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch {
    return { dbReady: false, reports: [], total: 0, totalPages: 0 };
  }
}

export async function getAssessments(params?: {
  teacherId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { teacherId, page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(teacherId && {
        student: {
          classroom: {
            OR: [
              { mainTeacherId: teacherId },
              { coTeacherId: teacherId },
            ]
          }
        }
      }),
      ...(search && {
        student: { fullName: { contains: search, mode: 'insensitive' } }
      })
    };

    const [total, assessments] = await Promise.all([
      prisma.assessment.count({ where }),
      prisma.assessment.findMany({
        where,
        include: { student: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    return {
      dbReady: true,
      assessments: assessments.map((item) => ({
        id: item.id,
        studentName: item.student.fullName,
        period: item.periodLabel,
        agamaMoral: mapAssessmentLabel(item.agamaMoral),
        fisikMotorik: mapAssessmentLabel(item.fisikMotorik),
        kognitif: mapAssessmentLabel(item.kognitif),
        bahasa: mapAssessmentLabel(item.bahasa),
        sosialEmosional: mapAssessmentLabel(item.sosialEmosional),
        seni: mapAssessmentLabel(item.seni),
        narrative: item.narrative,
        isPublished: item.isPublished,
      })),
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch {
    return { dbReady: false, assessments: [], total: 0, totalPages: 0 };
  }
}

export async function getTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [total, rows] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        include: {
          mainClassrooms: true,
          coClassrooms: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);
    return { dbReady: true, rows, total, totalPages: Math.ceil(total / limit) };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getParents(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = search ? {
      OR: [
        { fatherName: { contains: search, mode: 'insensitive' } },
        { motherName: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [total, parents] = await Promise.all([
      prisma.parent.count({ where }),
      prisma.parent.findMany({
        where,
        include: {
          students: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);
    return { 
      dbReady: true, 
      rows: parents.map((p: any) => ({
        id: p.id,
        fatherName: p.fatherName,
        motherName: p.motherName,
        whatsapp: p.whatsapp,
        phone: p.phone,
        address: p.address,
        children: p.students.map((s: any) => s.fullName),
      })),
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getClassrooms(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = search ? {
      name: { contains: search, mode: 'insensitive' }
    } : {};

    const [total, rows] = await Promise.all([
      prisma.classroom.count({ where }),
      prisma.classroom.findMany({
        where,
        include: {
          mainTeacher: true,
          coTeacher: true,
          _count: { select: { students: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);
    return { dbReady: true, rows, total, totalPages: Math.ceil(total / limit) };
  } catch {
    return { dbReady: false, rows: [], total: 0, totalPages: 0 };
  }
}

export async function getPendingAdmissionsForDashboard() {
  try {
    const rows = await prisma.admission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return { dbReady: true, rows };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getArrearsStudents() {
  try {
    const rows = await prisma.invoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      include: {
        student: { select: { fullName: true, nickName: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    return {
      dbReady: true,
      rows: rows.map((inv) => {
        const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
        return {
          id: inv.id,
          code: inv.code,
          studentName: inv.student.fullName,
          nickName: inv.student.nickName,
          category: inv.category,
          period: `${inv.periodMonth}/${inv.periodYear}`,
          amount: inv.amount + inv.fineAmount,
          paid,
          remaining: Math.max(inv.amount + inv.fineAmount - paid, 0),
          dueDate: inv.dueDate,
        };
      }),
    };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

export async function getLessonPlans() {
  try {
    const rows = await prisma.lessonPlan.findMany({
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { dbReady: true, rows };
  } catch {
    return { dbReady: false, rows: [] };
  }
}

// Single Entity Fetches for Profile Pages
export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        classroom: true,
        attendances: { orderBy: { date: 'desc' }, take: 10 },
        assessments: { orderBy: { createdAt: 'desc' }, take: 5 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
      }
    });
    return student;
  } catch (err) {
    console.error("Failed to fetch student", err);
    return null;
  }
}

export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        mainClassrooms: true,
        coClassrooms: true,
        lessonPlans: { orderBy: { createdAt: 'desc' }, take: 5 },
      }
    });
    return teacher;
  } catch (err) {
    console.error("Failed to fetch teacher", err);
    return null;
  }
}

export async function getParentById(id: string) {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        students: { include: { classroom: true } },
      }
    });
    return parent;
  } catch (err) {
    console.error("Failed to fetch parent", err);
    return null;
  }
}


export async function getParentDashboard(parentId: string) {
  try {
    const students = await prisma.student.findMany({
      where: { parentId },
      include: {
        classroom: true,
        invoices: {
          where: { status: { in: ["UNPAID", "PARTIAL"] } },
          include: { payments: true }
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 5
        },
        reports: {
          orderBy: { reportDate: "desc" },
          take: 5
        }
      }
    });

    return {
      dbReady: true,
      students: students.map(s => ({
        id: s.id,
        fullName: s.fullName,
        nickName: s.nickName,
        classroom: s.classroom?.name || "Belum ada kelas",
        invoices: s.invoices.map((inv: any) => {
          const paid = inv.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
          return {
            id: inv.id,
            code: inv.code,
            category: inv.category,
            period: `${inv.periodMonth}/${inv.periodYear}`,
            amount: inv.amount + inv.fineAmount,
            paid,
            remaining: Math.max(inv.amount + inv.fineAmount - paid, 0),
            dueDate: inv.dueDate,
          }
        }),
        attendances: s.attendances,
        dailyReports: s.reports,
      }))
    };
  } catch (error) {
    return { dbReady: false, students: [] };
  }
}

export async function getTeacherAttendances() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await prisma.teacherAttendance.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: { teacher: true },
      orderBy: { checkIn: "desc" }
    });

    return { dbReady: true, rows };
  } catch (error) {
    return { dbReady: false, rows: [] };
  }
}

export async function getStudentsForRaport(teacherId?: string) {
  try {
    const whereClause: any = { status: "ACTIVE" };
    if (teacherId) {
      // Find classrooms where teacher is main or co-teacher
      const classrooms = await prisma.classroom.findMany({
        where: {
          OR: [
            { mainTeacherId: teacherId },
            { coTeacherId: teacherId }
          ]
        },
        select: { id: true }
      });
      const classroomIds = classrooms.map(c => c.id);
      if (classroomIds.length > 0) {
        whereClause.classroomId = { in: classroomIds };
      } else {
        // Teacher has no classrooms, return empty
        return { dbReady: true, students: [] };
      }
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        classroom: true,
        assessments: true, // to know how many assessments they have
      },
      orderBy: { fullName: "asc" }
    });

    return { dbReady: true, students };
  } catch (error) {
    return { dbReady: false, students: [] };
  }
}

export async function getStudentAssessments(studentId: string) {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { 
        studentId,
        isPublished: true
      },
      orderBy: { createdAt: "desc" }
    });
    return { dbReady: true, assessments };
  } catch (error) {
    return { dbReady: false, assessments: [] };
  }
}

export async function getGuruDashboardStats(teacherId: string) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Get classes
    const classes = await prisma.classroom.findMany({
      where: {
        OR: [
          { mainTeacherId: teacherId },
          { coTeacherId: teacherId },
        ],
      },
      include: {
        schedules: {
          where: { dayOfWeek: new Date().getDay() || 7 },
          orderBy: { startTime: "asc" }
        },
        students: {
          select: {
            id: true,
            attendances: {
              where: {
                date: {
                  gte: todayStart,
                  lte: todayEnd,
                }
              }
            },
            reports: {
              where: {
                reportDate: {
                  gte: todayStart,
                  lte: todayEnd,
                }
              }
            }
          }
        }
      }
    });

    let totalStudents = 0;
    let presentToday = 0;
    let absentToday = 0; // Sick, Permitted, Absent
    let unrecordedAttendance = 0;
    let filledReports = 0;
    
    classes.forEach(cls => {
      totalStudents += cls.students.length;
      
      cls.students.forEach(std => {
        const att = std.attendances[0];
        if (!att) {
          unrecordedAttendance++;
        } else if (att.status === "PRESENT") {
          presentToday++;
        } else {
          absentToday++;
        }

        const rep = std.reports[0];
        if (rep) filledReports++;
      });
    });

    const pendingReports = totalStudents - filledReports;

    return {
      classesCount: classes.length,
      totalStudents,
      presentToday,
      absentToday,
      unrecordedAttendance,
      filledReports,
      pendingReports,
      todaySchedules: classes.flatMap(c => c.schedules).sort((a, b) => a.startTime.localeCompare(b.startTime))
    };
  } catch (error) {
    console.error("Failed to fetch guru stats:", error);
    return {
      classesCount: 0,
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
      unrecordedAttendance: 0,
      filledReports: 0,
      pendingReports: 0,
      todaySchedules: [],
    };
  }
}
