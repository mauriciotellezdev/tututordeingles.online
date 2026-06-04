import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { ObjectId } from "mongodb";
import { createMemoryCollection } from "../helpers/memory-collection";

let collections: ReturnType<typeof buildCollections>;
let consoleErrorSpy: ReturnType<typeof spyOn>;

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
});

afterEach(() => {
  consoleErrorSpy?.mockRestore();
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
  expect(sendMail).toHaveBeenCalledTimes(1);

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
