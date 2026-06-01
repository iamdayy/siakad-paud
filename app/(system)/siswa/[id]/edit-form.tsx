import { ActionForm } from "@/components/action-form";
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStudent } from "@/app/(system)/actions";
import { Edit } from "lucide-react";

export function EditStudentForm({ student }: { student: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function actionWrapper(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await updateStudent(formData);
    if (res?.success) {
      setOpen(false);
    } else {
      setError(res?.message || "Terjadi kesalahan.");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>Ubah biodata lengkap siswa.</DialogDescription>
        </DialogHeader>
        <ActionForm action={actionWrapper} className="space-y-4">
          <input type="hidden" name="id" value={student.id} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
              <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="nickName">Nama Panggilan</FieldLabel>
              <Input id="nickName" name="nickName" defaultValue={student.nickName || ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="childNik">NIK Anak</FieldLabel>
              <Input id="childNik" name="childNik" defaultValue={student.nik || ""} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="birthPlace">Tempat Lahir</FieldLabel>
                <Input id="birthPlace" name="birthPlace" defaultValue={student.birthPlace || ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="birthDate">Tanggal Lahir</FieldLabel>
                <Input id="birthDate" name="birthDate" type="date" defaultValue={student.birthDate ? new Date(student.birthDate).toISOString().slice(0, 10) : ""} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="gender">Jenis Kelamin</FieldLabel>
              <Select name="gender" defaultValue={student.gender || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
