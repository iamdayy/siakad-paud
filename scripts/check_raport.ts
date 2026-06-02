import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkRaportData() {
  const user = await prisma.user.findFirst({
    where: { username: "guru" },
    include: { teacher: true }
  });
  console.log("Teacher User:", user);

  if (user && user.teacherId) {
    const classrooms = await prisma.classroom.findMany({
      where: {
        OR: [
          { mainTeacherId: user.teacherId },
          { coTeacherId: user.teacherId }
        ]
      }
    });
    console.log("Classrooms for teacher:", classrooms);

    if (classrooms.length > 0) {
      const classroomIds = classrooms.map(c => c.id);
      const students = await prisma.student.findMany({
        where: { classroomId: { in: classroomIds } }
      });
      console.log("Students in these classrooms:", students.map(s => ({
        id: s.id,
        name: s.fullName,
        status: s.status
      })));
      
      const activeStudents = students.filter(s => s.status === 'ACTIVE');
      console.log("ACTIVE Students in these classrooms:", activeStudents.length);
    }
  }
}

checkRaportData().finally(() => prisma.$disconnect());
