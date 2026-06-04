import { ObjectId } from "mongodb";
import { randomInt } from "crypto";

export interface Student {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  referralCode?: string;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  stripeCustomerId?: string;
  quizResult?: {
    score: number;
    totalQuestions: number;
    completedAt: Date;
  };
  quizProgress?: {
    lastQuestionId: string;
    answeredQuestions: string[];
    updatedAt: Date;
  };
}

export interface StudentSignupInput {
  name: string;
  email: string;
  phone: string;
}

export interface VerificationCodeInput {
  email: string;
}

export const STUDENT_COLLECTION = "students";

export function createStudent(input: StudentSignupInput): Omit<Student, "_id"> {
  const now = new Date();
  return {
    name: input.name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function isEmailVerified(student: Student): boolean {
  return !student.verificationCode && !student.verificationCodeExpires;
}

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}
