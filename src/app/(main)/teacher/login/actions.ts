"use server";

import { cookies } from "next/headers";

export async function teacherLoginAction(password: string) {
  try {
    const expected = process.env.TEACHER_PASSWORD || "tehuacan2024";
    if (password !== expected) {
      return { success: false, error: "Incorrect password." };
    }
    const cookieStore = await cookies();
    cookieStore.set("teacher_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return { success: true };
  } catch {
    return { success: false, error: "Authentication error." };
  }
}
