export const paymentSchemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "studentId",
      "stripePaymentIntentId",
      "stripeCustomerId",
      "amount",
      "currency",
      "status",
      "createdAt",
      "updatedAt",
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      studentId: { bsonType: "objectId" },
      stripePaymentIntentId: { bsonType: "string", minLength: 1 },
      stripeCustomerId: { bsonType: "string", minLength: 1 },
      amount: { bsonType: "int", minimum: 1 },
      currency: { bsonType: "string", enum: ["usd", "mxn", "eur"] },
      status: {
        bsonType: "string",
        enum: ["pending", "succeeded", "failed", "refunded"],
      },
      description: { bsonType: "string", minLength: 1 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
};