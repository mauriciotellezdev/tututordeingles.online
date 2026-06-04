import { expect, test } from "bun:test";
import { ObjectId } from "mongodb";
import { buildReferralLink } from "../../src/lib/referrals";
import { createReferral } from "../../src/lib/models/referral";
import { createCredit } from "../../src/lib/models/credit";
import { resolveCheckoutSessionPaymentContext } from "../../src/lib/stripe-verify";

test("buildReferralLink trims trailing slash and encodes the referral code", () => {
  expect(buildReferralLink("https://example.com/", "A B/C")).toBe("https://example.com/signup?ref=A%20B%2FC");
});

test("createReferral normalizes code and email casing", () => {
  const referral = createReferral({
    referrerStudentId: new ObjectId().toString(),
    referredStudentId: new ObjectId().toString(),
    referralCodeUsed: "abc123xy",
    referredStudentEmail: "Student@Example.com ",
  });

  expect(referral.referralCodeUsed).toBe("ABC123XY");
  expect(referral.referredStudentEmail).toBe("student@example.com");
});

test("createCredit accepts referral rewards", () => {
  const credit = createCredit({
    studentId: new ObjectId().toString(),
    amount: 1,
    source: "referral",
    description: "Recompensa por referido pagado",
    stripeChargeId: "referral:pi_123",
  });

  expect(credit.source).toBe("referral");
  expect(credit.stripeChargeId).toBe("referral:pi_123");
});

test("resolveCheckoutSessionPaymentContext validates Stripe metadata ownership", () => {
  const session = {
    metadata: {
      studentId: "student-123",
      planType: "single",
    },
  } as any;

  const success = resolveCheckoutSessionPaymentContext(session, "student-123", "single");
  expect(success.ok).toBe(true);
  if (success.ok) {
    expect(success.studentId).toBe("student-123");
    expect(success.planType).toBe("single");
  }

  const mismatch = resolveCheckoutSessionPaymentContext(session, "student-456", "single");
  expect(mismatch.ok).toBe(false);
  if (!mismatch.ok) {
    expect(mismatch.error).toBe("La sesión de Stripe no coincide con los datos solicitados.");
  }
});
