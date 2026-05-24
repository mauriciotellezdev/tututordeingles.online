"use server";

import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import { createStudent, STUDENT_COLLECTION, Student, generateVerificationCode } from "@/lib/models/student";
import { sendMail } from "@/lib/mail";

/**
 * Action 1: Sign up a student and send a 6-digit verification code
 */
export async function signupStudentAction(input: { name: string; email: string; phone: string }) {
  try {
    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const normalizedEmail = input.email.toLowerCase().trim();

    const existing = await studentsCol.findOne({ email: normalizedEmail });

    if (existing) {
      return {
        success: false,
        error: "Este correo electrónico ya está registrado. Por favor inicia sesión en la página de ingreso."
      };
    }

    // Generate verification code and expiry (15 minutes)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 15);

    // Create student document
    const studentData = createStudent(input);
    const newStudent = {
      ...studentData,
      verificationCode,
      verificationCodeExpires
    } as Student;

    await studentsCol.insertOne(newStudent);

    // Send the verification code email
    const subject = "Tu código de verificación - Tu Tutor de Inglés 🔑";
    const text = `¡Hola ${input.name}!\n\nGracias por registrarte en Tu Tutor de Inglés.\n\nTu código de verificación es: ${verificationCode}\n\nEste código vencerá en 15 minutos.\n\nSi no solicitaste este registro, puedes ignorar este mensaje.\n\nSaludos,\nMauricio Tellez\nTu Tutor de Inglés`;

    await sendMail({
      to: normalizedEmail,
      subject,
      text
    });

    return {
      success: true,
      email: normalizedEmail
    };
  } catch (error: any) {
    console.error("Error in signupStudentAction:", error);
    return { success: false, error: error.message || "Ocurrió un error al registrar tus datos." };
  }
}

/**
 * Action 2: Verify the security code and log the student in
 */
export async function verifyCodeAndLoginAction(payload: { email: string; code: string }) {
  try {
    const { email, code } = payload;
    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const normalizedEmail = email.toLowerCase().trim();

    const student = await studentsCol.findOne({ email: normalizedEmail });

    if (!student) {
      return { success: false, error: "Usuario no encontrado." };
    }

    // Verify code expiration and match
    const now = new Date();
    if (!student.verificationCodeExpires || student.verificationCodeExpires < now) {
      return { success: false, error: "El código de verificación ha expirado. Por favor solicita uno nuevo." };
    }

    if (student.verificationCode !== code.trim()) {
      return { success: false, error: "El código de verificación es incorrecto." };
    }

    // Update student as verified and clear temporary code
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

    // Set HTTP-only secure cookie for authentication
    const cookieStore = await cookies();
    cookieStore.set("student_id", student._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return {
      success: true,
      studentId: student._id.toString()
    };
  } catch (error: any) {
    console.error("Error in verifyCodeAndLoginAction:", error);
    return { success: false, error: error.message || "Error al verificar el código." };
  }
}
