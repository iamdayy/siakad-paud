"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Pagination({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      replace(createPageURL(page));
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Halaman <span className="font-medium text-foreground">{currentPage}</span> dari <span className="font-medium text-foreground">{totalPages}</span>
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">Halaman sebelumnya</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Halaman selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
