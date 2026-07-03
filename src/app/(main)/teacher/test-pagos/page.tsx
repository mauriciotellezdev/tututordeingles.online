"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { createTestCheckoutAction } from "./actions";
import { CreditCard, Store, Landmark, ArrowLeft } from "lucide-react";

const METHODS: {
  key: "card" | "oxxo" | "spei";
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "card", label: "Tarjeta", desc: "Débito o crédito", icon: CreditCard },
  {
    key: "oxxo",
    label: "OXXO",
    desc: "Pago en efectivo (voucher)",
    icon: Store,
  },
  {
    key: "spei",
    label: "SPEI",
    desc: "Transferencia bancaria",
    icon: Landmark,
  },
];

function TestPagos() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ok = searchParams.get("ok") === "1";
  const cancel = searchParams.get("cancel") === "1";

  const start = async (method: "card" | "oxxo" | "spei") => {
    setLoading(method);
    setError(null);
    const res = await createTestCheckoutAction({ method });
    if (res.success && res.url) {
      window.location.assign(res.url);
      return;
    }
    setLoading(null);
    const message = res.success
      ? "No se pudo iniciar el pago de prueba."
      : res.error;
    setError(message);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-24 pb-16 text-white md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Pagos de <span className="text-blue-400">prueba</span>
            </h1>
            <p className="mt-1 text-xs text-white/40">
              Solo para el administrador · $10 MXN (mínimo de Stripe) por prueba
            </p>
          </div>
          <Link href="/teacher">
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="size-4" /> Panel
            </Button>
          </Link>
        </div>

        {ok && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            Pago iniciado/completado. Revisa el panel de Stripe para confirmar
            que llegó. (OXXO/SPEI se confirman cuando pagas el
            voucher/transferencia.)
          </div>
        )}
        {cancel && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Prueba cancelada. No se realizó ningún cargo.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.key}
                className="rounded-2xl border-white/[0.08] bg-[#0f1729]/40"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <span className="mb-3 flex size-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="size-5 text-blue-400" />
                  </span>
                  <p className="text-sm font-bold text-white">{m.label}</p>
                  <p className="mt-0.5 mb-4 text-[11px] text-white/40">
                    {m.desc}
                  </p>
                  <Button
                    onClick={() => start(m.key)}
                    disabled={loading !== null}
                    className="w-full rounded-full bg-blue-500 py-4 text-xs font-semibold text-white hover:bg-blue-400"
                  >
                    {loading === m.key ? "Redirigiendo…" : "Probar $10"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/30">
          Estos cobros son reales pero mínimos. No otorgan créditos (el webhook
          los ignora). Reembólsalos desde Stripe si quieres recuperar los $10.
        </p>
      </div>
    </main>
  );
}

export default function TestPagosPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
          Cargando…
        </main>
      }
    >
      <TestPagos />
    </Suspense>
  );
}
