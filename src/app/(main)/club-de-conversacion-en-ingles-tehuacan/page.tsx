import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";
import {
  LocalBusinessJsonLd,
  CourseJsonLd,
} from "@/shared/seo/local-business-jsonld";
import { BASE_URL } from "@/shared/seo/business";
import {
  Coffee,
  MapPin,
  Users,
  Sparkles,
  Flag,
  Bot,
  Check,
  UserPlus,
  Phone,
  CalendarDays,
  MessageCircle,
} from "lucide-react";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const URL = `${BASE_URL}/club-de-conversacion-en-ingles-tehuacan`;
const OG_IMAGE = `${BASE_URL}/og-image?title=${encodeURIComponent("Club de conversación en inglés")}&subtitle=${encodeURIComponent("Inglés en la vida real, en Tehuacán")}`;

export const metadata: Metadata = {
  title: "Club de Conversación en Inglés en Tehuacán — Inglés en la Vida Real",
  description:
    "¿Y si practicar inglés fuera como salir por un café? No somos una escuela: somos un club de conversación en inglés que se reúne en persona en Tehuacán, con instructor estadounidense y grupos pequeños. Todos los niveles bienvenidos.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Club de Conversación en Inglés en Tehuacán",
    description:
      "Practicar inglés como salir por un café. Club de conversación presencial en Tehuacán con instructor estadounidense. Practica inglés hablando en situaciones reales.",
    url: URL,
    type: "website",
    locale: "es_MX",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
};

const benefits = [
  "Instructor estadounidense 🇺🇸",
  "Conversación 100% en inglés (adaptada a tu nivel)",
  "Cafeterías • Mercados • Parques • Eventos",
  "Grupos pequeños y ambiente relajado (máx. 6)",
  "Reuniones presenciales cada semana",
  "Aprende a usar IA para practicar entre reuniones",
  "Todos los niveles son bienvenidos",
];

const steps = [
  {
    icon: UserPlus,
    title: "Regístrate",
    body: "Déjanos tu nombre y teléfono. Sin pagos en línea, sin compromiso.",
  },
  {
    icon: Phone,
    title: "Te llamamos",
    body: "Te contactamos para apartar tu lugar y darte la dirección exacta del domingo.",
  },
  {
    icon: CalendarDays,
    title: "Llegas el domingo",
    body: "Nos vemos en un café, mercado o parque de Tehuacán. Como quedar con amigos, pero en inglés.",
  },
  {
    icon: MessageCircle,
    title: "Conversas",
    body: "Inglés en la vida real, adaptado a tu nivel. Practicas hablando en situaciones reales.",
  },
];

const faqs = [
  {
    q: "¿Necesito saber inglés?",
    a: "Todos los niveles son bienvenidos. La conversación se adapta a tu nivel para que participes desde el primer día, sin presión.",
  },
  {
    q: "¿Es una escuela?",
    a: "No. No somos una escuela. Somos un grupo de conversación en inglés que se reúne en persona para practicar el idioma en situaciones reales.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "$200 MXN por sesión. El pago es en persona (efectivo o transferencia). No se paga nada en línea.",
  },
  {
    q: "¿Dónde y cuándo se reúnen?",
    a: "Los domingos en Tehuacán. Rotamos por cafeterías, mercados, parques y eventos para practicar inglés en distintos lugares reales de la ciudad.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ClubConversacionPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white" style={font}>
      <LocalBusinessJsonLd />
      <CourseJsonLd
        name="Club de conversación en inglés en Tehuacán"
        description="Grupo de conversación en inglés que se reúne en persona en Tehuacán para practicar el idioma en situaciones reales, con instructor estadounidense."
        url={URL}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1729] px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute top-1/4 left-[5%] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                {
                  label: "Club de conversación en inglés",
                  href: "/club-de-conversacion-en-ingles-tehuacan",
                },
              ]}
            />
          </div>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] tracking-widest text-blue-300 uppercase">
            <Coffee className="size-3.5" /> Inglés en la vida real · Tehuacán
          </span>
          <h1 className="mb-6 text-4xl leading-[1.1] font-bold md:text-5xl">
            Club de conversación en{" "}
            <span className="text-blue-400">inglés</span>
          </h1>
          <p className="mb-4 max-w-2xl text-lg leading-relaxed text-white/60">
            ¿Y si practicar inglés fuera como salir por un café? No somos una
            escuela. Somos un grupo de conversación en inglés que se reúne en
            persona en Tehuacán para practicar el idioma en situaciones reales.
          </p>
          <p className="mb-8 text-base font-semibold text-blue-300">
            El único inglés que mejora… es el que usas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/join">
              <Button
                size="lg"
                className="rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400"
              >
                Reserva tu lugar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* No somos una escuela */}
      <section className="bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase">
            No somos una escuela
          </p>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Practicar inglés puede sentirse como{" "}
            <span className="text-blue-400">salir por un café.</span>
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/55">
            Nada de exámenes, tareas ni libros de texto. Solo un grupo pequeño
            de personas que se junta cada semana para conversar 100% en inglés,
            con un instructor estadounidense que mantiene la charla fluida y
            adaptada a tu nivel. Hablas de cosas reales, en lugares reales, y el
            idioma mejora sin que te des cuenta.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0a0a0a] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            Qué encuentras en el club
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-white/40">
            Un ambiente relajado para usar el inglés, no para estudiarlo.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                  <Check className="size-3.5 text-blue-400" />
                </span>
                <span className="text-sm leading-relaxed text-white/70">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Highlight cards */}
      <section className="bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Lugares reales",
                body: "Cafeterías, mercados, parques y eventos por Tehuacán. Practicas inglés donde de verdad se usa el idioma.",
              },
              {
                icon: Flag,
                title: "Instructor estadounidense",
                body: "Conversación 100% en inglés con un instructor nativo estadounidense que adapta la charla a tu nivel.",
              },
              {
                icon: Bot,
                title: "Practica con IA",
                body: "Aprende a usar IA para practicar inglés entre reuniones y llegar cada domingo listo para conversar.",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <span className="mb-5 flex size-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="size-5 text-blue-400" />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/45">
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0a0a] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            Cómo unirte
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-white/40">
            En cuatro pasos ya estás conversando en inglés un domingo en
            Tehuacán.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="size-5 text-blue-400" />
                  </span>
                  <span className="absolute top-6 right-6 text-2xl font-bold text-white/10">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.05] bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase">
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Lo que quieres saber
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors open:border-blue-500/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
                  {f.q}
                  <span className="ml-4 text-blue-400 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0a0a0a] px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f2544] to-[#0a1120] p-10 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 text-[11px] tracking-widest text-blue-300 uppercase">
            <Users className="size-3.5" /> Este domingo en Tehuacán
          </span>
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Ven a conversar en inglés como si salieras por un café
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Regístrate, te llamamos para apartar tu lugar y el domingo llegas a
            conversar. Grupos pequeños, instructor estadounidense, $200 MXN por
            sesión que pagas en persona.
          </p>
          <Link href="/join">
            <Button className="rounded-full bg-blue-500 px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400">
              Reserva tu lugar
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
