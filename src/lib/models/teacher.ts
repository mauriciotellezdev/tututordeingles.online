import { randomInt } from "crypto";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";

export interface Teacher {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  verificationCode?: string;
  verificationCodeExpires?: Date;
}

export const TEACHER_COLLECTION = "teachers";

export async function getTeacherData(): Promise<Pick<Teacher, "email" | "phone">> {
  const col = await getCollection<Teacher>(TEACHER_COLLECTION);
  const teacher = await col.findOne({}, { projection: { email: 1, phone: 1 } });
  if (!teacher) {
    throw new Error("Teacher record not found in database");
  }
  return { email: teacher.email, phone: teacher.phone };
}

export function isTeacherEmailVerified(teacher: Teacher): boolean {
  return !teacher.verificationCode && !teacher.verificationCodeExpires;
}

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}