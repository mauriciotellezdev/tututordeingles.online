"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { getTeacherDashboardDataAction, teacherLogoutAction } from "./actions";
import {
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Mail,
  LogOut,
  Video,
  Award,
  Phone,
  Gift,
  BadgeCheck,
  QrCode,
  CreditCard,
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

interface SessionData {
  _id: string;
  type: "intro" | "tutoring";
  dateTime: string;
  duration: number;
  meetingLink?: string;
  status: string;
  paid?: boolean;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface ReferralData {
  _id: string;
  referralCodeUsed: string;
  createdAt: string;
  convertedAt: string | null;
  rewardGrantedAt: string | null;
  rewardCredits: number;
  rewardDescription: string;
  firstPaymentAmount: number;
  referrer: {
    _id: string;
    name: string;
    email: string;
  } | null;
  referred: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

export default function TeacherDashboard() {
  const router = useRouter();

  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [activeStudents, setActiveStudents] = useState<StudentData[]>([]);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getTeacherDashboardDataAction();
    setLoading(false);

    if (res.success) {
      setUpcomingSessions(res.upcomingSessions || []);
      setActiveStudents(res.activeStudents || []);
      setReferrals(res.referrals || []);
    } else {
      setError(res.error || "No autorizado.");
      router.push("/login");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await teacherLogoutAction();
    router.push("/login");
  };

  const getProficiencyLevelName = (correct?: number) => {
    if (correct === undefined) return "No realizado";
    if (correct <= 5) return "Principiante (A1-A2)";
    if (correct <= 12) return "Intermedio (B1)";
    if (correct <= 17) return "Intermedio Alto (B2)";
    return "Avanzado (C1-C2)";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Cargando panel del profesor...
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white md:px-8">
        <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Dashboard del <span className="text-blue-400">Profesor</span>
              </h1>
              <p className="mt-1 text-xs text-white/40">
                Mauricio Tellez · Gestión académica y de alumnos activos
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <a href="/teacher/campaigns">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/5 hover:text-blue-300"
                >
                  <QrCode className="size-4" />
                  Campañas QR
                </Button>
              </a>
              <a href="/teacher/test-pagos">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
                >
                  <CreditCard className="size-4" />
                  Pagos de prueba
                </Button>
              </a>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="size-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {error && (
            <Card className="bg-destructive/10 border-destructive/20 text-destructive mb-6 rounded-xl p-4">
              <p className="text-sm font-semibold">{error}</p>
            </Card>
          )}

          <div className="space-y-8">
            <Card className="overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <CalendarIcon className="size-5 text-blue-400" /> Clases
                  Próximas Agendadas
                </CardTitle>
                <CardDescription className="text-xs text-white/40">
                  Listado cronológico de sesiones agendadas por estudiantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-10 text-center">
                    <CalendarIcon className="mx-auto mb-3 size-8 text-white/15" />
                    <h5 className="text-sm font-semibold text-white/70">
                      No hay clases próximas
                    </h5>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-white/40">
                      Las clases que programen los estudiantes aparecerán
                      listadas aquí con su enlace de WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                        <TableRow>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Fecha y Hora
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Estudiante
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Contacto
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Tipo de Clase
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingSessions.map((session) => {
                          const dateObj = new Date(session.dateTime);
                          const formattedDate = dateObj.toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            }
                          );
                          const formattedTime = dateObj.toLocaleTimeString(
                            "es-MX",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          );

                          return (
                            <TableRow
                              key={session._id}
                              className="border-b border-white/[0.04] hover:bg-white/[0.01]"
                            >
                              <TableCell className="py-4">
                                <span className="block text-sm font-bold text-white capitalize">
                                  {formattedDate}
                                </span>
                                <span className="mt-0.5 block text-xs text-white/50">
                                  {formattedTime} hrs (CDMX)
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="block text-sm font-semibold text-white">
                                  {session.student.name}
                                </span>
                                <span className="mt-0.5 block text-xs text-white/45">
                                  {session.student.email}
                                </span>
                              </TableCell>
                              <TableCell className="space-y-1 py-4">
                                <div className="flex items-center gap-1.5 text-xs text-white/60">
                                  <Phone className="size-3 text-white/40" />
                                  {session.student.phone}
                                </div>
                                <a
                                  href={`https://wa.me/${session.student.phone.replace(/\+/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#25d366] hover:underline"
                                >
                                  <MessageSquare className="size-3" />
                                  Chat WhatsApp
                                </a>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  className={
                                    session.type === "intro"
                                      ? "rounded-full border border-green-500/20 bg-green-500/10 text-[9px] font-semibold tracking-wider text-green-400 uppercase"
                                      : "rounded-full border border-blue-500/20 bg-blue-500/10 text-[9px] font-semibold tracking-wider text-blue-400 uppercase"
                                  }
                                >
                                  {session.type === "intro"
                                    ? "Demo Gratis"
                                    : "Clase Privada"}
                                </Badge>
                                <span className="mt-1 block text-[10px] text-white/30">
                                  {session.duration} min
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                {session.meetingLink && (
                                  <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-400"
                                  >
                                    <Video className="size-3.5" />
                                    WhatsApp
                                  </a>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Users className="size-5 text-blue-400" /> Estudiantes Activos
                  (Últimos 30 días)
                </CardTitle>
                <CardDescription className="text-xs text-white/40">
                  Estudiantes con reservas de clases o compras en los últimos 30
                  días.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeStudents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-10 text-center">
                    <Users className="mx-auto mb-3 size-8 text-white/15" />
                    <h5 className="text-sm font-semibold text-white/70">
                      No hay estudiantes activos
                    </h5>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-white/40">
                      Los alumnos con actividad académica o pagos en los últimos
                      30 días figurarán en este listado.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                        <TableRow>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Nombre
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Correo
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Teléfono / WhatsApp
                          </TableHead>
                          <TableHead className="text-center text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Créditos
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Examen de Ubicación
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeStudents.map((student) => (
                          <TableRow
                            key={student._id}
                            className="border-b border-white/[0.04] hover:bg-white/[0.01]"
                          >
                            <TableCell className="py-4">
                              <span className="text-sm font-semibold text-white">
                                {student.name}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <a
                                href={`mailto:${student.email}`}
                                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white hover:underline"
                              >
                                <Mail className="size-3.5 text-white/30" />
                                {student.email}
                              </a>
                            </TableCell>
                            <TableCell className="py-4">
                              <a
                                href={`https://wa.me/${student.phone.replace(/\+/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-[#25d366] hover:underline"
                              >
                                <MessageSquare className="size-3.5 text-[#25d366]/40" />
                                {student.phone}
                              </a>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <span className="text-base font-extrabold text-white">
                                {student.credits}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              {student.quizResult ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400">
                                    <Award className="size-3" />
                                    {getProficiencyLevelName(
                                      student.quizResult.score
                                    )}
                                  </span>
                                  <span className="mt-1 block text-[10px] text-white/30">
                                    Score: {student.quizResult.score}/
                                    {student.quizResult.totalQuestions}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-white/30 italic">
                                  No realizado
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Gift className="size-5 text-blue-400" /> Referidos y
                  recompensas
                </CardTitle>
                <CardDescription className="text-xs text-white/40">
                  Registro reciente de quién refirió a quién y qué bono se
                  acreditó.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-10 text-center">
                    <Gift className="mx-auto mb-3 size-8 text-white/15" />
                    <h5 className="text-sm font-semibold text-white/70">
                      Todavía no hay referidos
                    </h5>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-white/40">
                      Los nuevos registros y pagos aparecerán aquí cuando los
                      estudiantes compartan sus enlaces.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                        <TableRow>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Referente
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Nuevo estudiante
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Estado
                          </TableHead>
                          <TableHead className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                            Bono
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow
                            key={referral._id}
                            className="border-b border-white/[0.04] hover:bg-white/[0.01]"
                          >
                            <TableCell className="py-4">
                              <span className="block text-sm font-semibold text-white">
                                {referral.referrer?.name || "Desconocido"}
                              </span>
                              <span className="mt-0.5 block text-xs text-white/45">
                                {referral.referrer?.email || "Sin correo"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="block text-sm font-semibold text-white">
                                {referral.referred?.name || "Pendiente"}
                              </span>
                              <span className="mt-0.5 block text-xs text-white/45">
                                {referral.referred?.email || "Sin correo"}
                              </span>
                              <span className="mt-1 block text-[10px] tracking-wider text-white/25 uppercase">
                                Código usado: {referral.referralCodeUsed}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              {referral.rewardGrantedAt ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  <BadgeCheck className="size-3" />
                                  Recompensado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                                  Pendiente
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-base font-extrabold text-white">
                                {referral.rewardCredits}
                              </span>
                              <span className="mt-1 block text-[10px] text-white/30">
                                {referral.rewardDescription ||
                                  "Bono de referido"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
