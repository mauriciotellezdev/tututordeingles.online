import { expect, test } from "bun:test";
import { ObjectId } from "mongodb";
import { createCredit } from "../../src/lib/models/credit";

test("createCredit omits empty optional fields (strict validator safety)", () => {
  const c = createCredit({
    studentId: new ObjectId().toString(),
    amount: -1,
    source: "debit",
  });
  // Must be ABSENT, not null — the credit $jsonSchema validator requires
  // description/stripeChargeId to be a non-empty string or absent. This is what
  // let a paid booking's debit credit fail validation before the fix.
  expect("description" in c).toBe(false);
  expect("stripeChargeId" in c).toBe(false);
  expect(c.source).toBe("debit");
  expect(c.amount).toBe(-1);
});

test("createCredit includes provided optional fields", () => {
  const c = createCredit({
    studentId: new ObjectId().toString(),
    amount: 1,
    source: "purchase",
    description: "Compra 1 crédito",
    stripeChargeId: "pi_123",
  });
  expect(c.description).toBe("Compra 1 crédito");
  expect(c.stripeChargeId).toBe("pi_123");
});
