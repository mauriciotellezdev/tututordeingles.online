"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import {
  createSession,
  SESSION_COLLECTION,
  type Session,
} from "@/lib/models/session";
import { getTeacherData } from "@/lib/models/teacher";
import { createCredit, CREDIT_COLLECTION } from "@/lib/models/credit";
import {
  processCompletedPayment,
  resolveCheckoutSessionPaymentContext,
} from "@/lib/stripe-verify";
import { sendMail } from "@/lib/mail";
import Stripe from "stripe";
import { getReferralDashboardSummary } from "@/lib/referrals";
import { getTimeZoneDateKey, getTimeZoneHourLabel } from "@/lib/timezone";

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
    const student = await studentsCol.findOne({
      _id: new ObjectId(studentIdStr),
    });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const referralBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777";
    const referralSummary = await getReferralDashboardSummary(
      studentIdStr,
      referralBaseUrl
    );

    // Compute credit balance from the credits collection
    const creditsCol = await getCollection(CREDIT_COLLECTION);
    const creditAgg = await creditsCol
      .aggregate<{
        total: number;
      }>([
        { $match: { studentId: new ObjectId(studentIdStr) } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    const credits = creditAgg.length > 0 ? creditAgg[0].total : 0;

    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const now = new Date();

    // Fetch upcoming sessions (sorted by date)
    const upcomingSessions = await sessionsCol
      .find({
        studentId: student._id,
        status: "booked",
        dateTime: { $gte: now },
      })
      .sort({ dateTime: 1 })
      .toArray();

    const teacher = await getTeacherData();

    return {
      success: true,
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        credits,
        quizResult: student.quizResult,
      },
      referral: referralSummary,
      teacher: {
        email: teacher.email,
        phone: teacher.phone,
      },
      upcomingSessions: upcomingSessions.map((s) => ({
        _id: s._id.toString(),
        type: s.type,
        dateTime: s.dateTime.toISOString(),
        duration: s.duration,
        meetingLink: s.meetingLink,
        status: s.status,
        paid: s.paid,
      })),
    };
  } catch (error: unknown) {
    console.error("Error in getStudentDashboardDataAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al cargar los datos del panel.",
    };
  }
}

/**
 * Action 2: Get booked hour-slots for a given date (across all students)
 */
export async function getBookedSlotsAction(payload: {
  dateIso: string;
  timeZone?: string;
}) {
  try {
    const { dateIso, timeZone = "UTC" } = payload;
    const selectedDateKey = getTimeZoneDateKey(new Date(dateIso), timeZone);

    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const booked = await sessionsCol
      .find({ status: "booked" })
      .project({ dateTime: 1 })
      .toArray();

    const bookedSlots = booked
      .filter(
        (session) =>
          getTimeZoneDateKey(session.dateTime, timeZone) === selectedDateKey
      )
      .map((session) => getTimeZoneHourLabel(session.dateTime, timeZone));

    return { success: true, bookedSlots };
  } catch (error: unknown) {
    console.error("Error in getBookedSlotsAction:", error);
    return { success: false, bookedSlots: [] };
  }
}

/**
 * Action 3: Book a tutoring session (uses 1 credit) or a free intro call (free)
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

    // Check for existing booking in the same hour slot
    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const hourStart = new Date(dateTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const existingSlot = await sessionsCol.findOne({
      status: "booked",
      dateTime: { $gte: hourStart, $lt: hourEnd },
    });

    if (existingSlot) {
      return {
        success: false,
        error: "Este horario ya está ocupado. Por favor elige otro.",
      };
    }

    const teacher = await getTeacherData();

    // 1. Enforce 24 hours advance notice
    const minimumTime = new Date();
    minimumTime.setHours(minimumTime.getHours() + 24);
    if (dateTime < minimumTime) {
      return {
        success: false,
        error:
          "Las clases deben agendarse con al menos 24 horas de anticipación.",
      };
    }

    // 2. Enforce credits for tutoring sessions, create session
    const creditsCol = await getCollection(CREDIT_COLLECTION);
    let sessionId: string;

    if (type === "tutoring") {
      const creditAgg = await creditsCol
        .aggregate<{
          total: number;
        }>([
          { $match: { studentId: studentOid } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray();
      const currentCredits = creditAgg.length > 0 ? creditAgg[0].total : 0;

      if (currentCredits < 1) {
        return {
          success: false,
          error: "No tienes suficientes créditos. Compra créditos primero.",
        };
      }

      const { insertedId: creditId } = await creditsCol.insertOne(
        createCredit({
          studentId: studentIdStr,
          amount: -1,
          source: "debit",
          description: "Clase agendada",
        })
      );

      const sessionData = await createSession({
        studentId: studentOid,
        type,
        dateTime,
        duration: 60,
        meetingLink: `https://wa.me/${student.phone.replace(/\D/g, "")}`,
        creditId: creditId as ObjectId,
      });
      const result = await sessionsCol.insertOne(sessionData);
      sessionId = result.insertedId.toString();
    } else {
      // Intro session — free, no credit needed
      const sessionData = await createSession({
        studentId: studentOid,
        type,
        dateTime,
        duration: 30,
        meetingLink: `https://wa.me/${student.phone.replace(/\D/g, "")}`,
      });
      const result = await sessionsCol.insertOne(sessionData);
      sessionId = result.insertedId.toString();
    }

    const sessionData = await sessionsCol.findOne({
      _id: new ObjectId(sessionId),
    });
    if (!sessionData) {
      return { success: false, error: "Error al crear la sesión." };
    }

    // 3. Build the ICS Calendar invitation
    const endDateTime = new Date(dateTime);
    endDateTime.setMinutes(dateTime.getMinutes() + sessionData.duration);

    const formatIcsDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const nowStr = formatIcsDate(new Date());
    const startStr = formatIcsDate(dateTime);
    const endStr = formatIcsDate(endDateTime);

    const titleText =
      type === "intro" ? "Clase Demo de Inglés" : "Clase Privada de Inglés";
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
      `DESCRIPTION:Clase de inglés de ${durationText} con Mauricio.\nWhatsApp: ${teacher.phone}\nEmail: ${teacher.email}`,
      "LOCATION:WhatsApp",
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const emailSubject = `Confirmación: ${titleText} Agendada 🎉`;
    const emailText = `¡Hola ${student.name}!\n\nTu clase de inglés ha sido agendada con éxito.\n\nDetalles:\n- Tipo: ${titleText}\n- Fecha y Hora: ${dateTime.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\n- Duración: ${durationText}\n- Plataforma: WhatsApp\n- Número: ${teacher.phone}\n- Email: ${teacher.email}\n- Teléfono: ${student.phone}\n\nTe adjuntamos una invitación de calendario (.ics) para que la agregues a tu agenda.\n\n¡Nos vemos en clase!\nMauricio Tellez\nTu Tutor de Inglés`;

    // Send confirmation email to student
    await sendMail({
      to: student.email,
      subject: emailSubject,
      text: emailText,
      icalEvent: {
        filename: "clase-ingles.ics",
        content: icsContent,
      },
    });

    // Also notify teacher
    const teacherEmail = teacher.email;
    const teacherSubject = `Nueva clase agendada: ${student.name} 📅`;
    const teacherText = `Hola Mauricio,\n\nSe ha agendado una nueva clase.\n\nEstudiante: ${student.name}\nEmail: ${student.email}\nTeléfono: ${student.phone}\nTipo: ${titleText}\nFecha: ${dateTime.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\n\nPlataforma: WhatsApp`;

    await sendMail({
      to: teacherEmail,
      subject: teacherSubject,
      text: teacherText,
      icalEvent: {
        filename: "clase-ingles.ics",
        content: icsContent,
      },
    });

    return {
      success: true,
      sessionId,
    };
  } catch (error: unknown) {
    console.error("Error in bookSessionAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al agendar la sesión.",
    };
  }
}

/**
 * Cancel a booked session. Paid (tutoring) classes cancelled with >24h notice
 * get their credit refunded; late cancellations forfeit it (per the terms).
 */
export async function cancelSessionAction(payload: { sessionId: string }) {
  try {
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;
    if (!studentIdStr) return { success: false, error: "Sesión no iniciada." };

    const studentOid = new ObjectId(studentIdStr);
    const sessionsCol = await getCollection<Session>(SESSION_COLLECTION);
    const sessionOid = new ObjectId(payload.sessionId);

    const session = await sessionsCol.findOne({
      _id: sessionOid,
      studentId: studentOid,
    });
    if (!session) return { success: false, error: "Clase no encontrada." };
    if (session.status !== "booked") {
      return { success: false, error: "Esta clase ya no está activa." };
    }

    // Atomic transition — only one caller can flip booked → canceled, so a
    // double-cancel can't double-refund.
    const res = await sessionsCol.updateOne(
      { _id: sessionOid, studentId: studentOid, status: "booked" },
      { $set: { status: "canceled", updatedAt: new Date() } }
    );
    if (res.modifiedCount !== 1) {
      return { success: false, error: "Esta clase ya no está activa." };
    }

    const dateTime = new Date(session.dateTime);
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() + 24);
    let refunded = false;
    if (session.type === "tutoring" && session.creditId && dateTime > cutoff) {
      const creditsCol = await getCollection(CREDIT_COLLECTION);
      await creditsCol.insertOne(
        createCredit({
          studentId: studentIdStr,
          amount: 1,
          source: "adjustment",
          description: "Reembolso por cancelación de clase",
        })
      );
      refunded = true;
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const student = await studentsCol.findOne({ _id: studentOid });
    const teacher = await getTeacherData();
    const whenStr = dateTime.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
    });
    try {
      if (student) {
        await sendMail({
          to: student.email,
          subject: "Clase cancelada - Tu Tutor de Inglés",
          text: `Hola ${student.name},\n\nTu clase del ${whenStr} ha sido cancelada.\n\n${refunded ? "Tu crédito fue reembolsado a tu cuenta." : "Por cancelarse con menos de 24 horas de anticipación, el crédito no se reembolsa."}\n\nSaludos,\nMauricio Tellez`,
        });
      }
      await sendMail({
        to: teacher.email,
        subject: `Clase cancelada: ${student?.name ?? "estudiante"}`,
        text: `Se canceló la clase del ${whenStr}${refunded ? " (crédito reembolsado)" : ""}.`,
      });
    } catch (mailError) {
      console.warn("Cancel notification failed:", mailError);
    }

    return { success: true, refunded };
  } catch (error: unknown) {
    console.error("Error in cancelSessionAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al cancelar la clase.",
    };
  }
}

/**
 * Reschedule a booked session to a new time (>=24h out, slot free). Keeps the
 * same credit.
 */
export async function rescheduleSessionAction(payload: {
  sessionId: string;
  newDateTimeIso: string;
}) {
  try {
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;
    if (!studentIdStr) return { success: false, error: "Sesión no iniciada." };

    const studentOid = new ObjectId(studentIdStr);
    const sessionsCol = await getCollection<Session>(SESSION_COLLECTION);
    const sessionOid = new ObjectId(payload.sessionId);

    const session = await sessionsCol.findOne({
      _id: sessionOid,
      studentId: studentOid,
    });
    if (!session) return { success: false, error: "Clase no encontrada." };
    if (session.status !== "booked") {
      return { success: false, error: "Esta clase ya no está activa." };
    }

    const newDateTime = new Date(payload.newDateTimeIso);
    const minimumTime = new Date();
    minimumTime.setHours(minimumTime.getHours() + 24);
    if (newDateTime < minimumTime) {
      return {
        success: false,
        error: "La nueva fecha debe ser con al menos 24 horas de anticipación.",
      };
    }

    const hourStart = new Date(newDateTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);
    const clash = await sessionsCol.findOne({
      _id: { $ne: sessionOid },
      status: "booked",
      dateTime: { $gte: hourStart, $lt: hourEnd },
    });
    if (clash) {
      return {
        success: false,
        error: "Ese horario ya está ocupado. Elige otro.",
      };
    }

    await sessionsCol.updateOne(
      { _id: sessionOid, studentId: studentOid, status: "booked" },
      { $set: { dateTime: newDateTime, updatedAt: new Date() } }
    );

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const student = await studentsCol.findOne({ _id: studentOid });
    const teacher = await getTeacherData();
    const whenStr = newDateTime.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
    });
    try {
      if (student) {
        await sendMail({
          to: student.email,
          subject: "Clase reprogramada - Tu Tutor de Inglés",
          text: `Hola ${student.name},\n\nTu clase fue reprogramada para el ${whenStr} (hora CDMX).\n\nSaludos,\nMauricio Tellez`,
        });
      }
      await sendMail({
        to: teacher.email,
        subject: `Clase reprogramada: ${student?.name ?? "estudiante"}`,
        text: `Clase reprogramada para el ${whenStr}.`,
      });
    } catch (mailError) {
      console.warn("Reschedule notification failed:", mailError);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error in rescheduleSessionAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al reprogramar la clase.",
    };
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
      return {
        success: false,
        error: "Stripe API key not configured. Please contact support.",
      };
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const student = await studentsCol.findOne({
      _id: new ObjectId(studentIdStr),
    });
    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const stripe = new Stripe(stripeSecretKey);

    // Reuse existing Stripe customer or create one
    let stripeCustomerId = student.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: student.email,
        name: student.name,
      });
      stripeCustomerId = customer.id;
      await studentsCol.updateOne(
        { _id: student._id },
        { $set: { stripeCustomerId } }
      );
    }

    const isSingle = planType === "single";
    const lineItems = [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: isSingle
              ? "Clase Individual (1 Crédito)"
              : "Paquete 10 Clases (8 Pagadas + 2 Gratis)",
            description: isSingle
              ? "1 sesión privada de inglés (60 minutos) con Mauricio Tellez."
              : "Paquete de 10 sesiones privadas de inglés — 8 pagadas + 2 gratis (60 minutos cada una) con Mauricio Tellez.",
          },
          unit_amount: isSingle ? 30000 : 240000, // In cents: $300 MXN vs $2400 MXN
        },
        quantity: 1,
      },
    ];

    // Stripe rejects the whole session if ANY requested payment method isn't
    // activated on the account (e.g. SPEI/bank transfers pending KYC). Degrade
    // gracefully — try the full method list, then progressively narrower ones —
    // so a not-yet-activated method never blocks card purchases.
    const methodAttempts: Array<Array<"card" | "oxxo" | "customer_balance">> = [
      ["card", "oxxo", "customer_balance"],
      ["card", "oxxo"],
      ["card"],
    ];

    let session: Stripe.Checkout.Session | null = null;
    let lastError: unknown = null;
    for (const methods of methodAttempts) {
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: methods,
          ...(methods.includes("customer_balance")
            ? {
                payment_method_options: {
                  customer_balance: {
                    funding_type: "bank_transfer" as const,
                    bank_transfer: { type: "mx_bank_transfer" as const },
                  },
                },
              }
            : {}),
          line_items: lineItems,
          mode: "payment",
          customer: stripeCustomerId,
          success_url: `${appUrl}/student?checkout_success=true&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/student?checkout_cancel=true`,
          metadata: {
            studentId: studentIdStr,
            planType,
          },
        });
        if (methods.length < 3) {
          console.warn(
            `Checkout created without: ${["card", "oxxo", "customer_balance"]
              .filter((m) => !methods.includes(m as never))
              .join(", ")} (not activated in Stripe yet?)`
          );
        }
        break;
      } catch (attemptError) {
        lastError = attemptError;
        const message =
          attemptError instanceof Error ? attemptError.message : "";
        // Only fall back on payment-method activation problems; anything else
        // (bad key, network, etc.) should surface immediately.
        if (
          !/payment method|payment_method|activate|invalid.*type/i.test(message)
        ) {
          throw attemptError;
        }
      }
    }

    if (!session) {
      throw lastError instanceof Error
        ? lastError
        : new Error("No se pudo crear la sesión de pago.");
    }

    return {
      success: true,
      url: session.url,
    };
  } catch (error: unknown) {
    console.error("Error in createCheckoutSessionAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al iniciar Stripe checkout.",
    };
  }
}

/**
 * Action 5: Verify payment status via Stripe and update credits
 */
export async function verifyPaymentAction(payload: {
  sessionId: string;
  studentId: string;
  planType: "single" | "package";
}) {
  try {
    const { sessionId, studentId, planType } = payload;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return { success: false, error: "Stripe API key not configured." };
    }

    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return { success: false, error: "Sesión de pago no encontrada." };
    }

    if (session.payment_status !== "paid") {
      if (session.status === "open" || session.status === "complete") {
        return {
          success: true,
          message:
            "Tu pago está pendiente de confirmación (ej. pago en OXXO o transferencia SPEI). Tus créditos se activarán automáticamente en cuanto se confirme el pago.",
        };
      }
      return {
        success: false,
        error:
          "El pago aún no se ha completado. Por favor, espera unos segundos.",
      };
    }

    const verifiedPaymentContext = resolveCheckoutSessionPaymentContext(
      session,
      studentId,
      planType
    );
    if (!verifiedPaymentContext.ok) {
      return { success: false, error: verifiedPaymentContext.error };
    }

    const paymentIntentId = session.payment_intent as string;
    const stripeCustomerId = session.customer as string;

    const result = await processCompletedPayment(
      verifiedPaymentContext.studentId,
      paymentIntentId,
      stripeCustomerId,
      verifiedPaymentContext.planType
    );

    return {
      success: result.success,
      message: result.message,
      creditsAdded: result.creditsAdded,
    };
  } catch (error: unknown) {
    console.error("Error in verifyPaymentAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al verificar el pago.",
    };
  }
}
