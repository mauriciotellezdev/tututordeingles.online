"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawDate = searchParams.get("date");
  const rawTime = searchParams.get("time");

  const getFormattedSelectedDateTime = () => {
    if (!rawDate || !rawTime) return "";
    const dateObj = new Date(rawDate);
    const dateStr = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    return `${dateStr} a las ${rawTime}`;
  };

  return (
    <div className="w-full max-w-xl bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 text-center py-10 animate-scaleUp">
      <div className="size-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="size-8 text-green-400" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
        ¡Clase demo agendada con éxito!
      </h2>
      <p className="text-white/50 text-sm mb-6 leading-relaxed max-w-md mx-auto">
        Te hemos enviado un correo de confirmación con los detalles y una invitación de calendario (.ics).
      </p>

      {rawDate && rawTime && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left mb-8 max-w-md mx-auto">
          <div className="mb-2">
            <span className="text-[10px] text-white/35 font-semibold uppercase tracking-wider block">Fecha y Hora</span>
            <span className="text-sm font-bold text-white capitalize">{getFormattedSelectedDateTime()}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/35 font-semibold uppercase tracking-wider block">Plataforma</span>
            <span className="text-sm font-semibold text-blue-400">WhatsApp (Número en tu correo)</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => router.push("/student")}
        className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 py-6 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
      >
        Ir a mi Panel de Control
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex flex-col items-center justify-center px-4 relative overflow-hidden text-white">
      {/* Glow shapes */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-xl bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 text-center py-10">
          <p className="text-white/50 text-sm">Cargando confirmación...</p>
        </div>
      }>
        <BookingConfirmationContent />
      </Suspense>
    </main>
  );
}
