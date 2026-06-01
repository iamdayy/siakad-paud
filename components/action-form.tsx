"use client";

import { useRef } from "react";
import { toast } from "sonner";

export function ActionForm({
  action,
  children,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => Promise<any>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      {...props}
      action={async (formData) => {
        try {
          const res = await action(formData);

          if (res?.error) {
            toast.error(res.error);
            return; // don't close modal on error
          }

          if (res?.message || res?.success) {
            toast.success(res.message || "Berhasil disimpan");
          }

          // Close modal
          const closeBtn = formRef.current?.closest('[role="dialog"]')?.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement;
          if (closeBtn) closeBtn.click();

          formRef.current?.reset();
        } catch (e: any) {
          toast.error(e.message || "Terjadi kesalahan");
        }
      }}
      ref={formRef}
    >
      {children}
    </form>
  );
}
