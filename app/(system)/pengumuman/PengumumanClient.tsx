"use client";

import { useState } from "react";
import { Announcement } from "@prisma/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionForm } from "@/components/action-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, MessageCircle } from "lucide-react";
import { createAnnouncement, deleteAnnouncement } from "@/app/actions/pengumuman";

export function PengumumanClient({ initialData }: { initialData: Announcement[] }) {
  const [openCreate, setOpenCreate] = useState(false);

  function getTargetBadge(target: string) {
    if (target === "TEACHER") return <Badge variant="secondary">Guru</Badge>;
    if (target === "PARENT") return <Badge variant="outline">Orang Tua</Badge>;
    return <Badge>Semua</Badge>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm rounded-full">
              <Plus className="h-4 w-4" />
              Buat Pengumuman
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pengumuman Baru</DialogTitle>
              <DialogDescription>
                Informasi ini akan muncul di dashboard target.
              </DialogDescription>
            </DialogHeader>
            <ActionForm action={createAnnouncement}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Judul Pengumuman</FieldLabel>
                  <Input name="title" required placeholder="Cth: Libur Nasional" />
                </Field>
                <Field>
                  <FieldLabel>Target Penerima</FieldLabel>
                  <Select name="targetRole" defaultValue="ALL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua (Guru & Orang Tua)</SelectItem>
                      <SelectItem value="TEACHER">Hanya Guru</SelectItem>
                      <SelectItem value="PARENT">Hanya Orang Tua</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Isi Pengumuman</FieldLabel>
                  <Textarea name="content" required rows={4} placeholder="Tulis informasi..." />
                </Field>
                <Field>
                  <FieldLabel>Batas Waktu (Opsional)</FieldLabel>
                  <Input type="date" name="expiresAt" />
                  <p className="text-xs text-muted-foreground mt-1">Jika dikosongkan, pengumuman berlaku selamanya.</p>
                </Field>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="sendWhatsapp" name="sendWhatsapp" />
                  <label
                    htmlFor="sendWhatsapp"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                    Teruskan ke WhatsApp (Broadcast)
                  </label>
                </div>
              </FieldGroup>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit">Publish</Button>
              </div>
            </ActionForm>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="w-16 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Belum ada pengumuman.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-sm">{item.content}</div>
                    {item.expiresAt && (
                      <div className="text-xs font-medium text-amber-600 mt-1">
                        Berlaku s/d: {format(new Date(item.expiresAt), "dd MMM yyyy", { locale: localeId })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getTargetBadge(item.targetRole)}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteAnnouncement}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
