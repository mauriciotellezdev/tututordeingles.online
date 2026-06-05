"use client";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

const plans = [
  {
    name: "Clase Individual",
    price: "$300",
    currency: "MXN",
    unit: "por clase",
    description: "Ideal para probar el método o complementar tu aprendizaje.",
    features: [
      "1 sesión privada (60 min)",
      "Material personalizado",
      "Resumen post-clase",
      "Soporte por correo",
    ],
    cta: "Comprar clase",
    highlight: false,
    badge: "Introducción · Sin compromiso",
  },
  {
    name: "Paquete 10 Clases",
    price: "$2,400",
    currency: "MXN",
    unit: "10 clases en total",
    description:
      "La forma más efectiva de avanzar. Compromiso real, resultados reales.",
    features: [
      "8 clases pagadas + 2 clases gratis",
      "Plan de aprendizaje personalizado",
      "Soporte por WhatsApp entre clases",
      "Seguimiento de progreso",
      "Materiales exclusivos",
    ],
    cta: "Empezar ahora",
    highlight: true,
    badge: "Más popular · 2 gratis",
  },
];

export default function Pricing() {
  return (
    <section
      className="border-t border-white/[0.05] bg-[#0d1425] px-6 py-28"
      id="precios"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Precios
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Inversión clara,{" "}
            <span className="text-blue-400">sin sorpresas.</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-sm text-sm text-white/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Todos los precios en MXN. Pago seguro con tarjeta a través de
            Stripe.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-transform duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "border-blue-500/30 bg-blue-500/10"
                  : "border-white/[0.08] bg-[#1a2a50]/40"
              }`}
            >
              {plan.badge && (
                <Badge className="mb-5 self-start rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-[10px] font-medium tracking-widest text-blue-300 uppercase">
                  {plan.badge}
                </Badge>
              )}

              <p
                className="mb-3 text-xs tracking-widest text-white/40 uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.name}
              </p>

              <div className="mb-1 flex items-end gap-2">
                <span
                  className="text-5xl font-bold text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.price}
                </span>
                <span
                  className="mb-2 text-sm text-white/30"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.currency}
                </span>
              </div>
              <p
                className="mb-5 text-xs text-white/25"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.unit}
              </p>

              <p
                className="mb-7 text-sm leading-relaxed text-white/45"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.description}
              </p>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => {
                  const hasCorreo = /correo/i.test(f);
                  return (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-xs text-white/50"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <span className="text-base leading-none text-blue-400">
                        ✓
                      </span>
                      {hasCorreo ? (
                        <>
                          {f.replace(/correo/i, "")}
                          <a
                            href={`mailto:mauricio@tututordeingles.online`}
                            className="text-white/60 underline"
                          >
                            {f.match(/correo/i)?.[0] ?? "correo"}
                          </a>
                        </>
                      ) : (
                        f
                      )}
                    </li>
                  );
                })}
              </ul>

              <a
                href={`mailto:mauricio@tututordeingles.online?subject=${encodeURIComponent(plan.name)}`}
              >
                <Button
                  className={
                    plan.highlight
                      ? "rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] hover:bg-blue-400"
                      : "rounded-full border border-white/10 bg-white/5 py-6 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-white/10"
                  }
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.cta}
                </Button>
              </a>
            </div>
          ))}
        </div>

        <p
          className="mt-8 text-center text-xs text-white/20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-white/20 underline hover:text-white/40"
          >
            ¿Tienes preguntas? Escríbeme por correo antes de comprar.
          </a>
        </p>
      </div>
    </section>
  );
}
