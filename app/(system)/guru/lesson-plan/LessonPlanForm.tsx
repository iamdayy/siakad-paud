"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLessonPlan, getLessonPlanPresignedUrl } from "@/app/actions/lesson-plan";

export function LessonPlanForm() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    let finalFileUrl = "";

    try {
      if (file) {
        setIsUploading(true);
        // 1. Get presigned URL
        const presignedRes = await getLessonPlanPresignedUrl(file.name, file.type);
        
        if (!presignedRes.success || !presignedRes.signedUrl) {
          throw new Error(presignedRes.message || "Gagal mendapatkan upload URL");
        }

        // 2. Upload file to R2 directly
        const uploadRes = await fetch(presignedRes.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengunggah file ke server");
        }

        finalFileUrl = presignedRes.fileUrl!;
      }

      // 3. Create Lesson Plan record
      formData.set("fileUrl", finalFileUrl);
      const res = await createLessonPlan(formData);

      if (res?.success) {
        toast.success(res.message);
        setOpen(false);
        formRef.current.reset();
        setFile(null);
      } else {
        toast.error(res?.message || "Gagal menyimpan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm rounded-full">
          <Plus className="h-4 w-4" />
          Unggah Lesson Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unggah RPPH / RPPM</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Judul</FieldLabel>
              <Input name="title" required placeholder="Cth: RPPH Tema Alam Semesta" disabled={isUploading} />
            </Field>
            
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Tipe</FieldLabel>
                <Select name="type" defaultValue="RPPH" disabled={isUploading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RPPH">RPPH (Harian)</SelectItem>
                    <SelectItem value="RPPM">RPPM (Mingguan)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tanggal / Mulai Minggu</FieldLabel>
                <Input type="date" name="weekDate" required disabled={isUploading} />
              </Field>
            </div>

            <Field>
              <FieldLabel>Catatan / Isi (Opsional)</FieldLabel>
              <Textarea name="content" rows={3} placeholder="Tuliskan catatan singkat..." disabled={isUploading} />
            </Field>

            <Field>
              <FieldLabel>Dokumen (Opsional, PDF/Word)</FieldLabel>
              <Input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Jika ada file pendukung, silakan unggah (Max 5MB).</p>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Batal
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
