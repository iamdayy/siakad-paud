import { getCurrentUser } from "@/lib/auth";
import { getParentDashboard, getStudentAssessments } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Baby, Calendar, FileText, Wallet, GraduationCap } from "lucide-react";
import { RaportViewer } from "@/components/raport/RaportViewer";
import { PayButton } from "./pay-button";

export const dynamic = "force-dynamic";

function toCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ParentPortalPage() {
  const user = await getCurrentUser();
  if (!user?.parentId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Akun Anda belum terhubung dengan data orang tua/wali murid.
      </div>
    );
  }

  const { students, dbReady } = await getParentDashboard(user.parentId);

  if (!dbReady) {
    return (
      <div className="p-6 text-center text-destructive">
        Koneksi database bermasalah.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada anak yang terdaftar pada akun Anda.
          </CardContent>
        </Card>
      ) : (
        students.map((student) => (
          <div key={student.id} className="space-y-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary">
              <Baby className="h-6 w-6" />
              {student.fullName}
              <span className="text-base font-normal text-muted-foreground">
                ({student.classroom})
              </span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="h-4 w-4" /> Tagihan Belum Lunas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {student.invoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between border-b pb-2 text-sm last:border-0">
                          <div>
                            <p className="font-medium">{inv.category} - {inv.period}</p>
                            <p className="text-xs text-muted-foreground">Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                            <div>
                              <p className="font-semibold text-red-600">{toCurrency(inv.remaining)}</p>
                              <p className="text-[10px] text-muted-foreground">Sisa dari {toCurrency(inv.amount)}</p>
                            </div>
                            <PayButton invoiceId={inv.id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Semua tagihan sudah lunas.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" /> Kehadiran Terakhir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.attendances.length > 0 ? (
                    <div className="space-y-2">
                      {student.attendances.map((att) => (
                        <div key={att.id} className="flex justify-between text-sm">
                          <span>{new Date(att.date).toLocaleDateString('id-ID')}</span>
                          <Badge variant={att.status === "PRESENT" ? "default" : "secondary"}>{att.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada rekam kehadiran.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" /> Buku Penghubung / Laporan Harian
                </CardTitle>
                <CardDescription>Catatan guru tentang aktivitas harian anak.</CardDescription>
              </CardHeader>
              <CardContent>
                {student.dailyReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Porsi Makan</TableHead>
                          <TableHead>Durasi Tidur</TableHead>
                          <TableHead>Mood</TableHead>
                          <TableHead>Aktivitas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.dailyReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="whitespace-nowrap font-medium">
                              {new Date(report.reportDate).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{report.meals || "-"}</TableCell>
                            <TableCell>{report.napDuration || "-"}</TableCell>
                            <TableCell className="text-xl">{report.mood || "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{report.activities || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada laporan harian.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4" /> Laporan E-Raport (Semester)
                </CardTitle>
                <CardDescription>Catatan perkembangan kualitatif anak di akhir periode.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <RaportList studentId={student.id} studentName={student.fullName} />
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

async function RaportList({ studentId, studentName }: { studentId: string, studentName: string }) {
  const { assessments } = await getStudentAssessments(studentId);
  
  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada raport yang diterbitkan untuk periode ini.</p>;
  }

  return (
    <div className="space-y-2">
      {assessments.map(assessment => (
        <div key={assessment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
          <span className="font-medium text-sm">{assessment.periodLabel}</span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> Lihat Raport
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <RaportViewer assessment={assessment} studentName={studentName} />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" asChild>
              <a href={`/raport/${assessment.id}/print`} target="_blank">
                Cetak
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
