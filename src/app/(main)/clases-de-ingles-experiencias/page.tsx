import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";
import { CourseJsonLd } from "@/shared/seo/local-business-jsonld";
import { BASE_URL } from "@/shared/seo/business";
import {
  Compass,
  Bus,
  Hotel,
  UtensilsCrossed,
  Film,
  ShoppingBag,
  MapPin,
} from "lucide-react";

const URL = `${BASE_URL}/clases-de-ingles-experiencias`;

export const metadata: Metadata = {
  title: "Clases de Inglés de Experiencias — Salidas y Viajes en Tehuacán",
  description:
    "Aprende inglés viviéndolo: salidas por Tehuacán haciendo actividades reales en inglés y viajes mensuales a Puebla —hotel, comida y películas en inglés con subtítulos. Inmersión real con tu tutor nativo.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Clases de Inglés de Experiencias — Salidas y Viajes",
    description:
      "Inglés en la vida real: salidas por Tehuacán y viajes mensuales a Puebla con tu tutor nativo. Inmersión de verdad.",
    url: URL,
    type: "website",
    locale: "es_MX",
  },
};

const experiences = [
  {
    icon: ShoppingBag,
    title: "Actividades de la vida real",
    body: "Salimos a hacer cosas cotidianas —comprar, pedir en un café, ir al mercado— usando solo inglés. Practicas el idioma en el momento en que lo necesitas, no en un libro.",
  },
  {
    icon: Bus,
    title: "Viaje mensual a Puebla",
    body: "Una vez al mes viajamos a Puebla para practicar inglés en un entorno nuevo. Un día completo de inmersión fuera de tu rutina, donde todo pasa en inglés.",
  },
  {
    icon: Hotel,
    title: "Reservar y hospedarte en inglés",
    body: "Aprendes a reservar hotel, hacer check-in y resolver situaciones de viaje reales en inglés —justo como lo harías en un viaje a Estados Unidos.",
  },
  {
    icon: UtensilsCrossed,
    title: "Comida que no hay en Tehuacán",
    body: "Probamos platillos y lugares que no encuentras en Tehuacán, y describimos, pedimos y conversamos sobre la experiencia completamente en inglés.",
  },
  {
    icon: Film,
    title: "Cine en inglés",
    body: "Vemos películas en inglés con subtítulos en español y luego las comentamos. Entrenas el oído con inglés real y aprendes expresiones que se usan de verdad.",
  },
  {
    icon: Compass,
    title: "Inmersión sin salir del país",
    body: "Todo el paquete está diseñado para darte la experiencia de vivir en inglés sin necesidad de viajar al extranjero. Aprender haciéndolo.",
  },
];

export default function ExperiencesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <CourseJsonLd
        name="Clases de inglés de experiencias"
        description="Clases de inglés vivenciales: salidas por Tehuacán y viajes mensuales a Puebla con inmersión total en inglés."
        url={URL}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1729] px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute top-1/4 left-[5%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[90px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                {
                  label: "Clases de experiencias",
                  href: "/clases-de-ingles-experiencias",
                },
              ]}
            />
          </div>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-[11px] tracking-widest text-violet-300 uppercase">
            <Compass className="size-3.5" /> Inglés viviendo la vida real
          </span>
          <h1 className="mb-6 text-4xl leading-[1.1] font-bold md:text-5xl">
            Clases de inglés de{" "}
            <span className="text-blue-400">experiencias</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/60">
            El aula más grande es la vida real. Salimos por Tehuacán a hacer
            actividades cotidianas en inglés y una vez al mes viajamos a Puebla
            para una inmersión completa: reservar hotel, probar comida que no
            hay aquí y ver películas en inglés con subtítulos en español.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-full bg-blue-500 px-7 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400"
              >
                Quiero unirme
              </Button>
            </Link>
            <Link href="/clases-de-ingles-en-tehuacan">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full border border-white/10 px-7 py-6 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                Ver clases en Tehuacán →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#0d1425] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            Qué incluye la experiencia
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-white/40">
            Cada salida es una clase disfrazada de aventura. Aprendes sin darte
            cuenta porque estás usando el inglés de verdad.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => {
              const Icon = exp.icon;
              return (
                <div
                  key={exp.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="size-5 text-blue-400" />
                  </span>
                  <h3 className="mb-2 font-semibold text-white">{exp.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {exp.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Puebla highlight */}
      <section className="bg-[#0a0a0a] px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#161033] to-[#0a1120] p-10">
          <span className="mb-4 inline-flex items-center gap-1.5 text-[11px] tracking-widest text-violet-300 uppercase">
            <MapPin className="size-3.5" /> Una vez al mes
          </span>
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Un día completo en Puebla, todo en inglés
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/55 md:text-base">
            Salir de la rutina acelera el aprendizaje. Nuestro viaje mensual a
            Puebla es una inmersión real: desde que subimos al transporte hasta
            que regresamos, la meta es pensar y comunicarnos en inglés.
            Reservas, comida, cine y conversación — la clase de inglés más
            divertida que vas a tomar.
          </p>
          <Link href="/signup">
            <Button className="rounded-full bg-blue-500 px-7 py-5 text-sm font-semibold text-white hover:bg-blue-400">
              Agenda tu primera clase gratis
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
