"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AlertCircle, User, Mail, Phone, Lock, ChevronRight, CheckCircle2 } from "lucide-react";
import { signupStudentAction, verifyCodeAndLoginAction } from "./actions";

export default function SignupPage() {
  const router = useRouter();

  // Wizard steps: 1 = Form, 2 = Verification Code
  const [step, setStep] = useState<1 | 2>(1);

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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

    setLoading(true);
    setError(null);

    const res = await signupStudentAction({ name, email, phone });
    setLoading(false);

    if (res.success && res.email) {
      setEmail(res.email);
      setSuccessMessage("¡Código enviado! Revisa tu bandeja de entrada o tu servidor local de correos (Maildev).");
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
      setSuccessMessage("¡Email verificado correctamente! Redirigiendo al examen de ubicación...");
      setTimeout(() => {
        router.push("/placement-quiz");
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
      <div className="w-full max-w-md bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Regístrate en <span className="text-blue-400 font-light">Tu Tutor</span>
          </h1>
          <p className="text-white/40 text-xs mt-1.5">
            Crea tu cuenta de estudiante en menos de un minuto
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

        {/* ================= STEP 1: Account Registration ================= */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="size-3.5" /> Nombre Completo
              </label>
              <Input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#111827]/40 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 py-5 rounded-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="Ej. juan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#111827]/40 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 py-5 rounded-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="size-3.5" /> Teléfono / WhatsApp
              </label>
              <Input
                type="tel"
                placeholder="Ej. +52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#111827]/40 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 py-5 rounded-full"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 mt-6 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Creando Cuenta..." : "Registrarme y Recibir Código"}
              <ChevronRight className="size-4" />
            </Button>
          </form>
        )}

        {/* ================= STEP 2: Code Verification ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-white/50 text-xs leading-relaxed text-center mb-4">
              Hemos enviado un código de seguridad de 6 dígitos a <strong className="text-white">{email}</strong>. Por favor, ingrésalo para verificar tu cuenta.
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
              {loading ? "Verificando..." : "Verificar Código e Ingresar"}
              <ChevronRight className="size-4" />
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-white/40 hover:text-white text-xs mt-4 transition-colors underline underline-offset-4"
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
