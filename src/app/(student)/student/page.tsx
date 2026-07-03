"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  getStudentDashboardDataAction,
  verifyPaymentAction,
  createCheckoutSessionAction,
  bookSessionAction,
  getBookedSlotsAction,
  cancelSessionAction,
  rescheduleSessionAction,
} from "./actions";
import {
  trackBeginCheckout,
  trackBooking,
  trackPurchase,
} from "@/shared/analytics/track";
import {
  Copy,
  Link2,
  Send,
  Gift,
  Users,
  BadgeCheck,
  CreditCard,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  credits: number;
  quizResult?: {
    score: number;
    totalQuestions: number;
    completedAt: Date;
  };
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalInvites: number;
  paidConversions: number;
  creditsEarned: number;
  pendingConversions: number;
}

interface SessionData {
  _id: string;
  type: "intro" | "tutoring";
  dateTime: string;
  duration: number;
  meetingLink?: string;
  status: string;
  paid?: boolean;
}

const TIME_SLOTS = [
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

function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);
  for (let i = 0; i < 10; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
}

function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [teacherPhone, setTeacherPhone] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState<"single" | "package" | null>(null);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const verifiedSession = useRef<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const res = await getStudentDashboardDataAction();
    setLoading(false);
    if (res.success && res.student) {
      setStudent(res.student);
      setReferral((res as { referral?: ReferralData }).referral ?? null);
      setSessions(
        (res as { upcomingSessions?: SessionData[] }).upcomingSessions ?? []
      );
      setTeacherPhone(
        (res as { teacher?: { phone?: string } }).teacher?.phone ?? ""
      );
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh available slots when a date is picked
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

  // Handle Stripe checkout return
  useEffect(() => {
    const success = searchParams.get("checkout_success");
    const cancel = searchParams.get("checkout_cancel");
    const plan = searchParams.get("plan");
    const sessionId = searchParams.get("session_id");

    if (cancel === "true") {
      setTimeout(() => {
        setStatusMessage({
          type: "error",
          text: "La compra fue cancelada. No se realizó ningún cargo.",
        });
      }, 0);
      router.replace("/student");
      return;
    }

    if (success === "true" && sessionId && plan && student) {
      if (verifiedSession.current === sessionId) return;
      verifiedSession.current = sessionId;
      (async () => {
        const verifyRes = await verifyPaymentAction({
          sessionId,
          studentId: student._id,
          planType: plan as "single" | "package",
        });
        if (verifyRes.success) {
          trackPurchase(plan as "single" | "package");
          setStatusMessage({
            type: "success",
            text:
              verifyRes.message ||
              `¡Compra procesada con éxito! Tus créditos han sido actualizados.`,
          });
          loadDashboardData();
        } else {
          setStatusMessage({
            type: "error",
            text: verifyRes.error || "Error al verificar el pago.",
          });
        }
        router.replace("/student");
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, student]);

  const getProficiencyLevel = (correct: number) => {
    if (correct <= 5)
      return {
        name: "Principiante (A1-A2)",
        desc: "Estás comenzando. Trabajaremos en bases sólidas.",
      };
    if (correct <= 12)
      return {
        name: "Intermedio (B1)",
        desc: "Puedes comunicarte pero falta fluidez. Enfocado en hablar.",
      };
    if (correct <= 17)
      return {
        name: "Intermedio Alto (B2)",
        desc: "Relativamente fluido, corregiremos gramática y naturalidad.",
      };
    return {
      name: "Avanzado (C1-C2)",
      desc: "Excelente dominio. Perfeccionaremos negocios y acento.",
    };
  };

  const copyReferralLink = async () => {
    if (!referral?.referralLink) return;
    await navigator.clipboard.writeText(referral.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = async (planType: "single" | "package") => {
    setBuying(planType);
    setStatusMessage(null);
    trackBeginCheckout(planType);
    const res = await createCheckoutSessionAction({ planType });
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setBuying(null);
      setStatusMessage({
        type: "error",
        text: res.error || "No se pudo iniciar el pago. Intenta de nuevo.",
      });
    }
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    setBooking(true);
    setStatusMessage(null);
    const dateTime = new Date(selectedDate);
    const [h, m] = selectedTimeSlot.split(":").map(Number);
    dateTime.setHours(h, m, 0, 0);

    const res = await bookSessionAction({
      type: "tutoring",
      dateTimeIso: dateTime.toISOString(),
    });
    setBooking(false);
    if (res.success) {
      trackBooking("tutoring");
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setStatusMessage({
        type: "success",
        text: "¡Clase agendada! Te enviamos la confirmación por correo. Nos vemos por WhatsApp.",
      });
      loadDashboardData();
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "No se pudo agendar. Intenta otro horario.",
      });
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Cargando tu panel de control...
      </main>
    );
  }

  if (!student) return null;

  const hasCredits = student.credits > 0;

  return (
    <main
      data-testid="student-dashboard"
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white md:px-8"
    >
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        {statusMessage && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              statusMessage.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Hola, <span className="text-blue-400">{student.name}</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/40">
            Compra créditos y agenda tus clases de inglés con Mauricio.
          </p>
        </div>

        {/* Credits + Buy */}
        <Card
          data-testid="credits-card"
          className="mb-6 overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl"
        >
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                  <CreditCard className="size-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                    Tus créditos
                  </p>
                  <p className="text-3xl font-extrabold text-white">
                    {student.credits}
                  </p>
                </div>
              </div>
              <p className="max-w-[9rem] text-right text-[11px] text-white/35">
                1 crédito = 1 clase privada de 60 min
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleBuy("single")}
                disabled={buying !== null}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:border-blue-500/40 hover:bg-blue-500/[0.06] disabled:opacity-50"
              >
                <p className="text-sm font-bold text-white">Clase individual</p>
                <p className="mt-0.5 text-2xl font-extrabold text-white">
                  $300{" "}
                  <span className="text-xs font-medium text-white/40">MXN</span>
                </p>
                <p className="mt-1 text-[11px] text-white/40">1 crédito</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                  {buying === "single" ? "Redirigiendo…" : "Comprar"}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>

              <button
                onClick={() => handleBuy("package")}
                disabled={buying !== null}
                className="group relative rounded-xl border border-blue-500/30 bg-blue-500/[0.06] p-4 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/10 disabled:opacity-50"
              >
                <span className="absolute top-3 right-3 rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-blue-300 uppercase">
                  Mejor valor
                </span>
                <p className="text-sm font-bold text-white">
                  Paquete 10 clases
                </p>
                <p className="mt-0.5 text-2xl font-extrabold text-white">
                  $2,400{" "}
                  <span className="text-xs font-medium text-white/40">MXN</span>
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  10 créditos · 8 pagadas + 2 gratis
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                  {buying === "package" ? "Redirigiendo…" : "Comprar"}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-white/30">
              Pago seguro con Stripe · tarjeta, transferencia SPEI u OXXO
            </p>
          </CardContent>
        </Card>

        {/* Book a class */}
        <Card
          data-testid="booking-card"
          className="mb-6 overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl"
        >
          <CardContent className="p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                <CalendarIcon className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                  Agenda una clase
                </p>
                <h2 className="text-lg font-bold text-white">
                  Reserva tu próxima sesión
                </h2>
              </div>
            </div>

            {!hasCredits ? (
              <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-center">
                <Sparkles className="mx-auto mb-2 size-6 text-blue-400/60" />
                <p className="text-sm font-semibold text-white/80">
                  Necesitas créditos para agendar
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Compra una clase o un paquete arriba y podrás elegir tu
                  horario.
                </p>
              </div>
            ) : (
              <>
                <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                  <CalendarIcon className="size-3.5" /> 1. Elige el día
                </label>
                <div className="mb-5 grid max-h-40 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
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
                          {date.toLocaleDateString("es-ES", {
                            weekday: "short",
                          })}
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

                {selectedDate && (
                  <div className="mb-5">
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                      <Clock className="size-3.5" /> 2. Elige la hora (tu zona
                      horaria)
                    </label>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {TIME_SLOTS.map((slot) => {
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
                  onClick={confirmBooking}
                  disabled={booking || !selectedDate || !selectedTimeSlot}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
                >
                  {booking ? "Confirmando…" : "Agendar clase (1 crédito)"}
                  <ChevronRight className="size-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        {sessions.length > 0 && (
          <Card
            data-testid="sessions-card"
            className="mb-6 overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl"
          >
            <CardContent className="p-6 md:p-8">
              <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                Próximas clases
              </p>
              <div className="space-y-3">
                {sessions.map((s) => {
                  const d = new Date(s.dateTime);
                  return (
                    <div
                      key={s._id}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white capitalize">
                            {d.toLocaleDateString("es-MX", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              timeZone: "America/Mexico_City",
                            })}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            {d.toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                              timeZone: "America/Mexico_City",
                            })}{" "}
                            hrs (CDMX) ·{" "}
                            {s.type === "intro"
                              ? "Clase demo"
                              : "Clase privada"}{" "}
                            · {s.duration} min
                          </p>
                        </div>
                        {teacherPhone && (
                          <a
                            href={`https://wa.me/${teacherPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-3 py-2 text-xs font-semibold text-[#25d366] transition-colors hover:bg-[#25d366]/20"
                          >
                            <MessageSquare className="size-3.5" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                      <SessionActions
                        sessionId={s._id}
                        onChanged={(msg) => {
                          setStatusMessage(msg);
                          loadDashboardData();
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {student.quizResult && (
          <Card
            data-testid="quiz-result-card"
            className="mb-6 rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl"
          >
            <CardContent className="flex items-center gap-4 p-6 md:p-8">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
                <span className="text-lg font-bold text-white">
                  {student.quizResult.score}
                </span>
                <span className="text-[8px] font-semibold text-white/40 uppercase">
                  de {student.quizResult.totalQuestions}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                  Tu nivel de inglés
                </h4>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {getProficiencyLevel(student.quizResult.score).name}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {getProficiencyLevel(student.quizResult.score).desc}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {referral && (
          <Card
            data-testid="referral-card"
            className="mb-6 overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl"
          >
            <CardContent className="space-y-5 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                  <Gift className="size-5 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-blue-400 uppercase">
                    Programa de referidos
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Comparte tu enlace y gana clases gratis
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Cada estudiante nuevo que llegue por tu enlace y realice su
                    primer pago te suma créditos para tus propias sesiones.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                    <Link2 className="size-3.5" />
                    Código
                  </div>
                  <p className="text-sm font-semibold break-all text-white">
                    {referral.referralCode}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                    <Users className="size-3.5" />
                    Invitaciones
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {referral.totalInvites}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                    <BadgeCheck className="size-3.5" />
                    Pagados
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {referral.paidConversions}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
                    <Gift className="size-3.5" />
                    Créditos
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {referral.creditsEarned}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.08] bg-[#0b1224] p-4">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
                    Tu enlace
                  </p>
                  <p className="text-sm break-all text-white/80">
                    {referral.referralLink}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={copyReferralLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
                  >
                    <Copy className="size-4" />
                    {copied ? "Enlace copiado" : "Copiar enlace"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Te comparto mi enlace de práctica de inglés: ${referral.referralLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]"
                  >
                    <Send className="size-4" />
                    Compartir por WhatsApp
                  </a>
                </div>

                <p className="text-xs leading-relaxed text-white/35">
                  Pendientes por convertir: {referral.pendingConversions}. Te
                  acreditamos el bono cuando el estudiante nuevo complete su
                  primer pago.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pt-4 text-center">
          <p className="text-xs text-white/30">
            ¿Tienes preguntas? Escríbenos a{" "}
            <a
              href="mailto:mauricio@tututordeingles.online"
              className="text-blue-400 underline hover:text-blue-300"
            >
              mauricio@tututordeingles.online
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function SessionActions({
  sessionId,
  onChanged,
}: {
  sessionId: string;
  onChanged: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [mode, setMode] = useState<"idle" | "reschedule">("idle");
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  useEffect(() => {
    if (!date) return;
    (async () => {
      const r = await getBookedSlotsAction({
        dateIso: date.toISOString(),
        timeZone: tz,
      });
      if (r.success) setBooked(r.bookedSlots);
    })();
  }, [date, tz]);

  const cancel = async () => {
    if (!window.confirm("¿Seguro que quieres cancelar esta clase?")) return;
    setBusy(true);
    const res = await cancelSessionAction({ sessionId });
    setBusy(false);
    onChanged(
      res.success
        ? {
            type: "success",
            text: res.refunded
              ? "Clase cancelada. Tu crédito fue reembolsado."
              : "Clase cancelada.",
          }
        : { type: "error", text: res.error || "No se pudo cancelar." }
    );
  };

  const confirmReschedule = async () => {
    if (!date || !slot) return;
    setBusy(true);
    const dt = new Date(date);
    const [h, m] = slot.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    const res = await rescheduleSessionAction({
      sessionId,
      newDateTimeIso: dt.toISOString(),
    });
    setBusy(false);
    onChanged(
      res.success
        ? { type: "success", text: "Clase reprogramada." }
        : { type: "error", text: res.error || "No se pudo reprogramar." }
    );
  };

  return (
    <div className="mt-3 border-t border-white/[0.05] pt-3">
      {mode === "idle" ? (
        <div className="flex gap-2">
          <button
            onClick={() => setMode("reschedule")}
            disabled={busy}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:bg-white/5 hover:text-white"
          >
            Reprogramar
          </button>
          <button
            onClick={cancel}
            disabled={busy}
            className="rounded-full border border-red-500/20 px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10"
          >
            {busy ? "…" : "Cancelar"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {getAvailableDates()
              .slice(0, 8)
              .map((dd, i) => {
                const sel = date?.toDateString() === dd.toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setDate(dd);
                      setSlot(null);
                    }}
                    className={`rounded-lg border p-1.5 text-[10px] font-semibold ${sel ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/[0.06] text-white/50 hover:text-white"}`}
                  >
                    {dd.toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </button>
                );
              })}
          </div>
          {date && (
            <div className="mb-2 grid grid-cols-5 gap-1.5">
              {TIME_SLOTS.map((sl) => {
                const isB = booked.includes(sl);
                const sel = slot === sl;
                return (
                  <button
                    key={sl}
                    disabled={isB}
                    onClick={() => setSlot(sl)}
                    className={`rounded-lg border p-1.5 text-[10px] font-bold ${isB ? "cursor-not-allowed border-white/[0.03] text-white/20 line-through" : sel ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/[0.06] text-white/60 hover:text-white"}`}
                  >
                    {sl}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={confirmReschedule}
              disabled={busy || !date || !slot}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {busy ? "…" : "Confirmar"}
            </button>
            <button
              onClick={() => {
                setMode("idle");
                setDate(null);
                setSlot(null);
              }}
              disabled={busy}
              className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] text-white/50 hover:text-white"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
          Cargando tu panel de control...
        </main>
      }
    >
      <StudentDashboard />
    </Suspense>
  );
}
