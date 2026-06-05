import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { isAuthorizedE2ERequest } from "@/lib/e2e";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";
import { REFERRAL_COLLECTION } from "@/lib/models/referral";
import { CREDIT_COLLECTION } from "@/lib/models/credit";
import { PAYMENT_COLLECTION } from "@/lib/models/payment";
import { SESSION_COLLECTION } from "@/lib/models/session";

type ResetPayload = {
  email?: string;
};

export async function POST(request: NextRequest) {
  if (!isAuthorizedE2ERequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as ResetPayload;
  const email = body.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email" },
      { status: 400 }
    );
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const referralsCol = await getCollection(REFERRAL_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);
  const paymentsCol = await getCollection(PAYMENT_COLLECTION);
  const sessionsCol = await getCollection(SESSION_COLLECTION);

  const existing = await studentsCol.findOne({ email });
  if (!existing) {
    return NextResponse.json({ success: true, deleted: false });
  }

  const studentId = existing._id;
  const studentObjectId = new ObjectId(studentId);

  await Promise.all([
    studentsCol.deleteOne({ _id: studentObjectId }),
    referralsCol.deleteMany({
      $or: [
        { referrerStudentId: studentObjectId },
        { referredStudentId: studentObjectId },
      ],
    }),
    creditsCol.deleteMany({ studentId: studentObjectId }),
    paymentsCol.deleteMany({ studentId: studentObjectId }),
    sessionsCol.deleteMany({ studentId: studentObjectId }),
  ]);

  return NextResponse.json({
    success: true,
    deleted: true,
    studentId: studentId.toString(),
  });
}
