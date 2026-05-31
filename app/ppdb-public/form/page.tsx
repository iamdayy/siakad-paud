import { getPpdbConfig } from "@/lib/ppdb-config";
import { redirect } from "next/navigation";
import PpdbFormClient from "./form-client";
import { Navbar } from "@/components/landing/Navbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Formulir Pendaftaran PPDB",
};

export default async function PpdbFormPage() {
  const config = await getPpdbConfig();

  if (!config.isOpen) {
    redirect("/ppdb-public?closed=1");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 relative">
        {/* Background decorative elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
        </div>
        
        <PpdbFormClient year={config.year} />
      </main>
    </div>
  );
}
