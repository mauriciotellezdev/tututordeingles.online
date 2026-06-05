"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  Award,
} from "lucide-react";
import {
  getCurrentStudentAction,
  bookIntroCallAction,
  getBookedSlotsAction,
} from "@/app/(student)/placement-quiz/actions";

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

  const [student, setStudent] = useState<StudentData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      const res = await getBookedSlotsAction({
        dateIso: selectedDate.toISOString(),
        timeZone,
      });
      if (res.success) setBookedSlots(res.bookedSlots);
    })();
  }, [selectedDate, timeZone]);

  // Verify session on load
  useEffect(() => {
    async function verifySession() {
      const res = await getCurrentStudentAction();
      if (!res.success || !res.student) {
        router.push("/signup");
        return;
      }

      if (!res.student.quizResult) {
        router.push("/quiz/placement/question/1");
        return;
      }

      setStudent({
        _id: res.student._id,
        name: res.student.name,
        email: res.student.email,
        phone: res.student.phone,
        quizResult: res.student.quizResult,
      });
      setSessionLoading(false);
    }
    verifySession();
  }, [router]);

  if (sessionLoading || !student || !student.quizResult) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Cargando tus resultados...
      </main>
    );
  }

  const getAvailableDates = () => {
    const dates = [];
    const start = new Date();
    start.setDate(start.getDate() + 1);

    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getDay() !== 0) {
        dates.push(d);
      }
    }
    return dates;
  };

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

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
      dateTimeIso: bookingDateTime.toISOString(),
    });

    setLoading(false);

    if (res.success) {
      const dateStr = encodeURIComponent(selectedDate.toDateString());
      const timeStr = encodeURIComponent(selectedTimeSlot);
      router.push(`/quiz/placement/confirmed?date=${dateStr}&time=${timeStr}`);
    } else {
      setError(
        res.error ||
          "No se pudo agendar la sesión en este horario. Intenta con otro."
      );
    }
  };

  const getProficiencyLevel = (correct: number) => {
    if (correct <= 5)
      return {
        name: "Principiante (A1-A2)",
        desc: "Estás comenzando tu camino en el inglés. Trabajaremos en las bases de vocabulario y estructuras cotidianas básicas.",
      };
    if (correct <= 12)
      return {
        name: "Intermedio (B1)",
        desc: "Puedes comunicarte en situaciones familiares, pero te falta fluidez y vocabulario más especializado. Nos enfocaremos en soltar tu conversación.",
      };
    if (correct <= 17)
      return {
        name: "Intermedio Alto (B2)",
        desc: "Te expresas con relativa fluidez pero aún cometes errores en gramática compleja y expresiones idiomáticas. Perfeccionaremos tu naturalidad.",
      };
    return {
      name: "Avanzado (C1-C2)",
      desc: "Tienes un excelente dominio del inglés. Trabajaremos en matices, vocabulario de negocios de alto nivel y acento nativo.",
    };
  };

  const score = student.quizResult.score;
  const totalQuestions = student.quizResult.totalQuestions;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="animate-fadeIn relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="mb-6 flex items-center justify-between text-xs font-medium tracking-wider text-white/40 uppercase">
          <span>Paso 2 de 2</span>
          <span>Agenda tu Llamada Demo</span>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive animate-slideDown mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="animate-scaleUp mb-8 flex flex-col items-center gap-5 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5 md:flex-row">
          <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500/10">
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-[10px] font-semibold text-white/40 uppercase">
              de {totalQuestions}
            </span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-1 flex items-center justify-center gap-1.5 text-base font-semibold text-white/90 md:justify-start">
              <Award className="size-4 text-blue-400" />
              Nivel de Inglés:{" "}
              <span className="font-bold text-blue-400">
                {getProficiencyLevel(score).name}
              </span>
            </h4>
            <p className="text-xs leading-relaxed text-white/50">
              {getProficiencyLevel(score).desc}
            </p>
          </div>
        </div>

        <h3 className="mb-2 flex items-center gap-2 text-xl leading-tight font-bold text-white md:text-2xl">
          <CalendarIcon className="size-5 text-blue-400" /> Agenda tu Clase Demo
          Gratis
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-white/50">
          Hola <strong className="text-white">{student.name}</strong>, elige el
          día y la hora para tu sesión introductoria de 30 minutos por WhatsApp.
          Conversarás directamente con Mauricio para planificar tu curso.
        </p>

        <div className="mb-6">
          <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
            <CalendarIcon className="size-3.5" /> 1. Elige el Día
          </label>
          <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {getAvailableDates().map((date, idx) => {
              const isSelected =
                selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTimeSlot(null);
                  }}
                  className={`rounded-xl border p-3 text-center text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/[0.06] bg-[#111827]/25 text-white/50 hover:border-white/15 hover:text-white"
                  }`}
                >
                  <span className="block text-white capitalize">
                    {date.toLocaleDateString("es-ES", { weekday: "short" })}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold">
                    {date.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="animate-slideDown mb-8">
            <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
              <Clock className="size-3.5" /> 2. Elige la Hora (Tu zona horaria)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                      isBooked
                        ? "cursor-not-allowed border-white/[0.03] bg-white/[0.02] text-white/20 line-through"
                        : isSelected
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

        <Button
          onClick={handleBookingConfirm}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
          disabled={loading || !selectedDate || !selectedTimeSlot}
        >
          {loading ? "Confirmando..." : "Agendar Clase Demo Gratis"}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </main>
  );
}
