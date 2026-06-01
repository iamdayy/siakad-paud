import { requirePageAccess } from "@/lib/auth";
import { getParentById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, MapPin, KeyRound, Baby } from "lucide-react";
import { EditParentForm } from "./edit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OrangTuaProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("/orangtua", ["ADMIN", "TU", "KEPALA_SEKOLAH"]);

  const { id } = await params;
  const parent = await getParentById(id);
  if (!parent) return notFound();

  const titleName = [parent.fatherName, parent.motherName].filter(Boolean).join(" & ") || "Data Wali";

  return (
    <section className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between rounded-3xl border bg-gradient-to-br from-warm-pink/10 via-accent/10 to-transparent p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{titleName}</h2>
            <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {parent.whatsapp}</span>
            </div>
          </div>
        </div>
        <EditParentForm parent={parent} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Detail Kontak & Alamat */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Ayah</div>
              <div className="font-medium">{parent.fatherName || "-"}</div>
              
              <div className="text-muted-foreground">Ibu</div>
              <div className="font-medium">{parent.motherName || "-"}</div>

              <div className="text-muted-foreground">WhatsApp</div>
              <div className="font-medium">{parent.whatsapp}</div>

              <div className="text-muted-foreground">Telepon Alternatif</div>
              <div className="font-medium">{parent.phone || "-"}</div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">{parent.address || "Alamat belum diisi"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Akses Portal */}
        <Card>
          <CardHeader>
            <CardTitle>Akses Portal Orang Tua</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Kredensial Login</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Gunakan nomor WhatsApp terdaftar sebagai kredensial login.</p>
                  <div className="grid grid-cols-[80px_1fr] gap-1 text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{parent.whatsapp}</span>
                    <span className="text-muted-foreground">Password:</span>
                    <span className="font-medium text-xs bg-muted px-1 py-0.5 rounded border">(Diberikan saat pendaftaran)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anak / Siswa Terkait */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" /> Data Anak Terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parent.students.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {parent.students.map(student => (
                  <div key={student.id} className="rounded-lg border p-4 flex justify-between items-center bg-card shadow-sm hover:shadow transition-shadow">
                    <div>
                      <h4 className="font-semibold">{student.fullName}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{student.classroom?.name || "Belum ada kelas"} • {student.status}</p>
                    </div>
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/siswa/${student.id}`}>Profil Anak</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada anak/siswa yang terhubung dengan orang tua ini.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
