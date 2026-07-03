import Hero from "./hero";
import HowItWorks from "./how-it-works";
import LocalClasses from "./local-classes";
import AboutTutor from "./about";
import Pricing from "./pricing";
import { LocalBusinessJsonLd } from "@/shared/seo/local-business-jsonld";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <LocalBusinessJsonLd />
      <Hero />
      <HowItWorks />
      <LocalClasses />
      <AboutTutor />
      <Pricing />
    </main>
  );
}
