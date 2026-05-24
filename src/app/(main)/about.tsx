"use client";

import { Button } from "@/shared/ui/button";
import Image from "next/image";

const credentials = [
  { icon: "🇺🇸", text: "Hablante nativo de inglés americano" },
  { icon: "💼", text: "30 años enseñando inglés de negocios" },
  { icon: "🧑‍💻", text: "Especialista en inglés para tecnología y trabajo remoto" },
];

export default function AboutTutor() {
  return (
    <section className="bg-[#0f1729] py-28 px-6 border-t border-white/[0.05]" id="tutor">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left — photo */}
        <div className="relative flex justify-center">
          <div className="relative w-[300px] md:w-[360px]">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-3xl scale-110" />
            <div className="relative rounded-2xl overflow-hidden bg-[#1a2a50] border border-white/[0.08] aspect-square flex items-center justify-center">
              {/* Replace with <Image src="/tutor.jpg" alt="Tutor" fill className="object-cover" /> */}
              <Image src="/tutor-avatar.png" alt="Tu tutor" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Right — copy */}
        <div>
          <p
            className="text-blue-400 text-[11px] tracking-[0.3em] uppercase mb-5 font-medium"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Tu tutor
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            No soy un profesor
            <br />
            de escuela.
          </h2>
          <p
            className="text-white/50 text-sm leading-relaxed mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Trabajo exclusivamente con hispanohablantes adultos — profesionales,
            emprendedores y ejecutivos — que ya saben inglés básico pero
            necesitan sonar naturales, seguros y claros en contextos de trabajo
            real.
          </p>
          <p
            className="text-white/50 text-sm leading-relaxed mb-8"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cada clase es diseñada para ti. Sin libro de texto, sin ejercicios
            genéricos. Trabajamos con situaciones reales de tu vida profesional.
          </p>

          <ul className="space-y-3 mb-10">
            {credentials.map((c, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-white/60 text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="text-base">{c.icon}</span>
                {c.text}
              </li>
            ))}
          </ul>

          <a href="mailto:mauriciotellezdev@gmail.com">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-7 py-6 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
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
