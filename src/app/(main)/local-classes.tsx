import Link from "next/link";
import { Coffee, Wifi, Compass, ArrowRight } from "lucide-react";

const options = [
  {
    icon: Coffee,
    accent: "text-blue-400",
    ring: "bg-blue-500/10 border-blue-500/20",
    title: "Presencial en Tehuacán",
    body: "Nos vemos en un café local para practicar inglés cara a cara, en un ambiente real y relajado.",
    href: "/clases-de-ingles-en-tehuacan",
    cta: "Clases en Tehuacán",
  },
  {
    icon: Wifi,
    accent: "text-emerald-400",
    ring: "bg-emerald-500/10 border-emerald-500/20",
    title: "En línea por WhatsApp",
    body: "La misma clase 1 a 1 desde donde estés, con horarios flexibles y sin traslados.",
    href: "/clases-de-ingles-en-tehuacan",
    cta: "Ver modalidad en línea",
  },
  {
    icon: Compass,
    accent: "text-violet-300",
    ring: "bg-violet-500/10 border-violet-500/20",
    title: "Clases de experiencias",
    body: "Salidas por Tehuacán y viajes mensuales a Puebla: inglés viviendo la vida real.",
    href: "/clases-de-ingles-experiencias",
    cta: "Conoce las experiencias",
  },
];

export default function LocalClasses() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-28" id="modalidades">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase">
            Tehuacán · En línea · Experiencias
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Aprende inglés como mejor
            <br />
            te acomode en Tehuacán
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/40">
            Presencial en un café, en línea por WhatsApp o viviendo la vida real
            en nuestras salidas. Tú eliges cómo practicar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {options.map((o) => {
            const Icon = o.icon;
            return (
              <Link
                key={o.title}
                href={o.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <span
                  className={`size-12 rounded-xl border ${o.ring} mb-5 flex items-center justify-center`}
                >
                  <Icon className={`size-5 ${o.accent}`} />
                </span>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {o.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-white/45">
                  {o.body}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${o.accent}`}
                >
                  {o.cta}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
