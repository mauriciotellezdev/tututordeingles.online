"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { createSession, SESSION_COLLECTION } from "@/lib/models/session";
import { sendMail } from "@/lib/mail";
import Stripe from "stripe";

/**
 * Action 1: Get data for student dashboard
 */
export async function getStudentDashboardDataAction() {
  try {
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;

    if (!studentIdStr) {
      return { success: false, error: "Sesión no iniciada." };
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const student = await studentsCol.findOne({ _id: new ObjectId(studentIdStr) });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const now = new Date();

    // Fetch upcoming sessions (sorted by date)
    const upcomingSessions = await sessionsCol
      .find({
        studentId: student._id,
        status: "booked",
        dateTime: { $gte: now }
      })
      .sort({ dateTime: 1 })
      .toArray();

    return {
      success: true,
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        credits: student.credits || 0,
        quizResult: student.quizResult
      },
      teacher: {
        email: process.env.TEACHER_EMAIL || "mauriciotellezdev@gmail.com",
        phone: process.env.TEACHER_PHONE || "525512345678"
      },
      upcomingSessions: upcomingSessions.map(s => ({
        _id: s._id.toString(),
        type: s.type,
        dateTime: s.dateTime.toISOString(),
        duration: s.duration,
        meetingLink: s.meetingLink,
        status: s.status,
        paid: s.paid
      }))
    };
  } catch (error: any) {
    console.error("Error in getStudentDashboardDataAction:", error);
    return { success: false, error: error.message || "Error al cargar los datos del panel." };
  }
}

/**
 * Action 2: Book a tutoring session (uses 1 credit) or a free intro call (free)
 */
export async function bookSessionAction(payload: {
  type: "intro" | "tutoring";
  dateTimeIso: string;
}) {
  try {
    const { type, dateTimeIso } = payload;
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;

    if (!studentIdStr) {
      return { success: false, error: "Sesión no iniciada." };
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const studentOid = new ObjectId(studentIdStr);
    const student = await studentsCol.findOne({ _id: studentOid });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const dateTime = new Date(dateTimeIso);

    // 1. Enforce 24 hours advance notice
    const minimumTime = new Date();
    minimumTime.setHours(minimumTime.getHours() + 24);
    if (dateTime < minimumTime) {
      return { success: false, error: "Las clases deben agendarse con al menos 24 horas de anticipación." };
    }

    // 2. Enforce credits for tutoring sessions
    if (type === "tutoring") {
      const currentCredits = student.credits || 0;
      if (currentCredits < 1) {
        return { success: false, error: "No tienes suficientes créditos. Compra créditos primero." };
      }

      // Decrement student credits
      await studentsCol.updateOne(
        { _id: studentOid },
        {
          $inc: { credits: -1 },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Create session document
    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const sessionData = createSession({
      studentId: studentOid,
      type,
      dateTime,
      duration: 60, // 60 minutes for tutoring, intro will default or we override
      meetingLink: `https://wa.me/${process.env.TEACHER_PHONE.replace(/\D/g, '')}`,
      paid: type === "tutoring" ? true : false
    });

    // Intro is 30 mins, tutoring is 60 mins
    if (type === "intro") {
      sessionData.duration = 30;
    }

    const result = await sessionsCol.insertOne(sessionData);
    const sessionId = result.insertedId.toString();

    // 3. Build the ICS Calendar invitation
    const endDateTime = new Date(dateTime);
    endDateTime.setMinutes(dateTime.getMinutes() + sessionData.duration);

    const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const nowStr = formatIcsDate(new Date());
    const startStr = formatIcsDate(dateTime);
    const endStr = formatIcsDate(endDateTime);

    const titleText = type === "intro" ? "Clase Demo de Inglés" : "Clase Privada de Inglés";
    const durationText = type === "intro" ? "30 minutos" : "60 minutos";

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Tu Tutor de Ingles//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${sessionId}@tututordeingles.online`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${titleText} - Tu Tutor de Inglés`,
        `DESCRIPTION:Clase de inglés de ${durationText} con Mauricio. WhatsApp: ${process.env.WHATSAPP_NUMBER}`,
        "LOCATION:WhatsApp",
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

    const emailSubject = `Confirmación: ${titleText} Agendada 🎉`;
    const emailText = `¡Hola ${student.name}!\n\nTu clase de inglés ha sido agendada con éxito.\n\nDetalles:\n- Tipo: ${titleText}\n- Fecha y Hora: ${dateTime.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\n- Duración: ${durationText}\n- Plataforma: WhatsApp\n- Número: ${process.env.WHATSAPP_NUMBER}\n- Teléfono: ${student.phone}\n\nTe adjuntamos una invitación de calendario (.ics) para que la agregues a tu agenda.\n\n¡Nos vemos en clase!\nMauricio Tellez\nTu Tutor de Inglés`;

    // Send confirmation email to student
    await sendMail({
      to: student.email,
      subject: emailSubject,
      text: emailText,
      icalEvent: {
        filename: "clase-ingles.ics",
        content: icsContent
      }
    });

    // Also notify teacher
    const teacherEmail = process.env.TEACHER_EMAIL || "mauriciotellezdev@gmail.com";
    const teacherSubject = `Nueva clase agendada: ${student.name} 📅`;
    const teacherText = `Hola Mauricio,\n\nSe ha agendado una nueva clase.\n\nEstudiante: ${student.name}\nEmail: ${student.email}\nTeléfono: ${student.phone}\nTipo: ${titleText}\nFecha: ${dateTime.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\n\nPlataforma: WhatsApp`;

    await sendMail({
      to: teacherEmail,
      subject: teacherSubject,
      text: teacherText,
      icalEvent: {
        filename: "clase-ingles.ics",
        content: icsContent
      }
    });

    return {
      success: true,
      sessionId
    };
  } catch (error: any) {
    console.error("Error in bookSessionAction:", error);
    return { success: false, error: error.message || "Error al agendar la sesión." };
  }
}

/**
 * Action 3: Log out the student
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("student_id");
  return { success: true };
}

/**
 * Action 4: Create Stripe checkout session
 */
export async function createCheckoutSessionAction(payload: {
  planType: "single" | "package";
}) {
  try {
    const { planType } = payload;
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;

    if (!studentIdStr) {
      return { success: false, error: "Sesión no iniciada." };
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777";

    if (!stripeSecretKey) {
      return { success: false, error: "Stripe API key not configured. Please contact support." };
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27.accredited-gratis" as any
    });

    const isSingle = planType === "single";
    const lineItems = [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: isSingle ? "Clase Individual (1 Crédito)" : "Paquete 10 Clases + 2 Gratis (12 Créditos)",
            description: isSingle
              ? "1 sesión privada de inglés (60 minutos) con Mauricio Tellez."
              : "Paquete premium de 12 sesiones privadas de inglés (60 minutos cada una) con Mauricio Tellez."
          },
          unit_amount: isSingle ? 30000 : 240000 // In cents: $300 MXN vs $2400 MXN
        },
        quantity: 1
      }
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      // Use Stripe placeholder for session ID
      success_url: `${appUrl}/student?checkout_success=true&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/student?checkout_cancel=true`,
      metadata: {
        studentId: studentIdStr,
        planType
      }
    });

    return {
      success: true,
      url: session.url
    };
  } catch (error: any) {
    console.error("Error in createCheckoutSessionAction:", error);
    return { success: false, error: error.message || "Error al iniciar Stripe checkout." };
  }
}

/**
 * Action 5: Verify payment status via API and update credits
 */
export async function verifyPaymentAction(payload: {
  sessionId: string;
  studentId: string;
  planType: "single" | "package";
}) {
  try {
    const { sessionId, studentId, planType } = payload;
    
    // Call the API endpoint to verify payment
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777"}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        studentId,
        planType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Error al verificar el pago" };
    }

    const result = await response.json();
    
    if (result.status === "success") {
      return { 
        success: true, 
        message: result.message,
        creditsAdded: result.creditsAdded
      };
    } else if (result.status === "pending") {
      return { success: false, error: "El pago aún no se ha completado. Por favor, espera unos segundos." };
    } else {
      return { success: false, error: result.message || "Error al procesar el pago" };
    }
    
  } catch (error: any) {
    console.error("Error in verifyPaymentAction:", error);
    return { success: false, error: error.message || "Error al verificar el pago." };
  }
}
