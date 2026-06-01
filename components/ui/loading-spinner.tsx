import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-muted-foreground">
      <Loader2 className={`h-8 w-8 animate-spin text-primary ${className || ""}`} />
      <p className="mt-2 text-sm font-medium">Memuat data...</p>
    </div>
  );
}
