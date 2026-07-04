"use client";

// TEST-ONLY checkout page. Reachable directly (e.g. via a QR) by a logged-in
// student, it runs a REAL $10 MXN Stripe purchase that still grants 1 credit,
// so the buy → credit → book funnel can be exercised for pesos instead of $300.
// Gated end-to-end by ENABLE_TEST_CHECKOUT on the server action; delete this
// folder (and unset the env var) to remove it entirely once QA is done.

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  CreditCard,
  ChevronRight,
  FlaskConical,
  AlertCircle,
} from "lucide-react";
import { getCurrentStudentAction } from "@/app/(student)/placement-quiz/actions";
import { createCheckoutSessionAction } from "@/app/(student)/student/actions";

export default function TestBuyPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getCurrentStudentAction();
      if (!res.success || !res.student) {
        router.push("/login");
        return;
      }
      setStudentName(res.student.name);
      setChecking(false);
    })();
  }, [router]);

  // bfcache restore (browser Back from Stripe) would leave the button disabled.
  useEffect(() => {
    const reset = () => setBuying(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleTestBuy = async () => {
    setBuying(true);
    setError(null);
    const res = await createCheckoutSessionAction({
      planType: "single",
      test: true,
    });
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setBuying(false);
      setError(res.error || "No se pudo iniciar el pago de prueba.");
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Verificando tu sesión…
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
          <FlaskConical className="size-3" /> Página de prueba
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          Compra de prueba
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {studentName ? `Hola, ${studentName}. ` : ""}Esta compra cobra el
          mínimo de <strong className="text-white">$10 MXN</strong> real, pero
          acredita <strong className="text-white">1 crédito</strong> igual que
          una clase individual — para probar el flujo completo de pago y
          reserva.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
              <CreditCard className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Clase individual (prueba)
              </p>
              <p className="text-2xl font-extrabold text-white">
                $10{" "}
                <span className="text-xs font-medium text-white/40">MXN</span>
              </p>
              <p className="text-[11px] text-white/40">Acredita 1 crédito</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleTestBuy}
          disabled={buying}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400 disabled:opacity-50"
        >
          {buying ? "Redirigiendo…" : "Comprar prueba ($10 MXN)"}
          <ChevronRight className="size-4" />
        </Button>

        <button
          type="button"
          onClick={() => router.push("/student")}
          className="mt-4 w-full text-center text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white"
        >
          Volver al panel
        </button>
      </div>
    </main>
  );
}
