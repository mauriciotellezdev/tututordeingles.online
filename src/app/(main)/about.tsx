"use client";

import { Button } from "@/shared/ui/button";
import Image from "next/image";

const credentials = [
  { icon: "🇺🇸", text: "Hablante nativo de inglés americano" },
  { icon: "💼", text: "30 años enseñando inglés de negocios" },
  {
    icon: "🧑‍💻",
    text: "Especialista en inglés para tecnología y trabajo remoto",
  },
];

export default function AboutTutor() {
  return (
    <section
      className="border-t border-white/[0.05] bg-[#0f1729] px-6 py-28"
      id="tutor"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        {/* Left — photo */}
        <div className="relative flex justify-center">
          <div className="relative w-[300px] md:w-[360px]">
            <div className="absolute inset-0 scale-110 rounded-2xl bg-blue-500/10 blur-3xl" />
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a2a50]">
              {/* Replace with <Image src="/tutor.jpg" alt="Tutor" fill className="object-cover" /> */}
              <Image
                src="/tutor-avatar.png"
                alt="Tu tutor"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right — copy */}
        <div>
          <p
            className="mb-5 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Tu tutor
          </p>
          <h2
            className="mb-5 text-3xl leading-tight font-bold text-white md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            No soy un profesor
            <br />
            de escuela.
          </h2>
          <p
            className="mb-5 text-sm leading-relaxed text-white/50"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Trabajo exclusivamente con hispanohablantes adultos — profesionales,
            emprendedores y ejecutivos — que ya saben inglés básico pero
            necesitan sonar naturales, seguros y claros en contextos de trabajo
            real.
          </p>
          <p
            className="mb-8 text-sm leading-relaxed text-white/50"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cada clase es diseñada para ti. Sin libro de texto, sin ejercicios
            genéricos. Trabajamos con situaciones reales de tu vida profesional.
          </p>

          <ul className="mb-10 space-y-3">
            {credentials.map((c, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-white/60"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="text-base">{c.icon}</span>
                {c.text}
              </li>
            ))}
          </ul>

          <a href="mailto:mauricio@tututordeingles.online">
            <Button
              size="lg"
              className="rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-400"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Agenda una llamada gratis
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
