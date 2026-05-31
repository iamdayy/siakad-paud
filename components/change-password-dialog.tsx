"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { KeyRound } from "lucide-react";
import { changePasswordAction } from "@/app/auth/actions";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function actionWrapper(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess("");
    
    const res = await changePasswordAction(formData);
    if (res?.success) {
      setSuccess(res.message || "Password berhasil diubah!");
      setTimeout(() => setOpen(false), 2000);
    } else {
      setError(res?.message || "Terjadi kesalahan.");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="Ganti Password"
        >
          <KeyRound className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ganti Password</DialogTitle>
          <DialogDescription>Perbarui kata sandi akun Anda.</DialogDescription>
        </DialogHeader>
        <form action={actionWrapper} className="space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          {success && <div className="text-emerald-600 text-sm font-medium">{success}</div>}
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="oldPassword">Password Lama</FieldLabel>
              <Input id="oldPassword" name="oldPassword" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Password Baru</FieldLabel>
              <Input id="newPassword" name="newPassword" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Konfirmasi Password</FieldLabel>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !!success}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
