import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { getStudentsForRaport } from "@/lib/data";
import { FileEdit, GraduationCap } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const PERIODS = [
  "Semester 1 2025/2026",
  "Semester 2 2025/2026",
  "Semester 1 2026/2027",
  "Semester 2 2026/2027",
];

export default async function TeacherRaportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  const { period } = await searchParams;
  const activePeriod = period || PERIODS[0];

  const { students } = await getStudentsForRaport(
    user?.role === "GURU" ? user.teacherId! : undefined
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <GraduationCap className="h-6 w-6 text-primary" />
              Penilaian E-Raport (Asesmen Kualitatif)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola dan susun raport narasi akhir semester untuk siswa-siswi Anda.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Daftar Siswa Didik</CardTitle>
            <CardDescription>
              Pilih siswa untuk memasukkan nilai raport pada periode ini.
            </CardDescription>
          </div>
          <form method="GET" action="/guru/raport" className="flex items-center gap-2">
            <select
              name="period"
              defaultValue={activePeriod}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {PERIODS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button type="submit" className={buttonVariants({ variant: "secondary", size: "sm" })}>Pilih</button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status Asesmen</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const currentAssessment = student.assessments.find(a => a.periodLabel === activePeriod);
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div>
                          {student.fullName}
                          <div className="text-xs text-muted-foreground">
                            {student.nickName ? `Panggilan: ${student.nickName}` : "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.classroom?.name || "Belum masuk kelas"}</TableCell>
                      <TableCell>
                        {currentAssessment ? (
                          currentAssessment.isPublished ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Telah Dipublikasi
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Draft
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Belum Diisi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/guru/raport/${student.id}?period=${encodeURIComponent(activePeriod)}`}
                          className={buttonVariants({ size: "sm", className: "gap-2" })}
                        >
                          <FileEdit className="h-4 w-4" />
                          {currentAssessment ? "Edit Raport" : "Isi Raport"}
                        </Link>
                        {currentAssessment?.isPublished && (
                          <Link 
                            href={`/raport/${currentAssessment.id}/print`}
                            target="_blank"
                            className={buttonVariants({ size: "sm", variant: "outline", className: "ml-2 gap-2" })}
                          >
                            Cetak
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Tidak ada anak didik yang terhubung dengan kelas Anda saat ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
