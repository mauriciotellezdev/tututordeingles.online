"use client";

const steps = [
  {
    number: "01",
    title: "Conversación libre",
    description:
      "Practicamos conversación real desde el primer día. Sin ejercicios aburridos — solo inglés que usas.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    number: "02",
    title: "Correcciones selectivas",
    description:
      "Tu tutor corrige solo lo que importa para no interrumpir tu fluidez. Aprendes sin bloquearte.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    number: "03",
    title: "Vocabulario en contexto",
    description:
      "Nuevo vocabulario ligado a conversaciones reales, no listas. Así se queda en la memoria.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    number: "04",
    title: "Pronunciación natural",
    description:
      "Trabajamos ritmo, entonación y acento americano para que suenes seguro y claro.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    number: "05",
    title: "Tarea práctica",
    description:
      "Actividades cortas entre sesiones para consolidar lo aprendido sin que te tome horas.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#0d1425] py-28 px-6" id="como-funciona">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-blue-400 text-[11px] tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cómo funciona el proceso
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cada sesión sigue una
            <br />
            estructura comprobada
          </h2>
          <p
            className="text-white/40 text-sm mt-4 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cinco fases diseñadas para maximizar tu tiempo de habla y resultados
            reales en cada clase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-xl border p-6 ${step.bg} backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1`}
            >
              <span
                className={`text-[11px] font-bold tracking-widest ${step.color} font-mono`}
              >
                {step.number}
              </span>
              <h3
                className={`text-white font-semibold text-sm mt-3 mb-2 ${step.color}`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {step.title}
              </h3>
              <p
                className="text-white/40 text-xs leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
