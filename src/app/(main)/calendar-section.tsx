import Link from "next/link";
import { getUpcomingSessions } from "@/lib/calendar";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

export default async function CalendarSection() {
  const sessions = await getUpcomingSessions();

  return (
    <section
      id="calendario"
      className="border-t border-white/[0.05] bg-[#0d1425] px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] text-blue-400 uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Calendario
          </p>
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Próximas sesiones
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-sm text-white/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cada domingo nos reunimos en un lugar diferente de Tehuacán. Pronto
            abriremos más horarios y días.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/[0.06] bg-[#1a2a50]/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-blue-400 uppercase"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {s.startTime} hrs
                </span>
                <span
                  className="text-[10px] font-medium tracking-wider text-white/25 uppercase"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {s.dateLabel}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="size-4 text-blue-400" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold text-white"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {s.startTime} – {s.endTime} hrs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <MapPin className="size-4 text-emerald-400" />
                  </div>
                  <p
                    className="text-sm text-white/60"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {s.location}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Users className="size-4 text-violet-400" />
                  </div>
                  <p
                    className="text-sm text-white/50"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {s.activity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-10 text-center text-xs text-white/20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <CalendarDays className="mr-1.5 inline size-3.5 align-text-top" />
          Las ubicaciones se confirman cada semana.{" "}
          <Link
            href="/join"
            className="text-blue-400/80 underline underline-offset-2 hover:text-blue-300"
          >
            Reserva tu lugar
          </Link>{" "}
          y te avisamos dónde nos vemos.
        </p>
      </div>
    </section>
  );
}
