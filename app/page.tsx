import { Footer } from "@/components/landing/Footer";
import { GallerySection } from "@/components/landing/GallerySection";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { PPDBSection } from "@/components/landing/PPDBSection";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TeachersSection } from "@/components/landing/TeachersSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProgramsSection />
        <StatsSection />
        <WhyUsSection />
        <TeachersSection />
        <GallerySection />
        <TestimonialsSection />
        <PPDBSection />
      </main>
      <Footer />
    </>
  );
}
