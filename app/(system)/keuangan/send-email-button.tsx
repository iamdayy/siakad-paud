"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SendEmailButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim email");
      }

      toast.success(data.message || "Email berhasil dikirim!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="secondary" 
      onClick={handleSend} 
      disabled={loading}
      title="Kirim Invoice ke Email Orang Tua"
    >
      <Mail className="w-4 h-4 mr-1" />
      {loading ? "Mengirim..." : "Kirim"}
    </Button>
  );
}
