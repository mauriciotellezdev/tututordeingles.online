"use server";

import { cookies, headers } from "next/headers";
import { MongoServerError, ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import {
  createStudent,
  STUDENT_COLLECTION,
  Student,
  generateVerificationCode,
} from "@/lib/models/student";
import { createReferral, REFERRAL_COLLECTION } from "@/lib/models/referral";
import {
  getClientIp,
  getOrCreateBrowserId,
  hashAbuseSignal,
} from "@/lib/abuse";
import {
  ensureReferralIndexes,
  generateUniqueReferralCode,
} from "@/lib/referrals";
import { sendMail } from "@/lib/mail";

/**
 * Action 1: Sign up a student and send a 6-digit verification code
 */
export async function signupStudentAction(input: {
  name: string;
  email: string;
  phone: string;
  referralCode?: string | null;
}) {
  try {
    await ensureReferralIndexes();
    const requestHeaders = await headers();
    const cookieStore = await cookies();
    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const referralsCol = await getCollection(REFERRAL_COLLECTION);
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedReferralCode =
      input.referralCode?.trim().toUpperCase() || "";
    const browserId = getOrCreateBrowserId(cookieStore);
    const clientIpHash = hashAbuseSignal(getClientIp(requestHeaders));
    const userAgentHash = hashAbuseSignal(
      requestHeaders.get("user-agent") || "unknown"
    );
    const isE2ERequest =
      Boolean(process.env.E2E_TEST_SECRET) &&
      requestHeaders.get("x-e2e-secret") === process.env.E2E_TEST_SECRET;

    cookieStore.set("tu_browser_id", browserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    const existing = await studentsCol.findOne({ email: normalizedEmail });

    if (existing) {
      return {
        success: false,
        error:
          "Este correo electrónico ya está registrado. Por favor inicia sesión en la página de ingreso.",
      };
    }

    const browserMatch = await studentsCol.findOne({
      signupBrowserId: browserId,
    });
    if (browserMatch) {
      return {
        success: false,
        error:
          "Ya existe una cuenta creada desde este navegador. Si necesitas ayuda, contáctame por WhatsApp.",
      };
    }

    const recentIpAccounts = await studentsCol.countDocuments({
      signupIpHash: clientIpHash,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    if (recentIpAccounts >= 3) {
      return {
        success: false,
        error:
          "Demasiadas cuentas se han registrado desde esta red recientemente. Contáctame para revisar tu caso.",
      };
    }

    // Generate verification code and expiry (15 minutes)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(
      verificationCodeExpires.getMinutes() + 15
    );

    // Create student document
    const studentData = createStudent(input);
    let insertedId: ObjectId | undefined;
    let referralCode = "";
    let createdStudent = false;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      referralCode = await generateUniqueReferralCode(studentsCol);
      const newStudent = {
        ...studentData,
        referralCode,
        signupBrowserId: browserId,
        signupIpHash: clientIpHash,
        signupUserAgentHash: userAgentHash,
        verificationCode,
        verificationCodeExpires,
      } as Student;

      try {
        const result = await studentsCol.insertOne(newStudent);
        insertedId = result.insertedId;
        createdStudent = true;
        break;
      } catch (error) {
        if (
          error instanceof MongoServerError &&
          error.code === 11000 &&
          String(error.message).includes("referralCode")
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!createdStudent || !insertedId) {
      return {
        success: false,
        error: "No se pudo generar tu código de referido. Intenta de nuevo.",
      };
    }

    try {
      if (normalizedReferralCode) {
        const referrer = await studentsCol.findOne({
          referralCode: normalizedReferralCode,
        });
        if (referrer) {
          await referralsCol.updateOne(
            { referredStudentId: insertedId },
            {
              $setOnInsert: createReferral({
                referrerStudentId: referrer._id.toString(),
                referredStudentId: insertedId.toString(),
                referralCodeUsed: normalizedReferralCode,
                referredStudentEmail: normalizedEmail,
              }),
            },
            { upsert: true }
          );
        }
      }

      const referrer = normalizedReferralCode
        ? await studentsCol.findOne({ referralCode: normalizedReferralCode })
        : null;
      if (
        referrer?.signupBrowserId === browserId ||
        referrer?.signupIpHash === clientIpHash
      ) {
        await referralsCol.updateOne(
          { referredStudentId: insertedId },
          {
            $set: {
              rewardBlockedAt: new Date(),
              rewardBlockedReason: "shared_browser_or_ip",
            },
            $unset: {
              rewardCreditId: "",
              rewardGrantedAt: "",
            },
          }
        );
      }

      // Send the verification code email
      const subject = "Tu código de verificación - Tu Tutor de Inglés 🔑";
      const text = `¡Hola ${input.name}!\n\nGracias por registrarte en Tu Tutor de Inglés.\n\nTu código de verificación es: ${verificationCode}\n\nEste código vencerá en 15 minutos.\n\nSi no solicitaste este registro, puedes ignorar este mensaje.\n\nSaludos,\nMauricio Tellez\nTu Tutor de Inglés`;

      if (!isE2ERequest) {
        await sendMail({
          to: normalizedEmail,
          subject,
          text,
        });
      }
    } catch (mailError) {
      if (createdStudent && insertedId) {
        await studentsCol.deleteOne({ _id: insertedId });
      }
      if (insertedId) {
        await referralsCol.deleteOne({ referredStudentId: insertedId });
      }
      throw mailError;
    }

    return {
      success: true,
      email: normalizedEmail,
    };
  } catch (error: unknown) {
    console.error("Error in signupStudentAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar tus datos.",
    };
  }
}

/**
 * Action 2: Verify the security code and log the student in
 */
export async function verifyCodeAndLoginAction(payload: {
  email: string;
  code: string;
}) {
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
    if (
      !student.verificationCodeExpires ||
      student.verificationCodeExpires < now
    ) {
      return {
        success: false,
        error:
          "El código de verificación ha expirado. Por favor solicita uno nuevo.",
      };
    }

    if (student.verificationCode !== code.trim()) {
      return {
        success: false,
        error: "El código de verificación es incorrecto.",
      };
    }

    // Update student as verified and clear temporary code
    await studentsCol.updateOne(
      { _id: student._id },
      {
        $set: {
          updatedAt: new Date(),
        },
        $unset: {
          verificationCode: "",
          verificationCodeExpires: "",
        },
      }
    );

    // Set HTTP-only secure cookie for authentication
    const cookieStore = await cookies();
    cookieStore.set("student_id", student._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return {
      success: true,
      studentId: student._id.toString(),
    };
  } catch (error: unknown) {
    console.error("Error in verifyCodeAndLoginAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al verificar el código.",
    };
  }
}
