"use client";
import { ActionForm } from "@/components/action-form";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateParent } from "@/app/(system)/actions";
import { Edit } from "lucide-react";

export function EditParentForm({ parent, asMenuItem }: { parent: any, asMenuItem?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function actionWrapper(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await updateParent(formData);
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
        {asMenuItem ? (
          <button className="w-full text-left flex items-center cursor-pointer px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground rounded-sm">
            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
            Edit Orang Tua
          </button>
        ) : (
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Orang Tua</DialogTitle>
          <DialogDescription>Ubah detail kontak dan alamat.</DialogDescription>
        </DialogHeader>
        <ActionForm action={actionWrapper} className="space-y-4">
          <input type="hidden" name="id" value={parent.id} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fatherName">Nama Ayah</FieldLabel>
              <Input id="fatherName" name="fatherName" defaultValue={parent.fatherName || ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="motherName">Nama Ibu</FieldLabel>
              <Input id="motherName" name="motherName" defaultValue={parent.motherName || ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="whatsapp">No. WhatsApp</FieldLabel>
              <Input id="whatsapp" name="whatsapp" defaultValue={parent.whatsapp} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Telepon (Opsional)</FieldLabel>
              <Input id="phone" name="phone" defaultValue={parent.phone || ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Alamat</FieldLabel>
              <Input id="address" name="address" defaultValue={parent.address || ""} />
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
