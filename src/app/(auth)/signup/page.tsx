"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { signupStudentAction, verifyCodeAndLoginAction } from "./actions";
import { trackSignup } from "@/shared/analytics/track";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard steps: 1 = Form, 2 = Verification Code
  const [step, setStep] = useState<1 | 2>(1);

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);

  // Verification Code State
  const [code, setCode] = useState("");

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form submission (Step 1)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (!accepted) {
      setError(
        "Debes aceptar el Aviso de Privacidad y los Términos para continuar."
      );
      return;
    }

    setLoading(true);
    setError(null);

    const referralCode = searchParams.get("ref");
    const res = await signupStudentAction({ name, email, phone, referralCode });
    setLoading(false);

    if (res.success && res.email) {
      setEmail(res.email);
      setSuccessMessage(
        "¡Código enviado! Revisa tu bandeja de entrada (y la carpeta de spam)."
      );
      setStep(2);
    } else {
      setError(res.error || "Ocurrió un error al registrar tus datos.");
    }
  };

  // Verification submission (Step 2)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError("Por favor ingresa el código de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await verifyCodeAndLoginAction({ email, code });
    setLoading(false);

    if (res.success) {
      trackSignup();
      setSuccessMessage(
        "¡Email verificado correctamente! Redirigiendo al examen de ubicación..."
      );
      setTimeout(() => {
        router.push("/placement-quiz");
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Regístrate en{" "}
            <span className="font-light text-blue-400">Tu Tutor</span>
          </h1>
          <p className="mt-1.5 text-xs text-white/40">
            Crea tu cuenta de estudiante en menos de un minuto
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

        {/* ================= STEP 1: Account Registration ================= */}
        {step === 1 && (
          <form
            data-testid="signup-form"
            onSubmit={handleRegisterSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <User className="size-3.5" /> Nombre Completo
              </label>
              <Input
                data-testid="signup-name-input"
                type="text"
                autoComplete="name"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-5 text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <Mail className="size-3.5" /> Correo Electrónico
              </label>
              <Input
                data-testid="signup-email-input"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="Ej. juan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-5 text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <Phone className="size-3.5" /> Teléfono / WhatsApp
              </label>
              <Input
                data-testid="signup-phone-input"
                type="tel"
                autoComplete="tel"
                placeholder="Ej. +52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-5 text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-white/50">
              <input
                data-testid="signup-consent-checkbox"
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-blue-500"
                disabled={loading}
              />
              <span>
                He leído y acepto el{" "}
                <Link
                  href="/aviso-de-privacidad"
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Aviso de Privacidad
                </Link>{" "}
                y los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Términos y Condiciones
                </Link>
                .
              </span>
            </label>

            <Button
              data-testid="signup-submit-button"
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
              disabled={loading || !accepted}
            >
              {loading ? "Creando Cuenta..." : "Registrarme y Recibir Código"}
              <ChevronRight className="size-4" />
            </Button>
          </form>
        )}

        {/* ================= STEP 2: Code Verification ================= */}
        {step === 2 && (
          <form
            data-testid="signup-verify-form"
            onSubmit={handleVerifySubmit}
            className="space-y-4"
          >
            <p className="mb-4 text-center text-xs leading-relaxed text-white/50">
              Hemos enviado un código de seguridad de 6 dígitos a{" "}
              <strong className="text-white">{email}</strong>. Por favor,
              ingrésalo para verificar tu cuenta.
            </p>

            <div>
              <label className="mb-2 block flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                <Lock className="size-3.5 text-blue-400" /> Código de Seguridad
              </label>
              <Input
                data-testid="signup-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-full border-white/[0.08] bg-[#111827]/40 py-6 text-center text-lg font-bold tracking-widest text-white placeholder:text-white/20 focus:border-blue-500/50"
                disabled={loading}
              />
            </div>

            <Button
              data-testid="signup-verify-button"
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verificando..." : "Verificar Código e Ingresar"}
              <ChevronRight className="size-4" />
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 w-full text-center text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white"
              disabled={loading}
            >
              Volver a editar mis datos
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16">
          <div className="text-sm text-white/50">
            Cargando formulario de registro...
          </div>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
