import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Check, Save } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AssessmentFormClient } from "./AssessmentFormClient";

export const dynamic = "force-dynamic";

export default async function RaportFormPage(
  props: {
    params: Promise<{ studentId: string }>;
    searchParams: Promise<{ period?: string }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  
  if (!user || !["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"].includes(user.role)) {
    redirect("/login");
  }

  const { studentId } = params;
  const period = searchParams.period || "Semester 1 2025/2026";

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classroom: true,
      assessments: {
        where: { periodLabel: period }
      }
    }
  });

  if (!student) {
    notFound();
  }

  const currentAssessment = student.assessments[0] || null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/guru/raport" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Isi E-Raport Siswa</h2>
          <p className="text-muted-foreground">
            {student.fullName} ({student.classroom?.name || "Belum ada kelas"}) - {period}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asesmen Kualitatif Perkembangan Anak</CardTitle>
          <CardDescription>
            Pilih tingkat perkembangan dan tuliskan narasi pendukung untuk setiap aspek.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssessmentFormClient 
            studentId={student.id} 
            periodLabel={period} 
            existingData={currentAssessment} 
          />
        </CardContent>
      </Card>
    </section>
  );
}
