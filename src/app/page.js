import HeroSection from "./hero-section/page";
import { OriginSection } from "@/components/origin-section/components/OriginSection";
import MyImagesSection from "@/components/my-images-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <OriginSection />
      <MyImagesSection />
    </div>
  );
}   