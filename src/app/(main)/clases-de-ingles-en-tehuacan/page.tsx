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
  MapPin,
  Wifi,
  Coffee,
  MessageSquare,
  Check,
  Compass,
} from "lucide-react";

const URL = `${BASE_URL}/clases-de-ingles-en-tehuacan`;

export const metadata: Metadata = {
  title: "Clases de Inglés en Tehuacán — Presencial y en Línea",
  description:
    "Clases de inglés en Tehuacán, Puebla: tutor nativo estadounidense, 1 a 1, presencial en cafés locales o en línea por WhatsApp. Inglés de negocios, conversación y entrevistas. Primera clase gratis.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Clases de Inglés en Tehuacán — Presencial y en Línea",
    description:
      "Tutor nativo estadounidense en Tehuacán, Puebla. Clases 1 a 1 presenciales o en línea. Primera clase gratis.",
    url: URL,
    type: "website",
    locale: "es_MX",
  },
};

const faqs = [
  {
    q: "¿Dónde se dan las clases presenciales en Tehuacán?",
    a: "Nos reunimos en cafés y espacios cómodos de Tehuacán —por ejemplo un Starbucks o una cafetería local— para practicar inglés en un ambiente real y relajado. También podemos coordinar el lugar que mejor te quede.",
  },
  {
    q: "¿Puedo tomar las clases en línea si no vivo en Tehuacán?",
    a: "Sí. Las clases en línea son por WhatsApp (video o llamada) y funcionan igual de bien estés donde estés. Muchos estudiantes combinan clases en línea entre semana y presenciales de vez en cuando.",
  },
  {
    q: "¿Quién es el tutor?",
    a: "Mauricio Tellez, estadounidense y hablante nativo de inglés, con años enseñando inglés de negocios a profesionales hispanohablantes. Aprendes a sonar natural, sin acento marcado.",
  },
  {
    q: "¿Cuánto cuestan las clases?",
    a: "La clase individual cuesta $300 MXN y el paquete de 10 clases $2,400 MXN. La primera clase de prueba es gratis para que conozcas el método.",
  },
  {
    q: "¿Qué tipo de inglés enseñas?",
    a: "Inglés real y útil: conversación, inglés de negocios, inglés para trabajo remoto y preparación para entrevistas en empresas de Estados Unidos.",
  },
];

export default function TehuacanPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <LocalBusinessJsonLd />
      <CourseJsonLd
        name="Clases de inglés en Tehuacán"
        description="Clases privadas de inglés 1 a 1 en Tehuacán, Puebla y en línea, con un tutor nativo estadounidense."
        url={URL}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1729] px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute top-1/3 right-[5%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                {
                  label: "Clases en Tehuacán",
                  href: "/clases-de-ingles-en-tehuacan",
                },
              ]}
            />
          </div>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] tracking-widest text-blue-400 uppercase">
            <MapPin className="size-3.5" /> Tehuacán, Puebla · En línea
          </span>
          <h1 className="mb-6 text-4xl leading-[1.1] font-bold md:text-5xl">
            Clases de inglés en <span className="text-blue-400">Tehuacán</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/60">
            Aprende inglés real con un tutor nativo estadounidense, aquí en
            Tehuacán. Clases 1 a 1 —presenciales en un café o en línea por
            WhatsApp— enfocadas en conversación, inglés de negocios y
            entrevistas de trabajo. Tu primera clase es gratis.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400"
              >
                Agenda tu clase gratis
              </Button>
            </Link>
            <Link href="/clases-de-ingles-experiencias">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full border border-white/10 px-7 py-6 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                Ver clases de experiencias →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section className="bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            Dos formas de tomar clases
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-white/40">
            Combínalas como quieras: practica en línea entre semana y nos vemos
            en persona en Tehuacán cuando te acomode.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <Coffee className="size-5 text-blue-400" />
                </span>
                <h3 className="text-lg font-bold">Presencial en Tehuacán</h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/50">
                Nos reunimos en un café local —un Starbucks o tu cafetería
                favorita— para conversar en inglés en un ambiente real y
                relajado. Ideal si prefieres el trato cara a cara.
              </p>
              <ul className="space-y-2">
                {[
                  "Ambiente real, sin salón de clases",
                  "Practica pedir y ordenar en inglés",
                  "Trato cercano y personal",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <Check className="size-4 shrink-0 text-blue-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                  <Wifi className="size-5 text-emerald-400" />
                </span>
                <h3 className="text-lg font-bold">En línea por WhatsApp</h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/50">
                Clases por videollamada de WhatsApp desde donde estés. La misma
                calidad 1 a 1, sin traslados y con horarios flexibles.
              </p>
              <ul className="space-y-2">
                {[
                  "Sin traslados ni tiempo perdido",
                  "Horarios flexibles",
                  "Funciona en toda la República",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <Check className="size-4 shrink-0 text-emerald-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Experiencias teaser */}
      <section className="bg-[#0a0a0a] px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1729] to-[#0a1120] p-10 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 text-[11px] tracking-widest text-blue-400 uppercase">
            <Compass className="size-3.5" /> Más que un salón
          </span>
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Clases de experiencias: inglés viviendo la vida real
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Salimos a hacer actividades cotidianas en inglés y una vez al mes
            viajamos a Puebla para practicar en un entorno nuevo: reservar
            hotel, probar comida que no encuentras en Tehuacán y ver películas
            en inglés con subtítulos en español. Aprender de verdad, viviéndolo.
          </p>
          <Link href="/clases-de-ingles-experiencias">
            <Button className="rounded-full bg-blue-500 px-7 py-5 text-sm font-semibold text-white hover:bg-blue-400">
              Conoce las clases de experiencias
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <h3 className="mb-2 font-semibold text-white">{f.q}</h3>
                <p className="text-sm leading-relaxed text-white/50">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0f1729] px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <MessageSquare className="mx-auto mb-4 size-8 text-blue-400" />
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Tu primera clase en Tehuacán es gratis
          </h2>
          <p className="mb-8 text-sm text-white/55">
            Regístrate en un minuto y agenda tu clase de prueba —presencial o en
            línea— sin ningún compromiso.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="rounded-full bg-blue-500 px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400"
            >
              Agenda tu clase gratis
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
