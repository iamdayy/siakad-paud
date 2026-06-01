"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";
import { sendWhatsAppNotification } from "@/app/(system)/actions";

export async function getMyClasses() {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) return [];

  const classes = await prisma.classroom.findMany({
    where: {
      OR: [
        { mainTeacherId: user.teacherId },
        { coTeacherId: user.teacherId },
      ],
    },
    include: {
      _count: {
        select: { students: true },
      },
    },
  });

  return classes;
}

export async function getClassDetails(classroomId: string, date: Date) {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) throw new Error("Unauthorized");

  // Validate teacher owns this class
  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classroomId,
      OR: [
        { mainTeacherId: user.teacherId },
        { coTeacherId: user.teacherId },
      ],
    },
    include: {
      mainTeacher: true,
      coTeacher: true,
    },
  });

  if (!classroom) throw new Error("Classroom not found or access denied");

  const isMainTeacher = classroom.mainTeacherId === user.teacherId;
  const isCoTeacher = classroom.coTeacherId === user.teacherId;

  // Get students with attendance and reports for the specific date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const students = await prisma.student.findMany({
    where: { classroomId },
    include: {
      attendances: {
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      reports: {
        where: {
          reportDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    },
    orderBy: { fullName: 'asc' }
  });

  return { classroom, students, role: { isMainTeacher, isCoTeacher } };
}

export async function upsertAttendance(studentId: string, date: Date, status: AttendanceStatus, note?: string) {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) throw new Error("Unauthorized");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await prisma.attendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date: startOfDay,
      }
    },
    update: { status, note },
    create: {
      studentId,
      date: startOfDay,
      status,
      note
    }
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
        `Assalamualaikum wr. wb. / Selamat Pagi,\n\nYth. Bapak/Ibu Orang Tua/Wali,\n\nSebagai bagian dari komitmen kami terhadap keamanan dan kenyamanan Ananda, kami menginformasikan bahwa Ananda *${student.nickName || student.fullName}* telah tiba di sekolah dengan selamat pada hari ini, ${date.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n\nSemoga Ananda dapat mengikuti kegiatan belajar dan bermain hari ini dengan penuh kegembiraan.\n\nWassalamualaikum wr. wb. / Salam hangat,\n*Sistem Informasi Presensi - PAUD Ceria Bintang*`,
      );
    }
  }

  revalidatePath(`/guru/kelas`);
}

export async function upsertDailyReport(
  studentId: string,
  date: Date,
  data: { meals?: string; napDuration?: string; mood?: string; activities: string; note?: string }
) {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) throw new Error("Unauthorized");

  // Check if CoTeacher is trying to overwrite note. We can validate this if needed, 
  // but we will also restrict it in the UI. For strict security, we'd check classroom ownership here.
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { classroom: true, parent: true }
  });

  if (!student || !student.classroom) throw new Error("Student or classroom not found");

  const isCoTeacher = student.classroom.coTeacherId === user.teacherId;

  // Strict rule: if CoTeacher, do not update `note`
  const updateData = { ...data };
  if (isCoTeacher && updateData.note !== undefined) {
    delete updateData.note; // Strip out note if co-teacher
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await prisma.dailyReport.upsert({
    where: {
      studentId_reportDate: {
        studentId,
        reportDate: startOfDay,
      }
    },
    update: updateData,
    create: {
      studentId,
      reportDate: startOfDay,
      meals: updateData.meals,
      napDuration: updateData.napDuration,
      mood: updateData.mood,
      activities: updateData.activities,
      note: updateData.note,
    }
  });

  // Notify parent about daily report
  // const student = await prisma.student.findUnique({
  //   where: { id: studentId },
  //   include: { parent: true },
  // });
  if (student?.parent?.whatsapp) {
    await sendWhatsAppNotification(
      student.parent.whatsapp,
      `*LAPORAN HARIAN SISWA (DAILY REPORT)*\n\nYth. Bapak/Ibu Orang Tua,\n\nBerikut adalah ringkasan aktivitas Ananda *${student.nickName || student.fullName}* hari ini:\n\n📅 Aktivitas: ${updateData.activities}\n😊 Mood/Suasana Hati: ${updateData.mood || "-"}\n🍱 Porsi Makan: ${updateData.meals || "-"}\n💤 Durasi Tidur Siang: ${updateData.napDuration || "-"}\n\nUntuk melihat detail catatan dari guru pendamping, silakan akses fitur Buku Penghubung di Portal Orang Tua.\n\nTerima kasih,\nWali Kelas Ananda`,
    );
  }

  revalidatePath(`/guru/kelas`);
}

export async function saveBulkData(
  classroomId: string,
  date: Date,
  data: Array<{
    studentId: string;
    status: AttendanceStatus;
    note?: string;
    activities?: string;
    meals?: string;
    mood?: string;
  }>
) {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) throw new Error("Unauthorized");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // We should do a transaction
  await prisma.$transaction(
    data.map((item) => {
      const attendance = prisma.attendance.upsert({
        where: { studentId_date: { studentId: item.studentId, date: startOfDay } },
        update: { status: item.status, note: item.note },
        create: { studentId: item.studentId, date: startOfDay, status: item.status, note: item.note },
      });

      const report = prisma.dailyReport.upsert({
        where: { studentId_reportDate: { studentId: item.studentId, reportDate: startOfDay } },
        update: { activities: item.activities || "-", meals: item.meals, mood: item.mood },
        create: {
          studentId: item.studentId,
          reportDate: startOfDay,
          activities: item.activities || "-",
          meals: item.meals,
          mood: item.mood
        },
      });

      return [attendance, report];
    }).flat()
  );

  // Notify parents about attendance and daily report
  data.forEach(async (item) => {
    const student = await prisma.student.findUnique({
      where: { id: item.studentId },
      include: { parent: true },
    });
    if (student?.parent?.whatsapp) {
      await sendWhatsAppNotification(
        student.parent.whatsapp,
        `*LAPORAN HARIAN SISWA (DAILY REPORT)*\n\nYth. Bapak/Ibu Orang Tua,\n\nBerikut adalah ringkasan aktivitas Ananda *${student.nickName || student.fullName}* hari ini:\n\n📅 Aktivitas: ${item.activities}\n😊 Mood/Suasana Hati: ${item.mood || "-"}\n🍱 Porsi Makan: ${item.meals || "-"}n\nUntuk melihat detail catatan dari guru pendamping, silakan akses fitur Buku Penghubung di Portal Orang Tua.\n\nTerima kasih,\nWali Kelas Ananda`,
      );
    }
  });

  revalidatePath(`/guru/kelas/${classroomId}`);
}

export async function upsertAssessment(studentId: string, data: any) {
  const user = await getCurrentUser();
  if (!user || !user.teacherId) throw new Error("Unauthorized");

  const { periodLabel, isPublished, ...indicators } = data;

  await prisma.assessment.upsert({
    where: {
      studentId_periodLabel: { studentId, periodLabel },
    },
    create: {
      studentId,
      periodLabel,
      isPublished: Boolean(isPublished),
      ...indicators
    },
    update: {
      isPublished: Boolean(isPublished),
      ...indicators
    }
  });

  revalidatePath(`/guru/kelas`);
}
