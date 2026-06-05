"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/shared/ui/card";
import { getStudentDashboardDataAction, verifyPaymentAction } from "./actions";
import { Mail, Copy, Link2, Send, Gift, Users, BadgeCheck } from "lucide-react";

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

function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const verifiedSession = useRef<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const res = await getStudentDashboardDataAction();
    setLoading(false);
    if (res.success && res.student) {
      setStudent(res.student);
      setReferral((res as { referral?: ReferralData }).referral ?? null);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          setStatusMessage({
            type: "success",
            text: `¡Compra de ${plan === "single" ? "1 clase" : "10 clases"} procesada con éxito! Tus créditos han sido actualizados.`,
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Cargando tu panel de control...
      </main>
    );
  }

  if (!student) return null;

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
            ¡Gracias por registrarte,{" "}
            <span className="text-blue-400">{student.name}</span>!
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/40">
            Tu cuenta está lista. El servicio comenzará muy pronto.
          </p>
        </div>

        <Card className="mb-6 rounded-2xl border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex size-12 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
              <Mail className="size-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Lanzamiento en aproximadamente 1 semana
            </h2>
            <p className="text-sm leading-relaxed text-white/60">
              Estamos ultimando los detalles para ofrecerte la mejor experiencia
              de aprendizaje. Recibirás un correo electrónico cuando el servicio
              esté oficialmente en vivo con instrucciones para agendar tu
              primera clase.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 rounded-2xl border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-xl">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex size-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <span className="text-xl">🤝</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Reunión grupal en Tehuacán — ¡Próximamente!
            </h2>
            <p className="text-sm leading-relaxed text-white/60">
              La próxima semana estaremos organizando encuentros públicos en
              Tehuacán para que conozcas a tu instructor en persona, así como a
              otros estudiantes. Es una excelente oportunidad para practicar y
              crear comunidad.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <h4 className="mb-1 text-xs font-bold tracking-wider text-white uppercase">
                  ☕ Starbucks
                </h4>
                <p className="text-[11px] text-white/40">
                  Ubicación céntrica — ideal para café y conversación.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <h4 className="mb-1 text-xs font-bold tracking-wider text-white uppercase">
                  🌳 Parque Morelos
                </h4>
                <p className="text-[11px] text-white/40">
                  En el centro de Tehuacán — espacio abierto y accesible.
                </p>
              </div>
            </div>
            <p className="border-t border-white/[0.05] pt-3 text-xs leading-relaxed text-white/40">
              Recibirás un correo con los detalles (día, hora y lugar exacto) en
              los próximos días. ¡Estamos emocionados de conocerte!
            </p>
          </CardContent>
        </Card>

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
