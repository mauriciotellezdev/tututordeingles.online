"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AlertCircle, Mail, Lock, ChevronRight, CheckCircle2, User } from "lucide-react";
import { requestLoginCodeAction, verifyLoginCodeAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();

  // Wizard steps: 1 = Email Form, 2 = Verification Code
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Request Code (Step 1)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await requestLoginCodeAction(email);
    setLoading(false);

    if (res.success && res.email) {
      setEmail(res.email);
      setSuccessMessage("¡Código de acceso enviado! Revisa tu correo o Maildev.");
      setStep(2);
    } else {
      setError(res.error || "Ocurrió un error al enviar el código de acceso.");
    }
  };

  // Verify Code (Step 2)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError("Por favor ingresa el código de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await verifyLoginCodeAction({ email, code });
    setLoading(false);

    if (res.success) {
      setSuccessMessage("¡Acceso concedido! Redirigiendo...");
      setTimeout(() => {
        if (res.role === "teacher") {
          router.push("/teacher");
        } else {
          if (res.quizCompleted) {
            router.push("/student");
          } else {
            router.push("/placement-quiz");
          }
        }
      }, 1500);
    } else {
      setError(res.error || "El código ingresado es incorrecto.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Iniciar Sesión en <span className="text-blue-400 font-light">Tu Tutor</span>
          </h1>
          <p className="text-white/40 text-xs mt-1.5">
            Ingresa tu correo para recibir un código de acceso de un solo uso
          </p>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* ================= STEP 1: Email Form ================= */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="Ej. estudiante@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#111827]/40 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 py-5 rounded-full"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 mt-6 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Buscando cuenta..." : "Recibir Código de Acceso"}
              <ChevronRight className="size-4" />
            </Button>

            <div className="text-center mt-6 pt-4 border-t border-white/[0.05]">
              <p className="text-white/40 text-xs">
                ¿No tienes una cuenta aún?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ================= STEP 2: Code Verification ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-white/50 text-xs leading-relaxed text-center mb-4">
              Hemos enviado un código temporal de 6 dígitos a <strong className="text-white">{email}</strong>. Por favor, ingrésalo para acceder.
            </p>

            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">
                <Lock className="size-3.5 text-blue-400" /> Código de Seguridad
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-[#111827]/40 border-white/[0.08] text-white text-center tracking-widest text-lg font-bold placeholder:text-white/20 focus:border-blue-500/50 py-6 rounded-full"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 mt-6 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verificando..." : "Ingresar a mi Cuenta"}
              <ChevronRight className="size-4" />
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-white/40 hover:text-white text-xs mt-4 transition-colors underline underline-offset-4"
              disabled={loading}
            >
              Volver a ingresar correo
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
