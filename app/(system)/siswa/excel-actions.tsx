"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExcelActions() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/excel/siswa/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengimpor data");

      toast.success(data.message);
      setIsOpen(false);
      // Reload page to show new data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="gap-2 text-green-600 border-green-600 hover:bg-green-50" asChild>
        <a href="/api/excel/siswa/export">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </a>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data Siswa (Excel)</DialogTitle>
            <DialogDescription>
              Unggah file Excel yang berisi data siswa. Pastikan format kolom sesuai dengan template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImport} className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="excel-file" className="text-sm font-medium">File Excel (.xlsx)</label>
              <input
                id="excel-file"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                <a href="/api/excel/siswa/template" download>
                  <Download className="h-3 w-3 mr-1" />
                  Unduh Template Kosong
                </a>
              </Button>
              <Button type="submit" disabled={!file || loading}>
                {loading ? "Memproses..." : "Mulai Import"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
