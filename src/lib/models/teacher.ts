import { randomInt } from "crypto";
import { ObjectId } from "mongodb";

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

export function isTeacherEmailVerified(teacher: Teacher): boolean {
  return !teacher.verificationCode && !teacher.verificationCodeExpires;
}

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}