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
    badge: null,
  },
  {
    name: "Paquete 10 Clases",
    price: "$2,400",
    currency: "MXN",
    unit: "12 clases en total",
    description:
      "La forma más efectiva de avanzar. Compromiso real, resultados reales.",
    features: [
      "10 clases + 2 clases gratis",
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
    <section className="bg-[#0d1425] py-28 px-6 border-t border-white/[0.05]" id="precios">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-blue-400 text-[11px] tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Precios
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Inversión clara,{" "}
            <span className="text-blue-400">sin sorpresas.</span>
          </h2>
          <p
            className="text-white/40 text-sm mt-4 max-w-sm mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Todos los precios en MXN. Pago seguro con tarjeta a través de
            Stripe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-[#1a2a50]/40 border-white/[0.08]"
              }`}
            >
              {plan.badge && (
                <Badge className="self-start mb-5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 text-[10px] tracking-widest uppercase font-medium">
                  {plan.badge}
                </Badge>
              )}

              <p
                className="text-white/40 text-xs tracking-widest uppercase mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.name}
              </p>

              <div className="flex items-end gap-2 mb-1">
                <span
                  className="text-white text-5xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-white/30 text-sm mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.currency}
                </span>
              </div>
              <p
                className="text-white/25 text-xs mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.unit}
              </p>

              <p
                className="text-white/45 text-sm leading-relaxed mb-7"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.description}
              </p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-white/50 text-xs"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <span className="text-blue-400 text-base leading-none">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={
                  plan.highlight
                    ? "bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.01] shadow-lg shadow-blue-500/25"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-6 text-sm font-medium tracking-wide transition-all duration-300"
                }
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p
          className="text-center text-white/20 text-xs mt-8"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          ¿Tienes preguntas? Escríbeme por WhatsApp antes de comprar.
        </p>
      </div>
    </section>
  );
}
