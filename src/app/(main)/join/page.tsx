"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import {
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sunset,
  CalendarClock,
} from "lucide-react";
import { registerLeadAction } from "./actions";

const LEVELS = [
  { value: "principiante", label: "Principiante — entiendo poco" },
  { value: "intermedio", label: "Intermedio — me defiendo" },
  { value: "avanzado", label: "Avanzado — quiero fluidez" },
  { value: "no-se", label: "No estoy seguro" },
];

const SLOTS = [
  { value: "manana", label: "Domingo 11:00 AM", icon: Sun },
  { value: "tarde", label: "Domingo 5:00 PM", icon: Sunset },
  { value: "cualquiera", label: "Cualquiera", icon: CalendarClock },
];

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-[#111827]/60 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-blue-500/50";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("no-se");
  const [slot, setSlot] = useState("cualquiera");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerLeadAction({ name, phone, age, level, slot });
    setLoading(false);
    if (res.success) {
      setDone(true);
    } else {
      setError(res.error || "Algo salió mal. Intenta de nuevo.");
    }
  };

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="animate-fadeIn relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0f1729]/50 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ¡Listo, {name.split(" ")[0] || "nos vemos"}!
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              Recibimos tu registro. Te llamamos pronto para apartar tu lugar en
              el grupo y darte la dirección del próximo domingo.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-xs font-medium text-blue-400 underline underline-offset-4 hover:text-blue-300"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Reserva tu{" "}
                <span className="font-light text-blue-400">lugar</span>
              </h1>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/40">
                Déjanos tu nombre y teléfono. Te llamamos, apartamos tu lugar y
                te decimos dónde nos vemos el domingo. Sin pagos en línea.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className={inputClass}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 238 123 4567"
                    className={inputClass}
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>
                <div className="w-20">
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Edad
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="—"
                    min={5}
                    max={99}
                    className={inputClass}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">
                  Tu nivel de inglés
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                >
                  {LEVELS.map((l) => (
                    <option
                      key={l.value}
                      value={l.value}
                      className="bg-[#111827]"
                    >
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/50">
                  ¿Qué horario te queda?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((s) => {
                    const Icon = s.icon;
                    const active = slot === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSlot(s.value)}
                        disabled={loading}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[11px] font-medium transition-all ${
                          active
                            ? "border-blue-500/40 bg-blue-500/10 text-white"
                            : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20"
                        }`}
                      >
                        <Icon
                          className={`size-4 ${active ? "text-blue-400" : "text-white/30"}`}
                        />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:bg-blue-400 disabled:opacity-60"
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <MessageSquare className="size-4" />
                    Quiero mi lugar
                    <ChevronRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] leading-relaxed text-white/25">
                Te llamamos para confirmar. Grupos de máximo 6 personas · $200
                por sesión, se paga en persona.
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
