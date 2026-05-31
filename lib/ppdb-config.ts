import { prisma } from "@/lib/prisma";

export interface PpdbConfig {
  isOpen: boolean;
  year: string;
  startDate: string;
  endDate: string;
  quota: number;
}

/**
 * Reads the PPDB configuration from the SystemSetting table.
 * Returns a structured object with all PPDB-related settings.
 */
export async function getPpdbConfig(): Promise<PpdbConfig> {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ["ppdb_open", "ppdb_year", "ppdb_start_date", "ppdb_end_date", "ppdb_quota"],
      },
    },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  return {
    isOpen: map.get("ppdb_open") === "true",
    year: map.get("ppdb_year") || "2026/2027",
    startDate: map.get("ppdb_start_date") || "2026-03-01",
    endDate: map.get("ppdb_end_date") || "2026-07-31",
    quota: parseInt(map.get("ppdb_quota") || "60", 10),
  };
}
