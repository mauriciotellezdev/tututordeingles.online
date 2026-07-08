import Hero from "./hero";
import WhyDifferent from "./why-different";
import HowItWorks from "./how-it-works";
import CalendarSection from "./calendar-section";
import LocalClasses from "./local-classes";
import AboutTutor from "./about";
import Faq from "./faq";
import { LocalBusinessJsonLd } from "@/shared/seo/local-business-jsonld";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <LocalBusinessJsonLd />
      <Hero />
      <WhyDifferent />
      <HowItWorks />
      <CalendarSection />
      <LocalClasses />
      <AboutTutor />
      <Faq />
    </main>
  );
}
