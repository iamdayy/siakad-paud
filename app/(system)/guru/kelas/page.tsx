import { getMyClasses } from "@/app/actions/guru-kelas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function KelasSayaPage() {
  const classes = await getMyClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kelas Saya</h1>
        <p className="text-muted-foreground">
          Daftar kelas yang Anda ampu sebagai Guru Utama atau Guru Pendamping.
        </p>
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Belum Ada Kelas</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Anda belum ditugaskan ke kelas manapun. Silakan hubungi Kepala Sekolah atau Admin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/guru/kelas/${cls.id}`} className="group block">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-1 duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {cls.level}
                    </span>
                    <span className="text-xs text-muted-foreground">{cls.schoolYear}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{cls.name}</CardTitle>
                  <CardDescription>
                    Kapasitas Maksimal: {cls.maxCapacity} Anak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{cls._count.students} Siswa Terdaftar</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
