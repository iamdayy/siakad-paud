"use client";

import { useState } from "react";

type StudentItem = {
  id: string;
  fullName: string;
  nis: string | null;
};

export function StudentMultiSelect({
  students,
}: {
  students: StudentItem[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex flex-col space-y-1">
      <p className="mb-2 px-2 pt-1 text-xs font-medium text-muted-foreground">
        Klik untuk memilih (bisa lebih dari satu):
      </p>
      {/* Hidden input that carries the selected IDs as JSON to the server action */}
      <input type="hidden" name="studentIds" value={JSON.stringify(selected)} />

      <div className="flex flex-col gap-1">
        {students.map((s) => {
          const isSelected = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-background hover:bg-secondary"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && "✓"}
              </span>
              <span>
                {s.fullName}{" "}
                <span className="text-muted-foreground">
                  ({s.nis || "Belum ada NIS"})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="px-2 pt-1 text-xs text-primary">
          {selected.length} siswa dipilih
        </p>
      )}
    </div>
  );
}
