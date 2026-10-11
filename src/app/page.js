import HeroSection from "./hero-section/page";
import { OriginSection } from "@/components/origin-section/components/OriginSection";
  
export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <OriginSection />
    </div>
  );
}   