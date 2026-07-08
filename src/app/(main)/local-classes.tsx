import Link from "next/link";
import {
  Coffee,
  ShoppingBasket,
  Trees,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const venues = [
  {
    icon: Coffee,
    accent: "text-blue-400",
    ring: "bg-blue-500/10 border-blue-500/20",
    title: "Cafeterías",
    body: "Empezamos en Starbucks. Practicar inglés como si salieras por un café.",
  },
  {
    icon: ShoppingBasket,
    accent: "text-emerald-400",
    ring: "bg-emerald-500/10 border-emerald-500/20",
    title: "Mercados",
    body: "Vocabulario real: pedir, negociar y describir, usando el inglés en la calle.",
  },
  {
    icon: Trees,
    accent: "text-violet-300",
    ring: "bg-violet-500/10 border-violet-500/20",
    title: "Parques",
    body: "Conversación al aire libre, relajada, para soltarte sin la presión de un salón.",
  },
  {
    icon: PartyPopper,
    accent: "text-amber-400",
    ring: "bg-amber-500/10 border-amber-500/20",
    title: "Eventos",
    body: "Salidas y actividades por Tehuacán donde el inglés se vuelve parte del plan.",
  },
];

export default function LocalClasses() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-28" id="lugares">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={font}
          >
            Inglés en la vida real
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={font}
          >
            Aprendes usando el inglés,
            <br />
            no estudiándolo
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/40"
            style={font}
          >
            Cada domingo nos reunimos en un lugar distinto de Tehuacán para
            practicar inglés en situaciones reales.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <span
                  className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${v.ring}`}
                >
                  <Icon className={`size-5 ${v.accent}`} />
                </span>
                <h3
                  className="mb-2 text-lg font-semibold text-white"
                  style={font}
                >
                  {v.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-white/45"
                  style={font}
                >
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-white/25" style={font}>
          <Link
            href="/club-de-conversacion-en-ingles-tehuacan"
            className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300"
          >
            Conoce el club de conversación en inglés en Tehuacán
            <ArrowRight className="size-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
