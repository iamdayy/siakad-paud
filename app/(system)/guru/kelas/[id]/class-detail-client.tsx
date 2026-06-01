"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { upsertAttendance, upsertDailyReport, saveBulkData, upsertAssessment } from "@/app/actions/guru-kelas";
import { AttendanceStatus } from "@prisma/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type StudentData = any; // type would be imported from prisma

export function ClassDetailClient({ initialData, date }: { initialData: any; date: string }) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { classroom, students, role } = initialData;
  const { isMainTeacher, isCoTeacher } = role;

  const handleSingleAttendanceSubmit = async (studentId: string, status: AttendanceStatus, note: string, closeDialog: () => void) => {
    startTransition(async () => {
      try {
        await upsertAttendance(studentId, new Date(date), status, note);
        toast.success("Presensi berhasil disimpan");
        closeDialog();
      } catch (e) {
        toast.error("Gagal menyimpan presensi");
      }
    });
  };

  const handleSingleReportSubmit = async (studentId: string, reportData: any, closeDialog: () => void) => {
    startTransition(async () => {
      try {
        await upsertDailyReport(studentId, new Date(date), reportData);
        toast.success("Laporan Harian berhasil disimpan");
        closeDialog();
      } catch (e) {
        toast.error("Gagal menyimpan laporan harian");
      }
    });
  };

  const handleRaportSubmit = async (studentId: string, data: any, closeDialog: () => void) => {
    startTransition(async () => {
      try {
        await upsertAssessment(studentId, data);
        toast.success(data.isPublished ? "Raport dipublikasikan!" : "Draft raport disimpan");
        closeDialog();
      } catch (e) {
        toast.error("Gagal menyimpan raport");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{classroom.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>{classroom.level}</span>
            <span>•</span>
            <span>{format(new Date(date), "EEEE, dd MMMM yyyy", { locale: localeId })}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-muted/50 p-2 rounded-lg border">
          <Label htmlFor="bulk-mode" className="cursor-pointer font-medium">Mode Satuan</Label>
          <Switch
            id="bulk-mode"
            checked={isBulkMode}
            onCheckedChange={setIsBulkMode}
            disabled={isCoTeacher} // Co-teacher disabled from bulk mode based on requested diff
          />
          <Label htmlFor="bulk-mode" className="cursor-pointer font-medium text-primary">Mode Massal</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Guru Utama</CardTitle>
            <CardDescription className="font-medium text-foreground">{classroom.mainTeacher?.name || "-"}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Guru Pendamping</CardTitle>
            <CardDescription className="font-medium text-foreground">{classroom.coTeacher?.name || "-"}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Kapasitas</CardTitle>
            <CardDescription className="font-medium text-foreground">{students.length} / {classroom.maxCapacity} Siswa</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {isBulkMode ? (
        <BulkModeView
          students={students}
          date={date}
          isPending={isPending}
          startTransition={startTransition}
        />
      ) : (
        <SingleModeView
          students={students}
          isCoTeacher={isCoTeacher}
          isPending={isPending}
          onSaveAttendance={handleSingleAttendanceSubmit}
          onSaveReport={handleSingleReportSubmit}
          onSaveRaport={handleRaportSubmit}
        />
      )}
    </div>
  );
}

function SingleModeView({ students, isCoTeacher, isPending, onSaveAttendance, onSaveReport, onSaveRaport }: any) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Siswa</TableHead>
            <TableHead>Presensi</TableHead>
            <TableHead>Laporan Harian</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student: any) => {
            const todayAttendance = student.attendances[0];
            const todayReport = student.reports[0];

            return (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {student.nickName?.[0] || student.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.fullName}</span>
                      <span className="text-xs text-muted-foreground">{student.nis}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {todayAttendance ? (
                    <Badge variant={todayAttendance.status === 'PRESENT' ? 'default' : 'secondary'}>
                      {todayAttendance.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground bg-muted">Belum Diisi</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {todayReport ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Diisi
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Kosong</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <AttendanceDialog student={student} isPending={isPending} onSave={onSaveAttendance} attendance={todayAttendance} />
                  <ReportDialog student={student} isPending={isPending} isCoTeacher={isCoTeacher} onSave={onSaveReport} report={todayReport} />
                  {/* <RaportDialog student={student} isPending={isPending} isCoTeacher={isCoTeacher} onSave={onSaveRaport} /> */}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function AttendanceDialog({ student, isPending, onSave, attendance }: any) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AttendanceStatus>(attendance?.status || "PRESENT");
  const [note, setNote] = useState(attendance?.note || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, status, note, () => setOpen(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Presensi</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Presensi: {student.nickName}</DialogTitle>
          <DialogDescription>Input kehadiran siswa untuk hari ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: AttendanceStatus) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Hadir</SelectItem>
                <SelectItem value="SICK">Sakit</SelectItem>
                <SelectItem value="PERMITTED">Izin</SelectItem>
                <SelectItem value="ABSENT">Alpa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status !== "PRESENT" && (
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Sakit demam" />
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReportDialog({ student, isPending, isCoTeacher, onSave, report }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    meals: report?.meals || "",
    napDuration: report?.napDuration || "",
    mood: report?.mood || "",
    activities: report?.activities || "",
    note: report?.note || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, data, () => setOpen(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Laporan</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buku Penghubung: {student.nickName}</DialogTitle>
          <DialogDescription>Laporan aktivitas harian anak untuk orang tua.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Porsi Makan</Label>
              <Input value={data.meals} onChange={(e) => setData({ ...data, meals: e.target.value })} placeholder="Cth: Habis 1 porsi" />
            </div>
            <div className="space-y-2">
              <Label>Tidur Siang</Label>
              <Input value={data.napDuration} onChange={(e) => setData({ ...data, napDuration: e.target.value })} placeholder="Cth: 1 Jam" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mood / Emosi</Label>
            <Input value={data.mood} onChange={(e) => setData({ ...data, mood: e.target.value })} placeholder="Cth: Sangat Ceria" />
          </div>
          <div className="space-y-2">
            <Label>Aktivitas Penting <span className="text-destructive">*</span></Label>
            <Textarea required value={data.activities} onChange={(e) => setData({ ...data, activities: e.target.value })} placeholder="Kegiatan apa yang dilakukan hari ini?" />
          </div>
          <div className="space-y-2">
            <Label>Catatan Guru {isCoTeacher && "(Khusus Guru Utama)"}</Label>
            <Textarea
              disabled={isCoTeacher}
              value={data.note}
              onChange={(e) => setData({ ...data, note: e.target.value })}
              placeholder={isCoTeacher ? "Hanya guru utama yang bisa mengisi catatan akhir" : "Pesan atau evaluasi untuk orang tua"}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Mode View
function BulkModeView({ students, date, isPending, startTransition }: any) {
  const [formData, setFormData] = useState<Record<string, any>>(
    students.reduce((acc: any, student: any) => {
      acc[student.id] = {
        status: student.attendances[0]?.status || "PRESENT",
        note: student.attendances[0]?.note || "",
        activities: student.reports[0]?.activities || "",
        meals: student.reports[0]?.meals || "",
        mood: student.reports[0]?.mood || "",
      };
      return acc;
    }, {})
  );

  const handleBulkSubmit = () => {
    startTransition(async () => {
      try {
        const payload = Object.entries(formData).map(([studentId, data]: [string, any]) => ({
          studentId,
          status: data.status,
          note: data.note,
          activities: data.activities,
          meals: data.meals,
          mood: data.mood,
        }));

        await saveBulkData(students[0]?.classroomId, new Date(date), payload);
        toast.success("Data massal berhasil disimpan");
      } catch (e) {
        toast.error("Gagal menyimpan data massal");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode Massal (Cepat)</CardTitle>
        <CardDescription>Ubah nilai di tabel secara langsung, lalu klik simpan di paling bawah.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Siswa</TableHead>
            <TableHead>Presensi</TableHead>
            <TableHead>Aktivitas Harian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student: any) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.nickName}</TableCell>
              <TableCell>
                <Select
                  value={formData[student.id].status}
                  onValueChange={(v) => setFormData({ ...formData, [student.id]: { ...formData[student.id], status: v } })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Hadir</SelectItem>
                    <SelectItem value="SICK">Sakit</SelectItem>
                    <SelectItem value="PERMITTED">Izin</SelectItem>
                    <SelectItem value="ABSENT">Alpa</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Kegiatan..."
                  value={formData[student.id].activities}
                  onChange={(e) => setFormData({ ...formData, [student.id]: { ...formData[student.id], activities: e.target.value } })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-4 border-t flex justify-end">
        <Button onClick={handleBulkSubmit}>Simpan Semua</Button>
      </div>
    </Card>
  );
}

function RaportDialog({ student, isPending, isCoTeacher, onSave }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    periodLabel: "Semester Ganjil 2026/2027",
    agamaMoral: "BB",
    fisikMotorik: "BB",
    kognitif: "BB",
    bahasa: "BB",
    sosialEmosional: "BB",
    seni: "BB",
    narasiAgamaMoral: "",
    narasiFisikMotorik: "",
    narasiKognitif: "",
    narasiBahasa: "",
    narasiSosialEmosional: "",
    narasiSeni: "",
    narrative: "",
    note: "",
    isPublished: false,
  });

  const handleSubmit = (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    onSave(student.id, { ...data, isPublished: publish }, () => setOpen(false));
  };

  const indicatorOptions = [
    { value: "BB", label: "Belum Berkembang (BB)" },
    { value: "MB", label: "Mulai Berkembang (MB)" },
    { value: "BSH", label: "Berkembang Sesuai Harapan (BSH)" },
    { value: "BSB", label: "Berkembang Sangat Baik (BSB)" },
  ];

  const AspectInput = ({ aspect, label }: { aspect: string, label: string }) => (
    <div className="space-y-2 border p-3 rounded-md">
      <Label className="font-semibold">{label}</Label>
      <Select
        value={(data as any)[aspect]}
        onValueChange={(v) => setData({ ...data, [aspect]: v })}
        disabled={isCoTeacher}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {indicatorOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        disabled={isCoTeacher}
        placeholder={`Narasi ${label}...`}
        value={(data as any)[`narasi${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`]}
        onChange={(e) => setData({ ...data, [`narasi${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`]: e.target.value })}
        className="mt-2 text-sm"
        rows={2}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="border">E-Raport</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>E-Raport Narasi: {student.fullName}</DialogTitle>
          <DialogDescription>Pengisian raport penilaian perkembangan anak.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Periode Penilaian</Label>
            <Input
              disabled={isCoTeacher}
              value={data.periodLabel}
              onChange={(e) => setData({ ...data, periodLabel: e.target.value })}
              placeholder="Cth: Semester Ganjil 2026/2027"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AspectInput aspect="agamaMoral" label="1. Nilai Agama & Moral" />
            <AspectInput aspect="fisikMotorik" label="2. Fisik-Motorik" />
            <AspectInput aspect="kognitif" label="3. Kognitif" />
            <AspectInput aspect="bahasa" label="4. Bahasa" />
            <AspectInput aspect="sosialEmosional" label="5. Sosial-Emosional" />
            <AspectInput aspect="seni" label="6. Seni" />
          </div>

          <div className="space-y-2">
            <Label>Narasi Keseluruhan (Raport)</Label>
            <Textarea
              disabled={isCoTeacher}
              value={data.narrative}
              onChange={(e) => setData({ ...data, narrative: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Rekomendasi Guru / Catatan Khusus</Label>
            <Textarea
              disabled={isCoTeacher}
              value={data.note}
              onChange={(e) => setData({ ...data, note: e.target.value })}
              rows={2}
            />
          </div>

          {!isCoTeacher && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" disabled={isPending} onClick={(e) => handleSubmit(e, false)}>
                Simpan Draft
              </Button>
              <Button type="button" disabled={isPending} onClick={(e) => handleSubmit(e, true)}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publikasikan
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
