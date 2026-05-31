import { RaportForm } from "@/components/raport/RaportForm";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export const dynamic = "force-dynamic";

export default async function TeacherRaportPage() {
  const user = await getCurrentUser();
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
        <CardHeader>
          <CardTitle>Daftar Siswa Didik</CardTitle>
          <CardDescription>
            Pilih siswa untuk memasukkan nilai raport pada periode ini.
          </CardDescription>
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
                {students.map((student) => (
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
                      {student.assessments.length > 0 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          {student.assessments.length} Raport Tersimpan
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Belum dinilai</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger className={buttonVariants({ size: "sm", className: "gap-2" })}>
                          <FileEdit className="h-4 w-4" />
                          Isi Raport
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Formulir E-Raport PAUD</DialogTitle>
                            <DialogDescription>
                              Mengisi nilai dan narasi perkembangan kualitatif untuk <strong>{student.fullName}</strong>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="mt-4">
                            <RaportForm 
                              studentId={student.id} 
                              studentName={student.fullName}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
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
