"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0f1729]">
      <div className="pointer-events-none absolute top-0 right-0 h-full w-[55%] bg-gradient-to-l from-[#1a2a50] to-transparent" />
      <div className="pointer-events-none absolute top-1/2 right-[10%] h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">
        {/* Left — copy */}
        <div>
          <Badge className="mb-6 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-normal tracking-widest text-blue-400 uppercase">
            Tehuacán · Club de conversación
          </Badge>

          <h1
            className="mb-6 text-4xl leading-[1.1] font-bold text-white md:text-5xl lg:text-6xl"
            style={font}
          >
            Habla inglés
            <br />
            <span className="text-blue-400">de verdad.</span>
          </h1>

          <p
            className="mb-4 max-w-md text-base leading-relaxed text-white/60"
            style={font}
          >
            ¿Ya estudiaste inglés pero todavía te cuesta hablarlo? El problema
            no es tu inglés —{" "}
            <span className="text-white">es que casi no lo usas.</span>
          </p>
          <p
            className="mb-8 max-w-md text-sm leading-relaxed text-white/45"
            style={font}
          >
            Nos reunimos cada domingo en Tehuacán, en grupos pequeños, para
            practicar conversación real con un instructor estadounidense. Menos
            teoría. Más conversación.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <Link href="/join">
              <Button
                size="lg"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-400"
                style={font}
              >
                Reserva tu lugar
                <ChevronRight className="size-4" />
              </Button>
            </Link>
            <a href="#calendario">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full border border-white/10 px-7 py-6 text-sm font-medium text-white/50 transition-all duration-300 hover:bg-white/5 hover:text-white"
                style={font}
              >
                Ver próximas sesiones →
              </Button>
            </a>
          </div>

          {/* Stats row */}
          <div
            className="flex gap-8 border-t border-white/[0.08] pt-8"
            style={font}
          >
            {[
              { value: "Máximo 6", label: "Personas por grupo" },
              { value: "$200", label: "Por sesión" },
              { value: "🇺🇸", label: "Instructor nativo" },
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
            <div className="absolute inset-0 scale-110 rounded-2xl bg-blue-500/10 blur-2xl" />
            <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a2a50]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/tutor-avatar.png"
                  alt="Instructor del club de conversación"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative z-10 w-full bg-gradient-to-t from-[#0f1729] to-transparent p-5">
                <p className="text-sm font-semibold text-white" style={font}>
                  Instructor estadounidense
                </p>
                <p className="mt-0.5 text-xs text-white/40" style={font}>
                  Conversación 100% en inglés · adaptada a tu nivel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
