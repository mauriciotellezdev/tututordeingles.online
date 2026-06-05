import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { isAuthorizedE2ERequest } from "@/lib/e2e";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";

export async function GET(request: NextRequest) {
  if (!isAuthorizedE2ERequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email" },
      { status: 400 }
    );
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const student = await studentsCol.findOne({ email });

  if (!student?.verificationCode) {
    return NextResponse.json(
      { success: false, error: "Verification code not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    email,
    code: student.verificationCode,
  });
}
