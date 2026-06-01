"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processGraduation, processMutation } from "@/app/(system)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionForm } from "@/components/action-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, ArrowLeft, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function KelulusanClient({ students, classrooms }: { students: any[]; classrooms: any[] }) {
  const router = useRouter();
  const [filterClass, setFilterClass] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openGraduation, setOpenGraduation] = useState(false);
  const [openMutation, setOpenMutation] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredStudents = filterClass === "ALL" 
    ? students 
    : students.filter((s) => s.classroomId === filterClass);

  const isAllSelected = filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  async function handleGraduation(formData: FormData) {
    if (selectedIds.length === 0) return { success: false, message: "Pilih siswa terlebih dahulu" };
    setLoading(true);
    const dateStr = formData.get("outDate") as string;
    const date = new Date(dateStr);
    const res = await processGraduation(selectedIds, date);
    setLoading(false);
    if (res?.success) {
      toast.success("Berhasil memproses kelulusan");
      setSelectedIds([]);
      setOpenGraduation(false);
      router.refresh();
      return { success: true };
    }
    return res;
  }

  async function handleMutation(formData: FormData) {
    if (selectedIds.length === 0) return { success: false, message: "Pilih siswa terlebih dahulu" };
    setLoading(true);
    const dateStr = formData.get("outDate") as string;
    const date = new Date(dateStr);
    const res = await processMutation(selectedIds, date);
    setLoading(false);
    if (res?.success) {
      toast.success("Berhasil memproses mutasi");
      setSelectedIds([]);
      setOpenMutation(false);
      router.refresh();
      return { success: true };
    }
    return res;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/siswa"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Proses Kelulusan & Mutasi
          </h2>
          <p className="text-sm text-muted-foreground">
            Luluskan siswa di akhir tahun ajaran secara massal.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-medium">Filter Kelas:</span>
          <Select value={filterClass} onValueChange={(val) => { setFilterClass(val); setSelectedIds([]); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kelas</SelectItem>
              {classrooms.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm text-muted-foreground mr-2">
            {selectedIds.length} terpilih
          </span>
          <Button 
            variant="outline" 
            onClick={() => setOpenMutation(true)} 
            disabled={selectedIds.length === 0}
            className="gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" /> Mutasi
          </Button>
          <Button 
            onClick={() => setOpenGraduation(true)} 
            disabled={selectedIds.length === 0}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" /> Luluskan
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>Kelas Saat Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                  Tidak ada data siswa aktif di filter ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.includes(student.id)}
                      onCheckedChange={() => toggleSelect(student.id)}
                    />
                  </TableCell>
                  <TableCell>{student.nis || "-"}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell>
                    {student.classroom ? `${student.classroom.name} (${student.classroom.level})` : "Belum Masuk Kelas"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Graduation Dialog */}
      <Dialog open={openGraduation} onOpenChange={setOpenGraduation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Kelulusan Massal</DialogTitle>
            <DialogDescription>
              Anda akan meluluskan <strong>{selectedIds.length}</strong> siswa. Mereka akan dikeluarkan dari kelas saat ini.
            </DialogDescription>
          </DialogHeader>
          <ActionForm action={handleGraduation}>
            <FieldGroup>
              <Field>
                <FieldLabel>Tanggal Kelulusan</FieldLabel>
                <Input type="date" name="outDate" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </Field>
            </FieldGroup>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setOpenGraduation(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? "Memproses..." : "Luluskan Sekarang"}</Button>
            </div>
          </ActionForm>
        </DialogContent>
      </Dialog>

      {/* Mutation Dialog */}
      <Dialog open={openMutation} onOpenChange={setOpenMutation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Mutasi / Pindah Sekolah</DialogTitle>
            <DialogDescription>
              Anda akan memutasi <strong>{selectedIds.length}</strong> siswa. Mereka akan dikeluarkan dari kelas saat ini.
            </DialogDescription>
          </DialogHeader>
          <ActionForm action={handleMutation}>
            <FieldGroup>
              <Field>
                <FieldLabel>Tanggal Mutasi</FieldLabel>
                <Input type="date" name="outDate" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </Field>
            </FieldGroup>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setOpenMutation(false)}>Batal</Button>
              <Button type="submit" variant="destructive" disabled={loading}>{loading ? "Memproses..." : "Mutasi Sekarang"}</Button>
            </div>
          </ActionForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
