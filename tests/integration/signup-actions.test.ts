import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { ObjectId } from "mongodb";
import { createMemoryCollection } from "../helpers/memory-collection";

let collections: ReturnType<typeof buildCollections>;
let consoleErrorSpy: ReturnType<typeof spyOn>;
let consoleWarnSpy: ReturnType<typeof spyOn>;
const originalTeacherEmail = process.env.TEACHER_EMAIL;

function buildCollections() {
  const referrerId = new ObjectId();
  const now = new Date("2026-06-04T12:00:00.000Z");

  return {
    students: createMemoryCollection([
      {
        _id: referrerId,
        name: "Mauricio Referrer",
        email: "referrer@example.com",
        phone: "+5215550000000",
        createdAt: now,
        updatedAt: now,
        referralCode: "REF12345",
      },
    ]),
    credits: createMemoryCollection([]),
    referrals: createMemoryCollection([]),
    referrerId,
  };
}

const sendMail = mock(async () => undefined);

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: mock(() => undefined),
    set: mock(() => undefined),
  }),
  headers: async () => ({
    get: (name: string) => {
      if (name === "user-agent") {
        return "Playwright";
      }
      if (name === "x-forwarded-for") {
        return "203.0.113.10";
      }
      return null;
    },
  }),
}));

mock.module("../../src/lib/db", () => ({
  getCollection: async (name: string) => {
    if (!collections) {
      throw new Error("Collections not initialized");
    }

    switch (name) {
      case "students":
        return collections.students;
      case "credits":
        return collections.credits;
      case "referrals":
        return collections.referrals;
      default:
        throw new Error(`Unexpected collection: ${name}`);
    }
  },
}));

mock.module("../../src/lib/mail", () => ({
  sendMail,
}));

const signupModulePromise = import("../../src/app/(auth)/signup/actions");

beforeEach(() => {
  collections = buildCollections();
  sendMail.mockReset();
  sendMail.mockResolvedValue(undefined);
  consoleErrorSpy = spyOn(console, "error").mockImplementation(() => undefined);
  consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => undefined);
  process.env.TEACHER_EMAIL = "mauricio@example.com";
});

afterEach(() => {
  consoleErrorSpy?.mockRestore();
  consoleWarnSpy?.mockRestore();
  if (originalTeacherEmail === undefined) {
    delete process.env.TEACHER_EMAIL;
  } else {
    process.env.TEACHER_EMAIL = originalTeacherEmail;
  }
});

test("signupStudentAction stores the referral relationship and sends verification mail", async () => {
  const { signupStudentAction } = await signupModulePromise;

  const result = await signupStudentAction({
    name: "New Student",
    email: "Student@Example.com",
    phone: "+5215551111111",
    referralCode: "ref12345",
  });

  expect(result.success).toBe(true);
  expect(result.email).toBe("student@example.com");
  expect(collections.students.docs).toHaveLength(2);
  expect(collections.referrals.docs).toHaveLength(1);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(sendMail.mock.calls[0]?.[0]?.to).toBe("student@example.com");
  expect(sendMail.mock.calls[1]?.[0]?.to).toBe("mauricio@example.com");

  const referredStudent = collections.students.docs.find(
    (student) => student.email === "student@example.com"
  );
  expect(referredStudent?.referralCode).toBeTruthy();
  expect(collections.referrals.docs[0].referralCodeUsed).toBe("REF12345");
});

test("signupStudentAction rolls back the student and referral when email delivery fails", async () => {
  const { signupStudentAction } = await signupModulePromise;
  sendMail.mockImplementationOnce(async () => {
    throw new Error("smtp down");
  });

  const result = await signupStudentAction({
    name: "Rollback Student",
    email: "rollback@example.com",
    phone: "+5215552222222",
    referralCode: "ref12345",
  });

  expect(result.success).toBe(false);
  expect(collections.students.docs).toHaveLength(1);
  expect(collections.referrals.docs).toHaveLength(0);
  expect(sendMail).toHaveBeenCalledTimes(1);
});

test("signupStudentAction still succeeds when the owner notification fails", async () => {
  const { signupStudentAction } = await signupModulePromise;
  sendMail.mockResolvedValueOnce(undefined).mockImplementationOnce(async () => {
    throw new Error("owner smtp down");
  });

  const result = await signupStudentAction({
    name: "Owner Notify Student",
    email: "owner-notify@example.com",
    phone: "+5215553333333",
    referralCode: "ref12345",
  });

  expect(result.success).toBe(true);
  expect(collections.students.docs).toHaveLength(2);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
});
