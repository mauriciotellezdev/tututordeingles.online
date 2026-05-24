"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
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

  const verifiedSession = useRef<string | null>(null);

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Verify payment after Stripe redirect (once student data has loaded)
  useEffect(() => {
    const success = searchParams.get("checkout_success");
    const cancel = searchParams.get("checkout_cancel");
    const plan = searchParams.get("plan");
    const sessionId = searchParams.get("session_id");

    if (cancel === "true") {
      setStatusMessage({
        type: "error",
        text: "La compra fue cancelada. No se realizó ningún cargo."
      });
      router.replace("/student");
      return;
    }

    if (success === "true" && sessionId && plan && student) {
      if (verifiedSession.current === sessionId) return; // already verified
      verifiedSession.current = sessionId;

      (async () => {
        const verifyRes = await verifyPaymentAction({
          sessionId,
          studentId: student._id,
          planType: plan as "single" | "package"
        });

        if (verifyRes.success) {
          setStatusMessage({
            type: "success",
            text: `¡Compra de ${plan === "single" ? "1 clase" : "12 clases"} procesada con éxito! Tus créditos han sido actualizados.`
          });
          loadDashboardData();
        } else {
          setStatusMessage({
            type: "error",
            text: verifyRes.error || "Error al verificar el pago."
          });
        }

        router.replace("/student");
      })();
    }
  }, [searchParams, student]);

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

      <div className="max-w-3xl mx-auto z-10 relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="size-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            ¡Gracias por registrarte, <span className="text-blue-400">{student.name}</span>!
          </h1>
          <p className="text-white/40 text-sm mt-2 max-w-md">
            Tu cuenta está lista. El servicio comenzará muy pronto.
          </p>
        </div>

        {/* Launch Announcement */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20 backdrop-blur-xl rounded-2xl mb-6">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="size-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Mail className="size-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Lanzamiento en aproximadamente 1 semana</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Estamos ultimando los detalles para ofrecerte la mejor experiencia de aprendizaje.
              Recibirás un correo electrónico cuando el servicio esté oficialmente en vivo con
              instrucciones para agendar tu primera clase.
            </p>
          </CardContent>
        </Card>

        {/* In-person Meetup */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 backdrop-blur-xl rounded-2xl mb-6">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-xl">🤝</span>
            </div>
            <h2 className="text-xl font-bold text-white">Reunión grupal en Tehuacán — ¡Próximamente!</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              La próxima semana estaremos organizando encuentros públicos en Tehuacán para que
              conozcas a tu instructor en persona, así como a otros estudiantes. 
              Es una excelente oportunidad para practicar y crear comunidad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">☕ Starbucks</h4>
                <p className="text-[11px] text-white/40">Ubicación céntrica — ideal para café y conversación.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">🌳 Parque Morelos</h4>
                <p className="text-[11px] text-white/40">En el centro de Tehuacán — espacio abierto y accesible.</p>
              </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed border-t border-white/[0.05] pt-3">
              Recibirás un correo con los detalles (día, hora y lugar exacto) en los próximos días.
              ¡Estamos emocionados de conocerte!
            </p>
          </CardContent>
        </Card>

        {/* Quiz result summary if available */}
        {student.quizResult && (
          <Card className="bg-[#0f1729]/40 border-white/[0.08] backdrop-blur-xl rounded-2xl mb-6">
            <CardContent className="p-6 md:p-8 flex items-center gap-4">
              <div className="size-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold text-white">{student.quizResult.score}</span>
                <span className="text-[8px] text-white/40 uppercase font-semibold">de {student.quizResult.totalQuestions}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tu nivel de inglés</h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {getProficiencyLevel(student.quizResult.score).name}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {getProficiencyLevel(student.quizResult.score).desc}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <div className="text-center pt-4">
          <p className="text-xs text-white/30">
            ¿Tienes preguntas? Escríbenos a{" "}
            <a href="mailto:mauriciotellezdev@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
              mauriciotellezdev@gmail.com
            </a>
          </p>
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
