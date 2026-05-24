import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear the authentication cookie
    const cookieStore = await cookies();
    cookieStore.delete("student_id");

    // Return a successful response
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in logout API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to logout" },
      { status: 500 }
    );
  }
}