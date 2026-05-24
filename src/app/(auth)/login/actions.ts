"use server";

import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { STUDENT_COLLECTION, Student, generateVerificationCode } from "@/lib/models/student";
import { getTeacherData } from "@/lib/models/teacher";
import { sendMail } from "@/lib/mail";

const TEACHER_AUTH_COLLECTION = "teacher_auth";

/**
 * Action 1: Request a 6-digit login code via email
 */
export async function requestLoginCodeAction(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const teacher = await getTeacherData();
    const teacherEmail = teacher.email.toLowerCase().trim();

    const isTeacher = normalizedEmail === teacherEmail;
    let studentId: ObjectId | undefined = undefined;
    let name = "Profesor";

    if (!isTeacher) {
      // Check if student exists
      const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
      const student = await studentsCol.findOne({ email: normalizedEmail });

      if (!student) {
        return {
          success: false,
          error: "Este correo electrónico no está registrado. Si eres un nuevo estudiante, regístrate primero."
        };
      }
      studentId = student._id;
      name = student.name;
    }

    // Generate login code and expiry (15 mins)
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    if (isTeacher) {
      const teacherAuthCol = await getCollection(TEACHER_AUTH_COLLECTION);
      // Upsert teacher auth code
      await teacherAuthCol.updateOne(
        { email: normalizedEmail },
        {
          $set: {
            email: normalizedEmail,
            code: verificationCode,
            expiresAt,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } else {
      const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
      await studentsCol.updateOne(
        { _id: studentId },
        {
          $set: {
            verificationCode,
            verificationCodeExpires: expiresAt,
            updatedAt: new Date()
          }
        }
      );
    }

    // Send email
    const subject = "Tu código de acceso - Tu Tutor de Inglés 🔑";
    const text = `¡Hola ${name}!\n\nTu código de acceso temporal para iniciar sesión es: ${verificationCode}\n\nEste código vencerá en 15 minutos.\n\nSaludos,\nMauricio Tellez\nTu Tutor de Inglés`;

    await sendMail({
      to: normalizedEmail,
      subject,
      text
    });

    return {
      success: true,
      email: normalizedEmail
    };
  } catch (error: unknown) {
    console.error("Error in requestLoginCodeAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "Error al solicitar el código de acceso.") };
  }
}

/**
 * Action 2: Verify login code and log in the user (student or teacher)
 */
export async function verifyLoginCodeAction(payload: { email: string; code: string }) {
  try {
    const { email, code } = payload;
    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    const teacher = await getTeacherData();
    const teacherEmail = teacher.email.toLowerCase().trim();

    const isTeacher = normalizedEmail === teacherEmail;
    const now = new Date();

    if (isTeacher) {
      const teacherAuthCol = await getCollection(TEACHER_AUTH_COLLECTION);
      const authRecord = await teacherAuthCol.findOne({ email: normalizedEmail });

      if (!authRecord || authRecord.code !== cleanCode || authRecord.expiresAt < now) {
        return { success: false, error: "Código incorrecto o expirado." };
      }

      // Clear teacher code
      await teacherAuthCol.deleteOne({ email: normalizedEmail });

      // Set cookie for teacher
      const cookieStore = await cookies();
      cookieStore.set("teacher_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/"
      });

      return {
        success: true,
        role: "teacher"
      };
    } else {
      const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
      const student = await studentsCol.findOne({ email: normalizedEmail });

      if (!student) {
        return { success: false, error: "Usuario no encontrado." };
      }

      if (!student.verificationCodeExpires || student.verificationCodeExpires < now) {
        return { success: false, error: "Código expirado. Solicita uno nuevo." };
      }

      if (student.verificationCode !== cleanCode) {
        return { success: false, error: "Código incorrecto." };
      }

      // Verify email if it wasn't verified, and clear code
      await studentsCol.updateOne(
        { _id: student._id },
        {
          $set: {
            updatedAt: new Date()
          },
          $unset: {
            verificationCode: "",
            verificationCodeExpires: ""
          }
        }
      );

      // Set student cookie
      const cookieStore = await cookies();
      cookieStore.set("student_id", student._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
      });

      return {
        success: true,
        role: "student",
        quizCompleted: !!student.quizResult
      };
    }
  } catch (error: unknown) {
    console.error("Error in verifyLoginCodeAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "Error al verificar el código de acceso.") };
  }
}
