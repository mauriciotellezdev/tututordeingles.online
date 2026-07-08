"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const credentials = [
  { icon: "🇺🇸", text: "Instructor estadounidense, inglés nativo" },
  { icon: "💬", text: "Conversación 100% en inglés, adaptada a tu nivel" },
  { icon: "🤝", text: "Grupos pequeños y ambiente relajado" },
];

export default function AboutTutor() {
  return (
    <section
      className="border-t border-white/[0.05] bg-[#0f1729] px-6 py-28"
      id="nosotros"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        {/* Left — photo */}
        <div className="relative flex justify-center">
          <div className="relative w-[300px] md:w-[360px]">
            <div className="absolute inset-0 scale-110 rounded-2xl bg-blue-500/10 blur-3xl" />
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a2a50]">
              <Image
                src="/tutor-avatar.png"
                alt="Instructor del club de conversación"
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
            style={font}
          >
            No somos una escuela
          </p>
          <h2
            className="mb-5 text-3xl leading-tight font-bold text-white md:text-4xl"
            style={font}
          >
            Un grupo donde por fin
            <br />
            <span className="text-blue-400">hablas inglés.</span>
          </h2>
          <p
            className="mb-5 text-sm leading-relaxed text-white/50"
            style={font}
          >
            Somos un grupo de conversación en inglés que se reúne en persona
            para practicar el idioma en situaciones reales. Nada de exámenes ni
            libros de texto: llegas, conversas y te vas con más confianza.
          </p>
          <p
            className="mb-8 text-sm leading-relaxed text-white/50"
            style={font}
          >
            Un instructor estadounidense guía cada reunión y adapta la
            conversación a tu nivel, para que pierdas el miedo a hablar rodeado
            de gente que quiere lo mismo que tú.
          </p>

          <ul className="mb-10 space-y-3">
            {credentials.map((c, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-white/60"
                style={font}
              >
                <span className="text-base">{c.icon}</span>
                {c.text}
              </li>
            ))}
          </ul>

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
        </div>
      </div>
    </section>
  );
}
