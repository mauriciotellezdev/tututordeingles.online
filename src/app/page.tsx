import Hero from "./hero";
import HowItWorks from "./how-it-works";
import AboutTutor from "./about";
import Pricing from "./pricing";

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Hero />
      <HowItWorks />
      <AboutTutor />
      <Pricing />
    </main>
  );
}