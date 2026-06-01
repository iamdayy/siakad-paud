import { PrismaClient, Role, StudentStatus, AttendanceStatus, InvoiceCategory, InvoiceStatus, PaymentMethod, ExpenseCategory, TeacherPosition, AssessmentIndicator, RegistrationStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker/locale/id_ID";

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama (resetting database)...");
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.systemSetting.deleteMany();

  await prisma.student.updateMany({ data: { classroomId: null } });
  await prisma.classroom.deleteMany();

  await prisma.admission.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();

  console.log("Mulai men-seed data baru dengan skala besar (100 Siswa)...");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Data Admin & Kepala Sekolah
  console.log("Membuat Admin & Kepala Sekolah...");
  await prisma.user.create({
    data: {
      username: "admin",
      displayName: "Admin Sistem",
      role: Role.ADMIN,
      passwordHash: defaultPassword,
    }
  });

  const teacherKepsek = await prisma.teacher.create({
    data: {
      name: "Ibu Ratna, M.Pd",
      nik: faker.string.numeric(16),
      email: "kepsek@siakadpaud.com",
      position: TeacherPosition.KEPALA_SEKOLAH,
      phone: faker.phone.number(),
      user: {
        create: {
          username: "kepsek",
          displayName: "Ibu Ratna, M.Pd",
          role: Role.KEPALA_SEKOLAH,
          passwordHash: defaultPassword,
        }
      }
    }
  });

  // 2. Data Guru & Kelas
  console.log("Membuat 8 Guru & 8 Kelas...");
  const levels = ["Daycare", "KB", "KB", "TK A", "TK A", "TK A", "TK B", "TK B"];
  const classrooms = [];

  for (let i = 0; i < 8; i++) {
    const level = levels[i];
    const maxCapacity = level === "Daycare" ? 10 : 15;

    const teacher = await prisma.teacher.create({
      data: {
        name: `Bunda ${faker.person.firstName("female")}`,
        nik: faker.string.numeric(16),
        email: `guru${i + 1}@siakadpaud.com`,
        position: TeacherPosition.GURU_KELAS,
        phone: faker.phone.number(),
        user: {
          create: {
            username: `guru${i + 1}`,
            displayName: `Bunda Guru ${i + 1}`,
            role: Role.GURU,
            passwordHash: defaultPassword,
          }
        }
      }
    });

    const room = await prisma.classroom.create({
      data: {
        name: `${level} - ${faker.color.human()}`,
        level: level,
        schoolYear: "2025/2026",
        maxCapacity: maxCapacity,
        mainTeacherId: teacher.id,
      }
    });

    classrooms.push({ ...room, currentStudents: 0 });
  }

  // 3. Data Orang Tua (85 Orang Tua untuk 100 Siswa)
  console.log("Membuat 85 Orang Tua (dengan probabilitas anak ganda/kembar)...");
  const parents = [];
  for (let i = 0; i < 85; i++) {
    const isTwin = i < 5; // 5 pasang kembar
    const isSibling = i >= 5 && i < 15; // 10 orang tua dengan 2 anak beda usia
    const childCount = (isTwin || isSibling) ? 2 : 1;

    const parent = await prisma.parent.create({
      data: {
        fatherName: faker.person.fullName({ sex: 'male' }),
        motherName: faker.person.fullName({ sex: 'female' }),
        fatherJob: faker.person.jobTitle(),
        motherJob: faker.person.jobTitle(),
        whatsapp: faker.phone.number(),
        address: faker.location.streetAddress(),
        user: {
          create: {
            username: `ortu${i + 1}`,
            displayName: `Kel. Ortu ${i + 1}`,
            role: Role.ORANG_TUA,
            passwordHash: defaultPassword,
          }
        }
      }
    });

    parents.push({ id: parent.id, childCount, isTwin, isSibling });
  }

  // 4. Data Siswa
  console.log("Membuat 100 Siswa dan memasukkannya ke kelas...");
  let studentCounter = 1;
  const createdStudents = [];

  for (const parent of parents) {
    let twinBirthDate = faker.date.birthdate({ min: 3, max: 6, mode: 'age' });

    for (let c = 0; c < parent.childCount; c++) {
      const birthDate = parent.isTwin
        ? twinBirthDate
        : faker.date.birthdate({ min: 2, max: 6, mode: 'age' });

      const gender = faker.person.sex() as "male" | "female";
      const fullName = faker.person.fullName({ sex: gender, lastName: " " });
      const nickName = fullName.split(" ")[0];

      // Assign to class based on capacity
      let assignedClassroom = null;
      const availableRooms = classrooms.filter(r => r.currentStudents < r.maxCapacity);
      if (availableRooms.length > 0) {
        const randomRoomIndex = Math.floor(Math.random() * availableRooms.length);
        assignedClassroom = availableRooms[randomRoomIndex];
        classrooms[classrooms.indexOf(assignedClassroom)].currentStudents += 1;
      }

      const student = await prisma.student.create({
        data: {
          nis: `25${studentCounter.toString().padStart(4, '0')}`,
          fullName: fullName,
          nickName: nickName,
          birthPlace: faker.location.city(),
          birthDate: birthDate,
          gender: gender === "male" ? "Laki-laki" : "Perempuan",
          parentId: parent.id,
          classroomId: assignedClassroom?.id || null,
          status: StudentStatus.ACTIVE,
          siblingCount: parent.childCount > 1 ? 1 : 0,
        }
      });
      createdStudents.push(student);
      studentCounter++;
    }
  }

  // 5. Data Presensi, SPP, dan Daily Report
  console.log("Membuat data Presensi, Tagihan SPP, & Buku Penghubung masal...");
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  const attendancesData = [];
  const reportsData = [];

  for (const student of createdStudents) {
    // 90% Hadir, 5% Izin, 5% Sakit
    const rand = Math.random();
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    if (rand > 0.95) status = AttendanceStatus.SICK;
    else if (rand > 0.9) status = AttendanceStatus.PERMITTED;

    attendancesData.push({
      studentId: student.id,
      date: today,
      status: status,
      note: status !== AttendanceStatus.PRESENT ? "Info dari WA Orang Tua" : null,
    });

    if (status === AttendanceStatus.PRESENT) {
      reportsData.push({
        studentId: student.id,
        reportDate: today,
        meals: faker.helpers.arrayElement(["Makan 1 porsi habis", "Makan setengah porsi", "Hanya makan lauk"]),
        napDuration: faker.helpers.arrayElement(["1 Jam", "45 Menit", "1.5 Jam"]),
        mood: faker.helpers.arrayElement(["Sangat Ceria", "Cukup Ceria", "Sedikit Rewel pagi hari, lalu ceria"]),
        activities: faker.helpers.arrayElement(["Mewarnai", "Senam pagi, Bermain puzzle", "Menyusun balok, Bernyanyi"]),
        note: "Anak beraktivitas dengan baik hari ini.",
      });
    }
  }

  await prisma.attendance.createMany({ data: attendancesData });
  await prisma.dailyReport.createMany({ data: reportsData });

  // 6. Data Keuangan (Tagihan SPP 100 Siswa)
  console.log("Membuat tagihan SPP untuk semua siswa...");
  const invoicesData = [];
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const isPaid = Math.random() > 0.3; // 70% sudah lunas, 30% nunggak
    const amount = 350000;

    invoicesData.push({
      code: `INV-SPP-2505-${(i + 1).toString().padStart(4, '0')}`,
      studentId: student.id,
      category: InvoiceCategory.SPP,
      periodMonth: today.getMonth() + 1,
      periodYear: today.getFullYear(),
      amount: amount,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 10),
      status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
      fineAmount: isPaid ? 0 : 50000,
    });
  }

  await prisma.invoice.createMany({ data: invoicesData });

  // Update payments for paid invoices
  const paidInvoices = await prisma.invoice.findMany({ where: { status: InvoiceStatus.PAID } });
  const paymentsData = paidInvoices.map(inv => ({
    invoiceId: inv.id,
    amount: inv.amount,
    method: PaymentMethod.TRANSFER,
    paidAt: new Date(today.getFullYear(), today.getMonth(), faker.number.int({ min: 1, max: 10 })),
  }));
  await prisma.payment.createMany({ data: paymentsData });

  // 7. Data Pendaftaran (Admission)
  console.log("Membuat Data Pendaftaran...");
  await prisma.admission.create({
    data: {
      childName: "Budi Santoso",
      nickName: "Budi",
      gender: "Laki-laki",
      birthPlace: "Bandung",
      birthDate: new Date("2021-05-10"),
      siblingCount: 0,
      
      fatherName: "Andi Santoso",
      motherName: "Siti Rahmawati",
      parentNik: "3201010101010101",
      fatherJob: "Pegawai Swasta",
      motherJob: "Ibu Rumah Tangga",
      
      whatsapp: "081234567890",
      address: "Jl. Merdeka No. 10",
      
      status: RegistrationStatus.PENDING,
    }
  });

  // 8. Data Jadwal Kelas (ClassSchedule)
  console.log("Membuat Jadwal Kelas...");
  const schedulesData = [];
  for (const room of classrooms) {
    for (let day = 1; day <= 5; day++) { // Senin - Jumat
      schedulesData.push(
        { classroomId: room.id, dayOfWeek: day, startTime: "07:30", endTime: "08:00", activity: "Penyambutan Anak", location: "Halaman Depan" },
        { classroomId: room.id, dayOfWeek: day, startTime: "08:00", endTime: "09:00", activity: "Kegiatan Inti (RPPH)", location: "Ruang Kelas" },
        { classroomId: room.id, dayOfWeek: day, startTime: "09:00", endTime: "10:00", activity: "Makan & Istirahat", location: "Ruang Makan" }
      );
    }
  }
  await prisma.classSchedule.createMany({ data: schedulesData });

  // 8. Data Assessment
  console.log("Membuat Data Assessment...");
  const assessmentsData = [];
  for (const student of createdStudents) {
    assessmentsData.push({
      studentId: student.id,
      periodLabel: "Semester Ganjil 2025/2026",
      agamaMoral: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      fisikMotorik: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      kognitif: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      bahasa: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      sosialEmosional: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      seni: faker.helpers.arrayElement([AssessmentIndicator.MB, AssessmentIndicator.BSH, AssessmentIndicator.BSB]),
      narrative: "Anak menunjukkan perkembangan yang luar biasa, bersemangat saat belajar, dan mudah bergaul.",
      isPublished: true,
    });
  }
  await prisma.assessment.createMany({ data: assessmentsData });

  // 9. Data Pengeluaran (Expense)
  console.log("Membuat Data Pengeluaran...");
  const expensesData = [];
  for (let i = 0; i < 10; i++) {
    expensesData.push({
      code: `EXP-2505-${(i + 1).toString().padStart(4, '0')}`,
      category: faker.helpers.arrayElement([ExpenseCategory.OPERASIONAL, ExpenseCategory.GAJI, ExpenseCategory.PEMELIHARAAN, ExpenseCategory.LAINNYA]),
      amount: faker.number.int({ min: 100000, max: 2000000 }),
      date: faker.date.recent({ days: 30 }),
      description: faker.helpers.arrayElement(["Pembelian ATK", "Pembayaran Listrik", "Pembelian APE", "Konsumsi Rapat", "Perbaikan AC"]),
    });
  }
  await prisma.expense.createMany({ data: expensesData });

  // 10. Data Pengumuman (Announcement)
  console.log("Membuat Data Pengumuman...");
  await prisma.announcement.create({
    data: {
      title: "Libur Nasional Maulid Nabi",
      content: "Diberitahukan kepada seluruh orang tua siswa, pada hari Jumat sekolah akan diliburkan dalam rangka memperingati Maulid Nabi Muhammad SAW. Anak-anak masuk kembali hari Senin.",
      targetRole: "ALL",
    }
  });
  await prisma.announcement.create({
    data: {
      title: "Persiapan Rapat Guru",
      content: "Rapat evaluasi kurikulum bulan ini akan dilaksanakan esok hari jam 13:00.",
      targetRole: "TEACHER",
    }
  });

  // 11. System Setting
  console.log("Menyusun System Setting...");
  await prisma.systemSetting.create({
    data: {
      key: "SCHOOL_NAME",
      value: "PAUD & TK Bintang Kecil",
    }
  });

  // 12. Teacher Attendance & Lesson Plan
  console.log("Membuat Teacher Attendance & Lesson Plan...");
  const teacherAttendancesData = [];
  for (let i = 0; i < 8; i++) {
    const teacherId = classrooms[i].mainTeacherId;
    if (!teacherId) continue;
    teacherAttendancesData.push({
      teacherId,
      date: today,
      status: AttendanceStatus.PRESENT,
      checkIn: new Date(new Date(today).setHours(6, 30, 0, 0)),
      checkOut: new Date(new Date(today).setHours(15, 0, 0, 0)),
    });
  }
  await prisma.teacherAttendance.createMany({ data: teacherAttendancesData });

  const lessonPlansData = [];
  for (let i = 0; i < 8; i++) {
    const teacherId = classrooms[i].mainTeacherId;
    if (!teacherId) continue;
    lessonPlansData.push({
      teacherId,
      title: "RPPH Tema Lingkunganku",
      type: "RPPH",
      weekDate: today,
      content: "Kegiatan berfokus pada pengenalan anggota keluarga dan lingkungan rumah. Menggunakan metode bermain peran.",
    });
  }
  await prisma.lessonPlan.createMany({ data: lessonPlansData });

  console.log("✅ SEEDING 100 SISWA SELESAI!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
