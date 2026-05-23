"use client";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0f1729] overflow-hidden">
      {/* Radial glow behind photo */}
      <div className="absolute right-0 top-0 w-[55%] h-full bg-gradient-to-l from-[#1a2a50] to-transparent pointer-events-none" />
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-24">
        {/* Left — copy */}
        <div>
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1.5 text-[11px] tracking-widest uppercase font-normal">
            Clases 1 a 1 · Google Meet
          </Badge>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Habla inglés de
            <br />
            <span className="text-blue-400">forma natural</span>
            <br />
            con un tutor
            <br />
            nativo.
          </h1>

          <p
            className="text-white/55 text-base leading-relaxed mb-8 max-w-md"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Conversaciones reales en inglés, sesión por sesión. Para
            profesionales hispanohablantes que necesitan pasar de entender a
            expresarse con confianza.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-7 py-6 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Agenda tu clase gratis
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white/50 hover:text-white hover:bg-white/5 rounded-full px-7 py-6 text-sm font-medium border border-white/10 transition-all duration-300"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={() => {
                const pricingSection = document.getElementById("precios");
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Ver precios →
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="flex gap-8 pt-8 border-t border-white/[0.08]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {[
              { value: "+120", label: "Estudiantes" },
              { value: "EE.UU.", label: "Tutor nativo" },
              { value: "MXN", label: "Pago en pesos" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-white/35 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — photo */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-[320px] md:w-[400px]">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-2xl scale-110" />
            {/* Photo box — replace div with <Image> */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1a2a50] border border-white/[0.08] aspect-[3/4] flex items-end">
              {/* <Image src="/tutor.jpg" alt="Tu tutor" fill className="object-cover" /> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/tutor-avatar.png" alt="Tu tutor" fill className="object-cover" />
              </div>
              {/* Name card overlay */}
              <div className="relative z-10 w-full p-5 bg-gradient-to-t from-[#0f1729] to-transparent">
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Mauricio Tellez
                </p>
                <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Tutor nativo · EE.UU.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
