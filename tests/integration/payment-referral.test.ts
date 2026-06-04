import { beforeEach, expect, mock, test } from "bun:test";
import { ObjectId } from "mongodb";
import { createMemoryCollection } from "../helpers/memory-collection";

let collections: ReturnType<typeof buildCollections>;

function buildCollections() {
  const referrerId = new ObjectId();
  const referredId = new ObjectId();
  const now = new Date("2026-06-04T12:00:00.000Z");

  return {
    referrerId,
    referredId,
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
      {
        _id: referredId,
        name: "New Student",
        email: "student@example.com",
        phone: "+5215551111111",
        createdAt: now,
        updatedAt: now,
      },
    ]),
    credits: createMemoryCollection([]),
    payments: createMemoryCollection([]),
    referrals: createMemoryCollection([
      {
        referrerStudentId: referrerId,
        referredStudentId: referredId,
        referralCodeUsed: "REF12345",
        referredStudentEmail: "student@example.com",
        createdAt: now,
      },
    ]),
  };
}

const getCollection = mock(async (name: string) => {
  if (!collections) {
    throw new Error("Collections not initialized");
  }

  switch (name) {
    case "students":
      return collections.students;
    case "credits":
      return collections.credits;
    case "payments":
      return collections.payments;
    case "referrals":
      return collections.referrals;
    default:
      throw new Error(`Unexpected collection: ${name}`);
  }
});

mock.module("../../src/lib/db", () => ({
  getCollection,
}));

const stripeVerifyPromise = import("../../src/lib/stripe-verify");

beforeEach(() => {
  collections = buildCollections();
  getCollection.mockClear();
});

test("processCompletedPayment adds purchase and referral credits once", async () => {
  const { processCompletedPayment } = await stripeVerifyPromise;

  const first = await processCompletedPayment(
    collections.referredId.toString(),
    "pi_test_123",
    "cus_test_123",
    "package",
  );

  expect(first.success).toBe(true);
  expect(first.creditsAdded).toBe(10);
  expect(collections.payments.docs).toHaveLength(1);
  expect(collections.credits.docs).toHaveLength(2);
  expect(collections.students.docs.find((student) => String(student._id) === collections.referredId.toString())?.stripeCustomerId).toBe("cus_test_123");

  const referralAfterFirst = collections.referrals.docs[0];
  expect(referralAfterFirst.rewardGrantedAt).toBeInstanceOf(Date);
  expect(referralAfterFirst.rewardCreditId).toBeDefined();

  const second = await processCompletedPayment(
    collections.referredId.toString(),
    "pi_test_123",
    "cus_test_123",
    "package",
  );

  expect(second.success).toBe(true);
  expect(second.creditsAdded).toBe(0);
  expect(collections.payments.docs).toHaveLength(1);
  expect(collections.credits.docs).toHaveLength(2);
});
