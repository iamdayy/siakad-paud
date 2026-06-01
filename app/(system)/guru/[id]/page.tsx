import { requirePageAccess } from "@/lib/auth";
import { getTeacherById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuruProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("/guru", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const { id } = await params;
  const teacher = await getTeacherById(id);
  if (!teacher) return notFound();

  return (
    <section className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between rounded-3xl border bg-gradient-to-br from-warm-green/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{teacher.name}</h2>
            <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              <Badge variant="outline">{teacher.position}</Badge>
              {teacher.nik && <span>NIK: {teacher.nik}</span>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="biodata" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
          <TabsTrigger value="biodata">Biodata Lengkap</TabsTrigger>
          <TabsTrigger value="kelas">Tugas & Kelas</TabsTrigger>
          <TabsTrigger value="rpph">RPPH</TabsTrigger>
        </TabsList>
        
        <TabsContent value="biodata" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pendidik</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Email</span>
                <span className="font-medium">{teacher.email || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Telepon/WhatsApp</span>
                <span className="font-medium">{teacher.phone || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Pendidikan Terakhir</span>
                <span className="font-medium">{teacher.lastEducation || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Tahun Bergabung</span>
                <span className="font-medium">{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString("id-ID") : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kelas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Kelas yang Diampu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Sebagai Guru Utama (Wali Kelas)</h4>
                {teacher.mainClassrooms.length > 0 ? (
                  <ul className="space-y-2">
                    {teacher.mainClassrooms.map(c => (
                      <li key={c.id} className="text-sm px-3 py-2 bg-muted/50 rounded-md border">{c.name} (Angkatan {c.schoolYear})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada kelas utama.</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Sebagai Guru Pendamping</h4>
                {teacher.coClassrooms.length > 0 ? (
                  <ul className="space-y-2">
                    {teacher.coClassrooms.map(c => (
                      <li key={c.id} className="text-sm px-3 py-2 bg-muted/50 rounded-md border">{c.name} (Angkatan {c.schoolYear})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada kelas pendamping.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rpph" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Riwayat Logbook (RPPH)</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.lessonPlans.length > 0 ? (
                <div className="space-y-3">
                  {teacher.lessonPlans.map(lp => (
                    <div key={lp.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{lp.title}</p>
                        <p className="text-xs text-muted-foreground">{lp.type}</p>
                      </div>
                      <Badge variant="outline">{new Date(lp.weekDate).toLocaleDateString("id-ID")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada riwayat rencana pembelajaran.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
