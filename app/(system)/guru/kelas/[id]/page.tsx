import { getClassDetails } from "@/app/actions/guru-kelas";
import { notFound } from "next/navigation";
import { ClassDetailClient } from "./class-detail-client";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get data for today
  const today = new Date();

  try {
    const data = await getClassDetails(id, today);
    return (
      <div className="space-y-6">
        <ClassDetailClient initialData={data} date={today.toISOString()} />
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
