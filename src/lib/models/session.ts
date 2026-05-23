import { ObjectId } from "mongodb";

export type SessionType = "intro" | "tutoring";
export type SessionStatus = "booked" | "completed" | "canceled";

export interface Session {
  _id: ObjectId;
  studentId: ObjectId;
  type: SessionType;
  dateTime: Date;
  duration: number; // in minutes
  status: SessionStatus;
  meetingLink?: string;
  creditId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionInput {
  studentId: ObjectId;
  type: SessionType;
  dateTime: Date;
  duration?: number;
  meetingLink?: string;
  creditId?: ObjectId;
}

export const SESSION_COLLECTION = "sessions";

export function isIntroSession(session: Session): boolean {
  return session.type === "intro";
}

export function isPaidSession(session: Session): boolean {
  return session.creditId !== undefined;
}

export function createSession(input: CreateSessionInput): Omit<Session, "_id"> {
  if (input.type === "tutoring" && !input.creditId) {
    throw new Error("Tutoring sessions require a creditId");
  }
  if (input.type === "intro" && input.creditId) {
    throw new Error("Intro sessions cannot have a creditId");
  }

  const minimumTime = new Date();
  minimumTime.setHours(minimumTime.getHours() + 24);
  if (input.dateTime < minimumTime) {
    throw new Error("Sessions must be booked at least 24 hours in the future");
  }

  const teacherPhone = process.env.TEACHER_PHONE;
  if (!teacherPhone) {
    throw new Error("TEACHER_PHONE env variable is not set");
  }

  const now = new Date();
  return {
    studentId: input.studentId,
    type: input.type,
    dateTime: input.dateTime,
    duration: input.duration ?? 60,
    status: "booked",
    meetingLink: input.meetingLink ?? `https://wa.me/${teacherPhone}`,
    creditId: input.creditId,
    createdAt: now,
    updatedAt: now,
  };
}