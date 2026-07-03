import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { randomInt } from "crypto";
import { getCollection } from "@/lib/db";
import { isE2ELocalRequest } from "@/lib/e2e";
import {
  STUDENT_COLLECTION,
  type Student,
  createStudent,
} from "@/lib/models/student";
import { CREDIT_COLLECTION, createCredit } from "@/lib/models/credit";

// E2E-only (local, non-prod): create a verified student with optional credits +
// quiz result and set the student_id cookie, so tests can be "logged in"
// without going through the OTP flow.
function randomReferralCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += alphabet[randomInt(0, alphabet.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  if (!isE2ELocalRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    phone?: string;
    credits?: number;
    quizScore?: number;
  };
  const email = body.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email" },
      { status: 400 }
    );
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);
  const now = new Date();
  const quizResult =
    typeof body.quizScore === "number"
      ? { score: body.quizScore, totalQuestions: 25, completedAt: now }
      : undefined;

  const existing = await studentsCol.findOne({ email });
  let studentId: ObjectId;

  if (existing) {
    studentId = existing._id;
    await studentsCol.updateOne(
      { _id: studentId },
      {
        $set: { updatedAt: now, ...(quizResult ? { quizResult } : {}) },
        $unset: { verificationCode: "", verificationCodeExpires: "" },
      }
    );
  } else {
    const base = createStudent({
      name: body.name ?? "E2E Alumno",
      email,
      phone: body.phone ?? "5212223339230",
    });
    const doc = {
      ...base,
      referralCode: randomReferralCode(),
      ...(quizResult ? { quizResult } : {}),
    } as Student;
    const inserted = await studentsCol.insertOne(doc);
    studentId = inserted.insertedId;
  }

  if (body.credits && body.credits > 0) {
    await creditsCol.insertOne(
      createCredit({
        studentId: studentId.toString(),
        amount: Math.floor(body.credits),
        source: "adjustment",
        description: "e2e seed credits",
      })
    );
  }

  const seeded = await studentsCol.findOne({ _id: studentId });
  const response = NextResponse.json({
    success: true,
    studentId: studentId.toString(),
    referralCode: seeded?.referralCode ?? null,
  });
  response.cookies.set("student_id", studentId.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
