"use server";

import { cookies } from "next/headers";
import Stripe from "stripe";
import { getTeacherData } from "@/lib/models/teacher";

// Owner-only: create a REAL Stripe checkout for the minimum MXN amount ($10) to
// validate the card / OXXO / SPEI rails end-to-end without spending. The
// resulting session carries metadata { purpose: "payment-test" } and NO
// studentId/planType, so the webhook safely ignores it (grants no credits).
export async function createTestCheckoutAction({
  method,
}: {
  method: "card" | "oxxo" | "spei";
}) {
  const cookieStore = await cookies();
  if (cookieStore.get("teacher_session")?.value !== "true") {
    return { success: false as const, error: "No autorizado." };
  }

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return { success: false as const, error: "Stripe no está configurado." };
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777";
    const stripe = new Stripe(key);
    const teacher = await getTeacherData();

    const customer = await stripe.customers.create({
      email: teacher.email,
      name: "Prueba de pagos",
    });

    const pmType =
      method === "card"
        ? "card"
        : method === "oxxo"
          ? "oxxo"
          : "customer_balance";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [pmType],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { name: `Prueba de pago — ${method.toUpperCase()}` },
            unit_amount: 1000, // $10.00 MXN — Stripe minimum
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customer.id,
      success_url: `${appUrl}/teacher/test-pagos?ok=1`,
      cancel_url: `${appUrl}/teacher/test-pagos?cancel=1`,
      metadata: { purpose: "payment-test" },
      ...(method === "spei"
        ? {
            payment_method_options: {
              customer_balance: {
                funding_type: "bank_transfer" as const,
                bank_transfer: { type: "mx_bank_transfer" as const },
              },
            },
          }
        : {}),
    });
    return { success: true as const, url: session.url };
  } catch (error) {
    console.error("createTestCheckoutAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Error al crear el pago de prueba.",
    };
  }
}
