"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { getTeacherDashboardDataAction, teacherLogoutAction } from "./actions";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MessageSquare, 
  Mail, 
  LogOut, 
  Video, 
  Award,
  Phone,
  BookOpen
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

export default function TeacherDashboard() {
  const router = useRouter();

  // Dashboard Data State
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [activeStudents, setActiveStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getTeacherDashboardDataAction();
    setLoading(false);

    if (res.success) {
      setUpcomingSessions(res.upcomingSessions || []);
      setActiveStudents(res.activeStudents || []);
    } else {
      setError(res.error || "No autorizado.");
      router.push("/login");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Logout
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
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Cargando panel del profesor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard del <span className="text-blue-400">Profesor</span>
            </h1>
            <p className="text-white/40 text-xs mt-1">
              Mauricio Tellez · Gestión académica y de alumnos activos
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-full px-5 py-2.5 text-white/50 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
          >
            <LogOut className="size-4" />
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <Card className="bg-destructive/10 border-destructive/20 text-destructive p-4 rounded-xl mb-6">
            <p className="text-sm font-semibold">{error}</p>
          </Card>
        )}

        <div className="space-y-8">
          
          {/* ================= SECTION 1: UPCOMING SESSIONS ================= */}
          <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="size-5 text-blue-400" /> Clases Próximas Agendadas
              </CardTitle>
              <CardDescription className="text-white/40 text-xs">
                Listado cronológico de sesiones agendadas por estudiantes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                  <CalendarIcon className="size-8 text-white/15 mx-auto mb-3" />
                  <h5 className="text-sm font-semibold text-white/70">No hay clases próximas</h5>
                  <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto leading-relaxed">
                    Las clases que programen los estudiantes aparecerán listadas aquí con su enlace de Google Meet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                      <TableRow>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Fecha y Hora</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Estudiante</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Contacto</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Tipo de Clase</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingSessions.map((session) => {
                        const dateObj = new Date(session.dateTime);
                        const formattedDate = dateObj.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        });
                        const formattedTime = dateObj.toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        });

                        return (
                          <TableRow key={session._id} className="border-b border-white/[0.04] hover:bg-white/[0.01]">
                            <TableCell className="py-4">
                              <span className="block font-bold text-white capitalize text-sm">{formattedDate}</span>
                              <span className="block text-xs text-white/50 mt-0.5">{formattedTime} hrs (CDMX)</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="block font-semibold text-white text-sm">{session.student.name}</span>
                              <span className="block text-xs text-white/45 mt-0.5">{session.student.email}</span>
                            </TableCell>
                            <TableCell className="py-4 space-y-1">
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
                              <Badge className={
                                session.type === "intro"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[9px] tracking-wider uppercase font-semibold"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] tracking-wider uppercase font-semibold"
                              }>
                                {session.type === "intro" ? "Demo Gratis" : "Clase Privada"}
                              </Badge>
                              <span className="block text-[10px] text-white/30 mt-1">{session.duration} min</span>
                            </TableCell>
                            <TableCell className="py-4">
                              {session.meetingLink && (
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-500 hover:bg-blue-400 text-white rounded-full py-2 px-4 text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-md shadow-blue-500/10"
                                >
                                  <Video className="size-3.5" />
                                  Google Meet
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

          {/* ================= SECTION 2: ACTIVE STUDENTS ================= */}
          <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="size-5 text-blue-400" /> Estudiantes Activos (Últimos 30 días)
              </CardTitle>
              <CardDescription className="text-white/40 text-xs">
                Estudiantes con reservas de clases o compras en los últimos 30 días.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeStudents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                  <Users className="size-8 text-white/15 mx-auto mb-3" />
                  <h5 className="text-sm font-semibold text-white/70">No hay estudiantes activos</h5>
                  <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto leading-relaxed">
                    Los alumnos con actividad académica o pagos en los últimos 30 días figurarán en este listado.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                      <TableRow>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Nombre</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Correo</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Teléfono / WhatsApp</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider text-center">Créditos</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Examen de Ubicación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeStudents.map((student) => (
                        <TableRow key={student._id} className="border-b border-white/[0.04] hover:bg-white/[0.01]">
                          <TableCell className="py-4">
                            <span className="font-semibold text-white text-sm">{student.name}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <a href={`mailto:${student.email}`} className="text-xs text-white/60 hover:underline hover:text-white flex items-center gap-1.5">
                              <Mail className="size-3.5 text-white/30" />
                              {student.email}
                            </a>
                          </TableCell>
                          <TableCell className="py-4">
                            <a
                              href={`https://wa.me/${student.phone.replace(/\+/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#25d366] hover:underline flex items-center gap-1.5"
                            >
                              <MessageSquare className="size-3.5 text-[#25d366]/40" />
                              {student.phone}
                            </a>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="text-base font-extrabold text-white">{student.credits}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            {student.quizResult ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20">
                                  <Award className="size-3" />
                                  {getProficiencyLevelName(student.quizResult.score)}
                                </span>
                                <span className="block text-[10px] text-white/30 mt-1">Score: {student.quizResult.score}/{student.quizResult.totalQuestions}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-white/30 italic">No realizado</span>
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

        </div>

      </div>
    </main>
  );
}
