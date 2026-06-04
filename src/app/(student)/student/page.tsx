"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/shared/ui/card";
import {
  getStudentDashboardDataAction,
  verifyPaymentAction,
} from "./actions";
import { Mail } from "lucide-react";

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


function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const verifiedSession = useRef<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const res = await getStudentDashboardDataAction();
    setLoading(false);
    if (res.success && res.student) {
      setStudent(res.student);
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
    if (correct <= 5) return { name: "Principiante (A1-A2)", desc: "Estás comenzando. Trabajaremos en bases sólidas." };
    if (correct <= 12) return { name: "Intermedio (B1)", desc: "Puedes comunicarte pero falta fluidez. Enfocado en hablar." };
    if (correct <= 17) return { name: "Intermedio Alto (B2)", desc: "Relativamente fluido, corregiremos gramática y naturalidad." };
    return { name: "Avanzado (C1-C2)", desc: "Excelente dominio. Perfeccionaremos negocios y acento." };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Cargando tu panel de control...
      </main>
    );
  }

  if (!student) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden text-white">
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto z-10 relative">

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl text-sm border ${statusMessage.type === "success"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col items-center text-center mb-10">
          <div className="size-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            ¡Gracias por registrarte, <span className="text-blue-400">{student.name}</span>!
          </h1>
          <p className="text-white/40 text-sm mt-2 max-w-md">
            Tu cuenta está lista. El servicio comenzará muy pronto.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20 backdrop-blur-xl rounded-2xl mb-6">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="size-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Mail className="size-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Lanzamiento en aproximadamente 1 semana</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Estamos ultimando los detalles para ofrecerte la mejor experiencia de aprendizaje.
              Recibirás un correo electrónico cuando el servicio esté oficialmente en vivo con
              instrucciones para agendar tu primera clase.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 backdrop-blur-xl rounded-2xl mb-6">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-xl">🤝</span>
            </div>
            <h2 className="text-xl font-bold text-white">Reunión grupal en Tehuacán — ¡Próximamente!</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              La próxima semana estaremos organizando encuentros públicos en Tehuacán para que
              conozcas a tu instructor en persona, así como a otros estudiantes.
              Es una excelente oportunidad para practicar y crear comunidad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">☕ Starbucks</h4>
                <p className="text-[11px] text-white/40">Ubicación céntrica — ideal para café y conversación.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">🌳 Parque Morelos</h4>
                <p className="text-[11px] text-white/40">En el centro de Tehuacán — espacio abierto y accesible.</p>
              </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed border-t border-white/[0.05] pt-3">
              Recibirás un correo con los detalles (día, hora y lugar exacto) en los próximos días.
              ¡Estamos emocionados de conocerte!
            </p>
          </CardContent>
        </Card>

        {student.quizResult && (
          <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl mb-6">
            <CardContent className="p-6 md:p-8 flex items-center gap-4">
              <div className="size-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold text-white">{student.quizResult.score}</span>
                <span className="text-[8px] text-white/40 uppercase font-semibold">de {student.quizResult.totalQuestions}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tu nivel de inglés</h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {getProficiencyLevel(student.quizResult.score).name}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {getProficiencyLevel(student.quizResult.score).desc}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-4">
          <p className="text-xs text-white/30">
            ¿Tienes preguntas? Escríbenos a{" "}
            <a href="mailto:mauriciotellezdev@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
              mauriciotellezdev@gmail.com
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Cargando tu panel de control...
      </main>
    }>
      <StudentDashboard />
    </Suspense>
  );
}