"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { AlertCircle, Calendar as CalendarIcon, Clock, ChevronRight, Award } from "lucide-react";
import { getCurrentStudentAction, bookIntroCallAction } from "@/app/placement-quiz/actions";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  quizResult?: {
    score: number;
    totalQuestions: number;
    completedAt: Date;
  };
}

export default function BookingPage() {
  const router = useRouter();

  // Student Details
  const [student, setStudent] = useState<StudentData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify session on load
  useEffect(() => {
    async function verifySession() {
      const res = await getCurrentStudentAction();
      if (!res.success || !res.student) {
        router.push("/signup");
        return;
      }

      // If student hasn't completed the quiz yet, redirect to question 1
      if (!res.student.quizResult) {
        router.push("/quiz/placement/question/1");
        return;
      }

      setStudent(res.student as any);
      setSessionLoading(false);
    }
    verifySession();
  }, [router]);

  if (sessionLoading || !student || !student.quizResult) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Cargando tus resultados...
      </main>
    );
  }

  // Calendar dates setup (Mon-Sat, skipping Sunday, starting tomorrow)
  const getAvailableDates = () => {
    const dates = [];
    const start = new Date();
    start.setDate(start.getDate() + 1);

    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getDay() !== 0) { // Skip Sunday
        dates.push(d);
      }
    }
    return dates;
  };

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Booking confirm handler
  const handleBookingConfirm = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError("Por favor selecciona una fecha y una hora.");
      return;
    }

    setLoading(true);
    setError(null);

    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const res = await bookIntroCallAction({
      dateTimeIso: bookingDateTime.toISOString()
    });

    setLoading(false);

    if (res.success) {
      // Navigate to confirmation page passing selected values
      const dateStr = encodeURIComponent(selectedDate.toDateString());
      const timeStr = encodeURIComponent(selectedTimeSlot);
      router.push(`/quiz/placement/confirmed?date=${dateStr}&time=${timeStr}`);
    } else {
      setError(res.error || "No se pudo agendar la sesión en este horario. Intenta con otro.");
    }
  };

  const getProficiencyLevel = (correct: number) => {
    if (correct <= 5) return { name: "Principiante (A1-A2)", desc: "Estás comenzando tu camino en el inglés. Trabajaremos en las bases de vocabulario y estructuras cotidianas básicas." };
    if (correct <= 12) return { name: "Intermedio (B1)", desc: "Puedes comunicarte en situaciones familiares, pero te falta fluidez y vocabulario más especializado. Nos enfocaremos en soltar tu conversación." };
    if (correct <= 17) return { name: "Intermedio Alto (B2)", desc: "Te expresas con relativa fluidez pero aún cometes errores en gramática compleja y expresiones idiomáticas. Perfeccionaremos tu naturalidad." };
    return { name: "Avanzado (C1-C2)", desc: "Tienes un excelente dominio del inglés. Trabajaremos en matices, vocabulario de negocios de alto nivel y acento nativo." };
  };

  const score = student.quizResult.score;
  const totalQuestions = student.quizResult.totalQuestions;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex flex-col items-center justify-center px-4 relative overflow-hidden text-white">
      {/* Glow shapes */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Content wrapper */}
      <div className="w-full max-w-xl bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Step tracker */}
        <div className="mb-6 flex justify-between items-center text-xs text-white/40 font-medium uppercase tracking-wider">
          <span>Paso 2 de 2</span>
          <span>Agenda tu Llamada Demo</span>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-slideDown">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Score analysis card */}
        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-8 flex flex-col md:flex-row items-center gap-5 animate-scaleUp">
          <div className="size-20 shrink-0 rounded-full bg-blue-500/10 border-2 border-blue-500 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-white/40 uppercase font-semibold">de {totalQuestions}</span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-base font-semibold text-white/90 mb-1 flex items-center gap-1.5 justify-center md:justify-start">
              <Award className="size-4 text-blue-400" />
              Nivel de Inglés: <span className="text-blue-400 font-bold">{getProficiencyLevel(score).name}</span>
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              {getProficiencyLevel(score).desc}
            </p>
          </div>
        </div>

        {/* Scheduler */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-2">
          <CalendarIcon className="size-5 text-blue-400" /> Agenda tu Clase Demo Gratis
        </h3>
        <p className="text-white/50 text-xs mb-6 leading-relaxed">
          Hola <strong className="text-white">{student.name}</strong>, elige el día y la hora para tu sesión introductoria de 30 minutos por WhatsApp. Conversarás directamente con Mauricio para planificar tu curso.
        </p>

        {/* Days list */}
        <div className="mb-6">
          <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" /> 1. Elige el Día
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {getAvailableDates().map((date, idx) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedDate(date); setSelectedTimeSlot(null); }}
                  className={`p-3 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/[0.06] bg-[#111827]/25 text-white/50 hover:border-white/15 hover:text-white"
                  }`}
                >
                  <span className="block text-white capitalize">
                    {date.toLocaleDateString("es-ES", { weekday: "short" })}
                  </span>
                  <span className="block text-xs font-bold mt-0.5">
                    {date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hours list */}
        {selectedDate && (
          <div className="mb-8 animate-slideDown">
            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="size-3.5" /> 2. Elige la Hora (Zona CDMX)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-white/[0.06] bg-[#111827]/25 text-white/60 hover:border-white/15 hover:text-white"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleBookingConfirm}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 mt-4 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          disabled={loading || !selectedDate || !selectedTimeSlot}
        >
          {loading ? "Confirmando..." : "Agendar Clase Demo Gratis"}
          <ChevronRight className="size-4" />
        </Button>

      </div>
    </main>
  );
}
