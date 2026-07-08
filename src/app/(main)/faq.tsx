import Link from "next/link";

const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const faqs = [
  {
    q: "¿Necesito saber inglés?",
    a: "No. Tenemos grupos para principiantes. La conversación se adapta a tu nivel para que participes desde el primer día.",
  },
  {
    q: "¿Es una escuela?",
    a: "No. Somos un club de conversación enfocado en hablar. Nada de exámenes, tareas ni libros de texto.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "$200 por sesión. El pago es en persona (efectivo o transferencia). No se paga nada en línea.",
  },
  {
    q: "¿Cuántas personas hay por grupo?",
    a: "Máximo 6 personas, para que todos tengan tiempo de hablar en un ambiente relajado.",
  },
  {
    q: "¿Dónde y cuándo se reúnen?",
    a: "Los domingos en Tehuacán, a las 11:00 AM y a las 5:00 PM. Empezamos en Starbucks y luego rotamos por cafés, mercados, parques y eventos.",
  },
  {
    q: "¿Cómo me uno?",
    a: "Déjanos tu nombre y teléfono en el registro. Te llamamos para apartar tu lugar y darte la dirección exacta del domingo.",
  },
];

export default function Faq() {
  return (
    <section
      className="border-t border-white/[0.05] bg-[#0d1425] px-6 py-28"
      id="preguntas"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={font}
          >
            Preguntas frecuentes
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={font}
          >
            Lo que quieres saber
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors open:border-blue-500/20"
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white"
                style={font}
              >
                {f.q}
                <span className="ml-4 text-blue-400 transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p
                className="mt-3 text-sm leading-relaxed text-white/50"
                style={font}
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/join"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-400"
            style={font}
          >
            Reserva tu lugar
          </Link>
        </div>
      </div>
    </section>
  );
}
