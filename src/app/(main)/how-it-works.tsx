"use client";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const steps = [
  {
    number: "01",
    title: "Regístrate",
    description:
      "Déjanos tu nombre y teléfono en menos de un minuto. Sin pagos en línea.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    number: "02",
    title: "Te llamamos",
    description:
      "Te contactamos para conocer tu nivel y apartar tu lugar en un grupo de máximo 6 personas.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    number: "03",
    title: "Llega al punto de encuentro",
    description:
      "Nos vemos el domingo en Tehuacán. Empezamos en Starbucks; luego rotamos por cafés, mercados y parques.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    number: "04",
    title: "Empieza a hablar",
    description:
      "Conversación 100% en inglés, adaptada a tu nivel. Te vas con más confianza y ganas de volver.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#0d1425] px-6 py-28" id="como-funciona">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={font}
          >
            Cómo funciona
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={font}
          >
            De un mensaje a hablar inglés
            <br />
            en cuatro pasos
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/40"
            style={font}
          >
            Sin trámites ni exámenes de admisión. Te registras y nosotros
            hacemos el resto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-xl border p-6 ${step.bg} backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1`}
            >
              <span
                className={`font-mono text-[11px] font-bold tracking-widest ${step.color}`}
              >
                {step.number}
              </span>
              <h3
                className={`mt-3 mb-2 text-sm font-semibold ${step.color}`}
                style={font}
              >
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-white/40" style={font}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
