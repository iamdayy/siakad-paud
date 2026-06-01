import { requirePageAccess } from "@/lib/auth";
import { getStudentById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, BookOpen, Wallet, Activity } from "lucide-react";
import { EditStudentForm } from "./edit-form";

export const dynamic = "force-dynamic";

function studentBadgeColor(status: string) {
  if (status === "ACTIVE") return "default";
  if (status === "GRADUATED") return "secondary";
  if (status === "MUTATED") return "warning";
  return "destructive";
}

export default async function SiswaProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("/siswa", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return notFound();

  return (
    <section className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between rounded-3xl border bg-gradient-to-br from-warm-blue/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{student.fullName}</h2>
            <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              <span>{student.nis ? `NIS: ${student.nis}` : "Belum ada NIS"}</span>
              <span>•</span>
              <Badge variant="outline">{student.classroom?.name || "Belum ada kelas"}</Badge>
              <Badge variant="ghost" color={studentBadgeColor(student.status)}>{student.status}</Badge>
            </div>
          </div>
        </div>

        {/* Edit Siswa Form */}
        <EditStudentForm student={student} />
      </div>

      <Tabs defaultValue="biodata" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="biodata">Biodata</TabsTrigger>
          <TabsTrigger value="presensi">Presensi</TabsTrigger>
          <TabsTrigger value="penilaian">Penilaian</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="biodata" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Nama Panggilan</span>
                <span className="font-medium">{student.nickName || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">NIK</span>
                <span className="font-medium">{student.nik || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Tempat, Tanggal Lahir</span>
                <span className="font-medium">
                  {student.birthPlace || "-"}, {student.birthDate.toLocaleDateString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Jenis Kelamin</span>
                <span className="font-medium">{student.gender === "L" ? "Laki-laki" : student.gender === "P" ? "Perempuan" : "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block mb-1">Riwayat Kesehatan (Alergi / Kebutuhan Khusus)</span>
                <span className="font-medium">{student.allergies || "-"} / {student.specialNeeds || "-"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Orang Tua</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              {student.parent ? (
                <>
                  <div>
                    <span className="text-muted-foreground block mb-1">Nama Ayah</span>
                    <span className="font-medium">{student.parent.fatherName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Nama Ibu</span>
                    <span className="font-medium">{student.parent.motherName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Nomor WhatsApp</span>
                    <span className="font-medium">{student.parent.whatsapp}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Alamat</span>
                    <span className="font-medium">{student.parent.address || "-"}</span>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 text-muted-foreground">Belum ada data wali yang dihubungkan.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presensi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Riwayat Presensi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {student.attendances.length > 0 ? (
                <ul className="space-y-3">
                  {student.attendances.map(att => (
                    <li key={att.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <span className="text-sm font-medium">{att.date.toLocaleDateString("id-ID")}</span>
                      <Badge variant="outline">{att.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada riwayat presensi.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penilaian" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Raport & Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              {student.assessments.length > 0 ? (
                <div className="space-y-4">
                  {student.assessments.map(ass => (
                    <div key={ass.id} className="rounded-lg border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{ass.periodLabel}</span>
                        <Badge variant={ass.isPublished ? "default" : "secondary"}>
                          {ass.isPublished ? "Diterbitkan" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ass.narrative}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada data penilaian (E-Raport).</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keuangan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Riwayat Tagihan SPP</CardTitle>
            </CardHeader>
            <CardContent>
              {student.invoices.length > 0 ? (
                <div className="space-y-3">
                  {student.invoices.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{inv.category} - {inv.periodMonth}/{inv.periodYear}</p>
                        <p className="text-xs text-muted-foreground">Jatuh Tempo: {inv.dueDate.toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">Rp {inv.amount.toLocaleString("id-ID")}</p>
                        <Badge variant={inv.status === "PAID" ? "default" : "destructive"}>{inv.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada tagihan terdaftar.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
