"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Mail, UserPlus, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 text-center">
        <div className="size-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="size-6 text-blue-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          El servicio aún no está en vivo
        </h1>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          El inicio de sesión estará disponible cuando el servicio se lance oficialmente.
          Por ahora, puedes registrarte para apartar tu lugar y recibir noticias.
        </p>

        <Button
          onClick={() => router.push("/signup")}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-6 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <UserPlus className="size-4" />
          Crear una cuenta
          <ArrowRight className="size-4" />
        </Button>

        <p className="text-xs text-white/30 mt-6">
          ¿Ya tienes cuenta? El acceso estará disponible en aproximadamente 1 semana.
        </p>
      </div>
    </main>
  );
}
