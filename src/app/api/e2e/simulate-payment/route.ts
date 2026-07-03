import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { isE2ELocalRequest } from "@/lib/e2e";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";
import { processCompletedPayment } from "@/lib/stripe-verify";

// E2E-only (local, non-prod): run the REAL post-payment pipeline
// (processCompletedPayment → payment record, purchase credit, referral reward)
// without Stripe, so the referral/credit loop can be verified end to end
// against the real validators.
export async function POST(request: NextRequest) {
  if (!isE2ELocalRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    planType?: "single" | "package";
    paymentIntentId?: string;
  };
  const email = body.email?.toLowerCase().trim();
  if (!email || !body.paymentIntentId) {
    return NextResponse.json(
      { success: false, error: "Missing email or paymentIntentId" },
      { status: 400 }
    );
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const student = await studentsCol.findOne({ email });
  if (!student) {
    return NextResponse.json(
      { success: false, error: "Student not found" },
      { status: 404 }
    );
  }

  const result = await processCompletedPayment(
    student._id.toString(),
    body.paymentIntentId,
    "cus_e2e_simulated",
    body.planType ?? "single"
  );

  return NextResponse.json({ success: result.success, result });
}
