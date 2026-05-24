export const creditSchemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: ["studentId", "amount", "source", "createdAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      studentId: { bsonType: "objectId" },
      amount: { bsonType: "int", minimum: -9999, maximum: 9999 },
      source: {
        bsonType: "string",
        enum: ["purchase", "bonus", "adjustment", "debit"],
      },
      description: { bsonType: "string", minLength: 1 },
      createdAt: { bsonType: "date" },
      stripeChargeId: { bsonType: "string", minLength: 1 },
    },
  },
};