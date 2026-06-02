import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding users...");

  const hashPassword = (password: string) => hashSync(password, 10);

  // Seed Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      displayName: "Administrator",
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
    },
  });

  // Create a parent dummy to link
  const parent = await prisma.parent.create({
    data: {
      fatherName: "Budi Santoso",
      motherName: "Siti Aminah",
      whatsapp: "081234567890",
      address: "Jl. Merdeka No. 1",
    },
  });

  // Create a student for the parent
  await prisma.student.create({
    data: {
      fullName: "Andi Santoso",
      birthDate: new Date("2019-01-01"),
      gender: "Laki-laki",
      parentId: parent.id,
      status: "ACTIVE",
    },
  });

  // Seed Parent User
  await prisma.user.upsert({
    where: { username: "ortu" },
    update: {},
    create: {
      username: "ortu",
      displayName: "Orang Tua Andi",
      role: "ORANG_TUA",
      passwordHash: hashPassword("ortu123"),
      parentId: parent.id,
    },
  });

  // Create a teacher dummy to link
  const teacher = await prisma.teacher.create({
    data: {
      name: "Ibu Guru Maya",
      phone: "089876543210",
      position: "GURU_KELAS",
    },
  });

  // Seed Teacher User
  await prisma.user.upsert({
    where: { username: "guru" },
    update: {},
    create: {
      username: "guru",
      displayName: "Guru Maya",
      role: "GURU",
      passwordHash: hashPassword("guru123"),
      teacherId: teacher.id,
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
