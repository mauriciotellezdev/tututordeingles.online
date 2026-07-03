"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  AlertCircle,
  Mail,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
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
      setSuccessMessage(
        "¡Código de acceso enviado! Revisa tu correo o Maildev."
      );
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16">
      {/* Background glow decorations */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      {/* Main Container */}
      <div className="animate-fadeIn relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Iniciar Sesión en{" "}
            <span className="font-light text-blue-400">Tu Tutor</span>
          </h1>
          <p className="mt-1.5 text-xs text-white/40">
            Ingresa tu correo para recibir un código de acceso de un solo uso
          </p>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle2 className="size-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* ================= STEP 1: Email Form ================= */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <Mail className="size-3.5" /> Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="Ej. estudiante@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-5 text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Buscando cuenta..." : "Recibir Código de Acceso"}
              <ChevronRight className="size-4" />
            </Button>

            <div className="mt-6 border-t border-white/[0.05] pt-4 text-center">
              <p className="text-xs text-white/40">
                ¿No tienes una cuenta aún?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="font-semibold text-blue-400 underline underline-offset-4 transition-colors hover:text-blue-300"
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
            <p className="mb-4 text-center text-xs leading-relaxed text-white/50">
              Hemos enviado un código temporal de 6 dígitos a{" "}
              <strong className="text-white">{email}</strong>. Por favor,
              ingrésalo para acceder.
            </p>

            <div>
              <label className="mb-2 block flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <Lock className="size-3.5 text-blue-400" /> Código de Seguridad
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-6 text-center text-lg font-bold tracking-widest text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verificando..." : "Ingresar a mi Cuenta"}
              <ChevronRight className="size-4" />
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 w-full text-center text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white"
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
