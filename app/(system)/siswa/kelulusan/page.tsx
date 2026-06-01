import { requirePageAccess } from "@/lib/auth";
import { getStudents } from "@/lib/data";
import { KelulusanClient } from "./KelulusanClient";
import { prisma } from "@/lib/prisma";

export default async function KelulusanPage() {
  await requirePageAccess("/siswa", ["ADMIN", "KEPALA_SEKOLAH", "TU"]);

  // We only fetch ACTIVE students for graduation/mutation processing
  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: {
      classroom: {
        select: { id: true, name: true, level: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const classrooms = await prisma.classroom.findMany({
    orderBy: [{ level: "asc" }, { name: "asc" }],
    select: { id: true, name: true, level: true },
  });

  return <KelulusanClient students={students} classrooms={classrooms} />;
}
