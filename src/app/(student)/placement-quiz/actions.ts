"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { QUIZ_COLLECTION, Quiz } from "@/lib/models/quiz";
import { createSession, SESSION_COLLECTION } from "@/lib/models/session";
import { sendMail } from "@/lib/mail";

/**
 * Action 1: Get the currently authenticated student session
 */
export async function getCurrentStudentAction() {
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

    return {
      success: true,
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        quizResult: student.quizResult
      }
    };
  } catch (error: any) {
    console.error("Error in getCurrentStudentAction:", error);
    return { success: false, error: error.message || "Error de autenticación." };
  }
}

/**
 * Action 2: Get the placement quiz (excluding correct keys for cheating prevention)
 */
export async function getQuizAction() {
  try {
    const quizzesCol = await getCollection<Quiz>(QUIZ_COLLECTION);
    const quiz = await quizzesCol.findOne({ title: "English Placement Quiz" });

    if (!quiz) {
      throw new Error("No se encontró el examen de ubicación.");
    }

    const sanitizedQuestions = quiz.questions.map(q => ({
      _id: q._id.toString(),
      question: q.question,
      answers: q.answers.map(a => ({
        _id: a._id.toString(),
        answer: a.answer
      }))
    }));

    return {
      success: true,
      quiz: {
        _id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        questions: sanitizedQuestions
      }
    };
  } catch (error: any) {
    console.error("Error in getQuizAction:", error);
    return { success: false, error: error.message || "Error al cargar el examen." };
  }
}

/**
 * Action 3: Securely grade and save placement quiz answers
 */
export async function submitQuizAction(payload: {
  answers: { questionId: string; answerId: string }[];
}) {
  try {
    const { answers } = payload;
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;

    if (!studentIdStr) {
      return { success: false, error: "Sesión no iniciada." };
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const quizzesCol = await getCollection<Quiz>(QUIZ_COLLECTION);

    const studentOid = new ObjectId(studentIdStr);
    const student = await studentsCol.findOne({ _id: studentOid });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const quiz = await quizzesCol.findOne({ title: "English Placement Quiz" });
    if (!quiz) {
      return { success: false, error: "Examen de ubicación no encontrado." };
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(q => {
      const submitted = answers.find(a => a.questionId === q._id.toString());
      if (submitted) {
        if (q.correctAnswerId.toString() === submitted.answerId) {
          score += 1;
        }
      }
    });

    await studentsCol.updateOne(
      { _id: studentOid },
      {
        $set: {
          quizResult: {
            score,
            totalQuestions,
            completedAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    return {
      success: true,
      score,
      totalQuestions
    };
  } catch (error: any) {
    console.error("Error in submitQuizAction:", error);
    return { success: false, error: error.message || "Error al calificar el examen." };
  }
}

/**
 * Action 4: Book the free Intro Call (Google Meet) and send ics confirmation email
 */
export async function bookIntroCallAction(payload: {
  dateTimeIso: string;
}) {
  try {
    const { dateTimeIso } = payload;
    const cookieStore = await cookies();
    const studentIdStr = cookieStore.get("student_id")?.value;

    if (!studentIdStr) {
      return { success: false, error: "Sesión no iniciada." };
    }

    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const sessionsCol = await getCollection(SESSION_COLLECTION);

    const studentOid = new ObjectId(studentIdStr);
    const student = await studentsCol.findOne({ _id: studentOid });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    const dateTime = new Date(dateTimeIso);

    const sessionData = createSession({
      studentId: studentOid,
      type: "intro",
      dateTime,
      duration: 30,
      meetingLink: `https://wa.me/${(process.env.TEACHER_PHONE || "525512345678").replace(/\D/g, '')}`
    });

    const result = await sessionsCol.insertOne(sessionData);

    // Build the ICS Calendar invitation
    const sessionId = result.insertedId.toString();
    const endDateTime = new Date(dateTime);
    endDateTime.setMinutes(dateTime.getMinutes() + 30);

    const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const nowStr = formatIcsDate(new Date());
    const startStr = formatIcsDate(dateTime);
    const endStr = formatIcsDate(endDateTime);

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
      "SUMMARY:Clase Demo de Ingles - Tu Tutor de Ingles",
      "DESCRIPTION:Tu llamada introductoria de 30 minutos con Mauricio. WhatsApp: ${process.env.WHATSAPP_NUMBER}",
      "LOCATION:WhatsApp",
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const emailSubject = "Tu Clase Demo de Inglés está Confirmada! 🎉";
    const emailText = `¡Hola ${student.name}!\n\nTu clase demo de inglés ha sido agendada con éxito.\n\nFecha y Hora: ${dateTime.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\nPlataforma: WhatsApp\nNúmero: ${process.env.WHATSAPP_NUMBER}\n\nTe hemos adjuntado una invitación de calendario (.ics) a este correo para que la agregues a tu agenda.\n\n¡Nos vemos pronto!\nMauricio Tellez\nTu Tutor de Inglés`;

    await sendMail({
      to: student.email,
      subject: emailSubject,
      text: emailText,
      icalEvent: {
        filename: "clase-demo.ics",
        content: icsContent
      }
    });

    return {
      success: true,
      sessionId,
      meetingLink: sessionData.meetingLink,
      dateTime: sessionData.dateTime.toISOString()
    };
  } catch (error: any) {
    console.error("Error in bookIntroCallAction:", error);
    return { success: false, error: error.message || "Error al agendar la llamada." };
  }
}
