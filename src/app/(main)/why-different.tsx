import { MessageCircle, Users, Sparkles } from "lucide-react";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const cards = [
  {
    icon: MessageCircle,
    accent: "text-blue-400",
    ring: "bg-blue-500/10 border-blue-500/20",
    title: "Habla desde el primer día",
    body: "Las escuelas se enfocan en la gramática. Nosotros nos enfocamos en la confianza y la conversación. Menos teoría, más hablar.",
  },
  {
    icon: Users,
    accent: "text-emerald-400",
    ring: "bg-emerald-500/10 border-emerald-500/20",
    title: "Grupos pequeños",
    body: "Máximo 6 personas por grupo. Todos tienen tiempo de hablar, en un ambiente relajado donde nadie se siente juzgado.",
  },
  {
    icon: Sparkles,
    accent: "text-violet-300",
    ring: "bg-violet-500/10 border-violet-500/20",
    title: "Inglés en la vida real",
    body: "Nos reunimos en cafeterías, mercados, parques y eventos para usar el inglés en situaciones reales — no en un salón de clases.",
  },
];

export default function WhyDifferent() {
  return (
    <section
      className="border-t border-white/[0.05] bg-[#0a0a0a] px-6 py-28"
      id="por-que"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={font}
          >
            ¿Por qué somos diferentes?
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={font}
          >
            El único inglés que mejora
            <br />
            <span className="text-blue-400">es el que usas.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <span
                  className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${c.ring}`}
                >
                  <Icon className={`size-5 ${c.accent}`} />
                </span>
                <h3
                  className="mb-2 text-lg font-semibold text-white"
                  style={font}
                >
                  {c.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-white/45"
                  style={font}
                >
                  {c.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
