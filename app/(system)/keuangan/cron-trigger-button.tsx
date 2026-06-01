"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CronTriggerButton() {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    if (!confirm("Fitur ini akan memindai tagihan jatuh tempo dan membuat tagihan SPP baru untuk bulan ini. Lanjutkan?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/cron/generate-spp", {
        method: "POST",
        headers: {
          "Authorization": "Bearer siakad-cron-secret",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menjalankan cron");
      }

      toast.success(`Berhasil! ${data.summary.invoicesCreated} tagihan baru dibuat, ${data.summary.lateFeesApplied} denda diterapkan. Pemicu: ${data.period}`);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleTrigger} 
      disabled={loading}
      className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
    >
      <Zap className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
      {loading ? "Memproses..." : "Trigger SPP Otomatis"}
    </Button>
  );
}
