"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClassSchedule } from "@/app/actions/schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionForm } from "@/components/action-form";

export function ScheduleForm({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> Tambah Kegiatan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Kegiatan</DialogTitle>
        </DialogHeader>
        <ActionForm 
          action={createClassSchedule} 
          className="space-y-4"
        >
          <input type="hidden" name="classroomId" value={classroomId} />
          <FieldGroup>
            <Field>
              <FieldLabel>Hari</FieldLabel>
              <Select name="dayOfWeek" defaultValue="1" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Senin</SelectItem>
                  <SelectItem value="2">Selasa</SelectItem>
                  <SelectItem value="3">Rabu</SelectItem>
                  <SelectItem value="4">Kamis</SelectItem>
                  <SelectItem value="5">Jumat</SelectItem>
                  <SelectItem value="6">Sabtu</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Waktu Mulai</FieldLabel>
                <Input type="time" name="startTime" required defaultValue="07:30" />
              </Field>
              <Field>
                <FieldLabel>Waktu Selesai</FieldLabel>
                <Input type="time" name="endTime" required defaultValue="08:00" />
              </Field>
            </div>

            <Field>
              <FieldLabel>Nama Kegiatan</FieldLabel>
              <Input name="activity" required placeholder="Cth: Penyambutan Anak" />
            </Field>

            <Field>
              <FieldLabel>Lokasi (Opsional)</FieldLabel>
              <Input name="location" placeholder="Cth: Halaman Sekolah" />
            </Field>
          </FieldGroup>

          <div className="flex justify-end pt-4">
            <Button type="submit">Simpan Jadwal</Button>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
