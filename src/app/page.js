import HeroSection from "./hero-section/page";
import { OriginSection } from "@/components/origin-section/components/OriginSection";
import MyImagesSection from "@/components/my-images-section";
import BestWorkSection from "@/components/best-work-section";
import ContactFooterSection from "@/components/footer-section/App";

export default function Home() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <section id="about">
                <OriginSection />
            </section>
            <section id="visuals">
                <MyImagesSection />
            </section>
            <BestWorkSection />
            <ContactFooterSection />
        </div>
    );
}


