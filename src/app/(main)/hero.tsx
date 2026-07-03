"use client";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0f1729]">
      {/* Radial glow behind photo */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-[55%] bg-gradient-to-l from-[#1a2a50] to-transparent" />
      <div className="pointer-events-none absolute top-1/2 right-[10%] h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">
        {/* Left — copy */}
        <div>
          <Badge className="mb-6 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-normal tracking-widest text-blue-400 uppercase">
            Tehuacán · Presencial o en línea
          </Badge>

          <h1
            className="mb-6 text-4xl leading-[1.1] font-bold text-white md:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Suena como un
            <br />
            <span className="text-blue-400">nativo.</span>
            <br />
            Sin acento.
          </h1>

          <p
            className="mb-8 max-w-md text-base leading-relaxed text-white/55"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Soy estadounidense y hablo inglés sin acento. Te enseño a sonar como
            un nativo — sin acento mexicano. Clases uno a uno en Tehuacán
            (presenciales o en línea) para profesionales que quieren expresarse
            con claridad y confianza.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <a href="/signup">
              <Button
                size="lg"
                className="rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-400"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Agenda tu clase gratis
              </Button>
            </a>
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full border border-white/10 px-7 py-6 text-sm font-medium text-white/50 transition-all duration-300 hover:bg-white/5 hover:text-white"
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
            className="flex gap-8 border-t border-white/[0.08] pt-8"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {[
              { value: "Sin acento", label: "Americano nativo" },
              { value: "MXN", label: "Pago en pesos" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — photo */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-[320px] md:w-[400px]">
            {/* Glow ring */}
            <div className="absolute inset-0 scale-110 rounded-2xl bg-blue-500/10 blur-2xl" />
            {/* Photo box — replace div with <Image> */}
            <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a2a50]">
              {/* <Image src="/tutor.jpg" alt="Tu tutor" fill className="object-cover" /> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/tutor-avatar.png"
                  alt="Tu tutor"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Name card overlay */}
              <div className="relative z-10 w-full bg-gradient-to-t from-[#0f1729] to-transparent p-5">
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Mauricio Tellez
                </p>
                <p
                  className="mt-0.5 text-xs text-white/40"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
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
