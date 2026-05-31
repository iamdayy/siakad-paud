"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface PayButtonProps {
  invoiceId: string;
}

export function PayButton({ invoiceId }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap JS
    const scriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "YOUR_CLIENT_KEY";

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      setSnapLoaded(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = async () => {
    if (!snapLoaded || !(window as any).snap) {
      alert("Sistem pembayaran belum siap. Silakan refresh halaman.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      // Snap Pay
      (window as any).snap.pay(data.token, {
        onSuccess: function (result: any) {
          // Success
          alert("Pembayaran berhasil!");
          window.location.reload();
        },
        onPending: function (result: any) {
          // Pending
          alert("Menunggu pembayaran Anda.");
          window.location.reload();
        },
        onError: function (result: any) {
          // Error
          alert("Pembayaran gagal!");
        },
        onClose: function () {
          // User closed the popup without finishing the payment
          console.log("Customer closed the popup without finishing the payment");
        },
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handlePay} 
      disabled={loading || !snapLoaded}
      className="gap-2 text-xs"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      Bayar Sekarang
    </Button>
  );
}
