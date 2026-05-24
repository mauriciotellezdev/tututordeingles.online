"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { 
  getStudentDashboardDataAction, 
  bookSessionAction, 
  logoutAction, 
  createCheckoutSessionAction,
  verifyPaymentAction,
} from "./actions";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Video,
  Award,
  CreditCard
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

interface TeacherData {
  email: string;
  phone: string;
}

interface SessionData {
  _id: string;
  type: "intro" | "tutoring";
  dateTime: string;
  duration: number;
  meetingLink?: string;
  status: string;
  paid?: boolean;
}

function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data State
  const [student, setStudent] = useState<StudentData | null>(null);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingType, setBookingType] = useState<"tutoring">("tutoring");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Purchase State
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null); // "single" or "package" or null

  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Data
  const loadDashboardData = async () => {
    setLoading(true);
    const res = await getStudentDashboardDataAction();
    setLoading(false);

    if (res.success && res.student) {
      setStudent(res.student);
      setTeacher(res.teacher || { email: "mauriciotellezdev@gmail.com", phone: "525512345678" });
      setUpcomingSessions(res.upcomingSessions || []);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Check query parameters for Stripe checkout callbacks
    const success = searchParams.get("checkout_success");
    const cancel = searchParams.get("checkout_cancel");
    const plan = searchParams.get("plan");

    if (success === "true") {
      setStatusMessage({
        type: "success",
        text: `¡Compra de ${plan === "single" ? "1 clase" : "12 clases"} procesada con éxito! Tus créditos han sido actualizados.`
      });
      // Clean query params
      router.replace("/student");
    } else if (cancel === "true") {
      setStatusMessage({
        type: "error",
        text: "La compra fue cancelada. No se realizó ningún cargo."
      });
      router.replace("/student");
    }
  }, [searchParams]);

  // Handle Logout
  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  // Calendar dates setup (Mon-Sat, skipping Sunday, starting tomorrow)
  const getAvailableDates = () => {
    const dates = [];
    const start = new Date();
    start.setDate(start.getDate() + 1);

    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getDay() !== 0) { // Skip Sunday
        dates.push(d);
      }
    }
    return dates;
  };

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Returns available time slots for a given date, excluding slots already booked by the student
  const getAvailableTimeSlots = (date: Date) => {
    // Find times already booked on this date
    const bookedSlots = upcomingSessions
      .filter((session) => {
        const sessionDate = new Date(session.dateTime);
        return sessionDate.toDateString() === date.toDateString();
      })
      .map((session) => {
        const d = new Date(session.dateTime);
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      });

    // Filter out booked slots
    return timeSlots.filter((slot) => !bookedSlots.includes(slot));
  };

  // Handle Booking
  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) {
      setBookingError("Por favor selecciona una fecha y una hora.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const res = await bookSessionAction({
      type: bookingType,
      dateTimeIso: bookingDateTime.toISOString()
    });

    setBookingLoading(false);

    if (res.success) {
      setBookingSuccess(`¡Clase agendada con éxito! Recibirás un correo con la invitación (.ics).`);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      // Reload credits & sessions
      loadDashboardData();
    } else {
      setBookingError(res.error || "Ocurrió un error al agendar.");
    }
  };

  // Handle Buy Credits
  const handleBuyCredits = async (planType: "single" | "package") => {
    setPurchaseLoading(planType);
    const res = await createCheckoutSessionAction({ planType });
    setPurchaseLoading(null);
    if (res.success && res.url) {
      // Redirect to Stripe Checkout
      window.location.href = res.url;
    } else {
      // Show error banner
      setStatusMessage({ type: "error", text: res.error || "Error al iniciar compra" });
    }
  };


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
      {/* Background glow */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Bienvenido, <span className="text-blue-400">{student.name}</span>
            </h1>
            <p className="text-white/40 text-xs mt-1">
              Panel del Estudiante · Gestiona tus clases y créditos
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

        {/* Global Alert Banners */}
        {statusMessage && (
          <div className={`mb-8 p-4 rounded-xl border text-sm flex items-center gap-3 animate-fadeIn ${
            statusMessage.type === "success" 
              ? "bg-green-500/10 border-green-500/20 text-green-400" 
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}>
            {statusMessage.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
            <p>{statusMessage.text}</p>
            <button className="ml-auto text-xs underline font-bold" onClick={() => setStatusMessage(null)}>Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT COLUMN: INFO, CREDITS & QUIZ ================= */}
          <div className="space-y-6">
            
            {/* Credit Balance Card */}
            <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold tracking-wider text-white/50 uppercase">Créditos de Tutoría</CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold text-white">{student.credits}</span>
                  <span className="text-sm text-white/45 font-medium">clases disponibles</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-white/50 leading-relaxed">
                  Utiliza tus créditos para programar clases privadas de 60 minutos con Mauricio. Las llamadas demo no consumen créditos.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button
                    onClick={() => handleBuyCredits("single")}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-4 text-xs font-semibold tracking-wide transition-all flex items-center justify-between px-5"
                    disabled={purchaseLoading !== null}
                  >
                    <span>1 Clase Individual</span>
                    <span className="text-blue-400 font-bold">$300 MXN</span>
                  </Button>
                  <Button
                    onClick={() => handleBuyCredits("package")}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-full py-4 text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-between px-5"
                    disabled={purchaseLoading !== null}
                  >
                    <span className="flex items-center gap-1.5">
                      Paquete 10 + 2 Gratis
                      <Badge className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded">Ahorro</Badge>
                    </span>
                    <span className="font-bold">$2,400 MXN</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Result Card */}
            {student.quizResult ? (
              <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-wider text-white/50 uppercase flex items-center gap-2">
                    <Award className="size-4 text-blue-400" /> Resultado de Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-white">{student.quizResult.score}</span>
                      <span className="text-[8px] text-white/40 uppercase font-semibold">de {student.quizResult.totalQuestions}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        Nivel Determinado
                      </h4>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {getProficiencyLevel(student.quizResult.score).name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed border-t border-white/[0.05] pt-3">
                    {getProficiencyLevel(student.quizResult.score).desc}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl p-5 text-center">
                <Award className="size-8 text-white/20 mx-auto mb-3" />
                <h4 className="text-sm font-bold mb-1">¿No has hecho tu examen?</h4>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">Completa el examen de ubicación para conocer tu nivel inicial de inglés.</p>
                <Button 
                  onClick={() => router.push("/placement-quiz")}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-full w-full py-2.5 text-xs font-semibold"
                >
                  Tomar examen ahora
                </Button>
              </Card>
            )}

            {/* Contact Card */}
            <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold tracking-wider text-white/50 uppercase">Contacto con el Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/50 leading-relaxed mb-2">
                  ¿Tienes dudas de tu plan, necesitas reagendar o quieres enviar materiales? Escríbele a Mauricio.
                </p>
                {teacher && (
                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${teacher.phone.replace(/\+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/20 text-[#25d366] rounded-full py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="size-4" />
                      Escribir por WhatsApp
                    </a>
                    <a
                      href={`mailto:${teacher.email}`}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Mail className="size-4 text-white/60" />
                      Enviar Correo
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* ================= RIGHT COLUMN: SCHEDULED & BOOKING ================= */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scheduled sessions list */}
            <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl">
               <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Clock className="size-5 text-blue-400" /> Próximas Clases Agendadas
                </CardTitle>
                <CardDescription className="text-white/40 text-xs">
                  Clases agendadas en WhatsApp. Revisa tu correo por invitaciones .ics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                    <Video className="size-8 text-white/15 mx-auto mb-3" />
                    <h5 className="text-sm font-semibold text-white/70">No hay clases programadas</h5>
                    <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto leading-relaxed">
                      Programa tu llamada demo gratis o una clase privada de tutoría usando el formulario de abajo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => {
                      const dateObj = new Date(session.dateTime);
                      const formattedDate = dateObj.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      });
                      const formattedTime = dateObj.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });
                      return (
                        <div 
                          key={session._id}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                session.type === "intro" 
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[9px] tracking-wider uppercase font-semibold" 
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] tracking-wider uppercase font-semibold"
                              }>
                                {session.type === "intro" ? "Demo Gratis" : "Clase Privada"}
                              </Badge>
                              <span className="text-[10px] text-white/30 font-medium">{session.duration} min</span>
                            </div>
                            <h4 className="text-sm font-bold text-white capitalize mt-2 flex items-center gap-1.5">
                              <CalendarIcon className="size-3.5 text-white/40" />
                              {formattedDate}
                            </h4>
                            <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5">
                              <Clock className="size-3.5 text-white/40" />
                              {formattedTime} hrs (Zona CDMX)
                            </p>
                          </div>
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-400 text-white rounded-full py-2.5 px-5 text-xs font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 self-end sm:self-auto"
                            >
                              <Video className="size-3.5" />
                              Entrar a WhatsApp
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking form widget */}
            {student.credits >= 1 ? (
              <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <PlusCircle className="size-5 text-blue-400" /> Programar una Nueva Clase
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs">
                    Agenda una clase privada de 60 minutos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookSession} className="space-y-6">
                    
                    {/* Class Type Selector */}
                    <div>
                      <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-3">
                        1. Tipo de Clase
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={() => { setBookingType("tutoring"); setSelectedDate(null); setSelectedTimeSlot(null); }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            bookingType === "tutoring"
                              ? "border-blue-500 bg-blue-500/10 text-white"
                              : "border-white/[0.06] bg-[#111827]/25 text-white/50 hover:border-white/12 hover:text-white"
                          }`}
                        >
                          <span className="block text-xs font-bold uppercase tracking-wider text-blue-400">Clase Particular</span>
                          <span className="block text-[10px] text-white/40 mt-0.5">60 min · Consume 1 Crédito</span>
                        </button>
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div>
                      <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5" /> 2. Elige el Día
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                        {getAvailableDates().map((date, idx) => {
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { setSelectedDate(date); setSelectedTimeSlot(null); }}
                              className={`p-2.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? "bg-blue-500/10 border border-blue-500 text-white"
                                  : "bg-white/[0.06] border border-transparent text-white/50 hover:border-white/12 hover:text-white"
                              }`}
                            >
                              <div className="font-semibold">{date.toLocaleDateString("es-MX", { weekday: "short" })}</div>
                              <div className="text-[10px]">{date.getDate()}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div>
                        <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Clock className="size-3.5" /> 3. Elige la Hora
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {getAvailableTimeSlots(selectedDate).map((slot, idx) => {
                            const isSelected = selectedTimeSlot === slot;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`p-2.5 rounded-lg text-xs font-medium transition-all ${
                                  isSelected
                                    ? "bg-blue-500/10 border border-blue-500 text-white"
                                    : "bg-white/[0.06] border border-transparent text-white/50 hover:border-white/12 hover:text-white"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Confirm Button */}
                    <Button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      disabled={bookingLoading || !selectedDate || !selectedTimeSlot || (bookingType === "tutoring" && student.credits < 1)}
                    >
                      {bookingLoading ? "Agendando..." : "Confirmar y Reservar Horario"}
                    </Button>

                    {bookingType === "tutoring" && student.credits < 1 && (
                      <p className="text-center text-[10px] text-destructive font-semibold">
                        Debes comprar créditos antes de poder agendar una clase privada.
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <CreditCard className="size-5 text-blue-400" /> Comprar Créditos
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs">
                    No tienes suficientes créditos para agendar una clase privada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleBuyCredits("single")}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard className="size-5" /> Comprar 1 Crédito
                  </Button>
                </CardContent>
              </Card>
            )}


          </div>

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
