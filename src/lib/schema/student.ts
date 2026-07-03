export const studentSchemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "phone", "createdAt", "updatedAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      name: { bsonType: "string", minLength: 1 },
      email: { bsonType: "string", minLength: 1 },
      phone: { bsonType: "string", minLength: 1 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      referralCode: { bsonType: "string", minLength: 6, maxLength: 16 },
      signupBrowserId: { bsonType: "string", minLength: 8 },
      signupIpHash: { bsonType: "string", minLength: 32 },
      signupUserAgentHash: { bsonType: "string", minLength: 32 },
      signupCampaignCode: { bsonType: "string", minLength: 1, maxLength: 48 },
      verificationCode: { bsonType: "string", minLength: 6, maxLength: 6 },
      verificationCodeExpires: { bsonType: "date" },
      stripeCustomerId: { bsonType: "string", minLength: 1 },
      quizResult: {
        bsonType: "object",
        required: ["score", "totalQuestions", "completedAt"],
        additionalProperties: false,
        properties: {
          score: { bsonType: "int", minimum: 0 },
          totalQuestions: { bsonType: "int", minimum: 1 },
          completedAt: { bsonType: "date" },
        },
      },
    },
  },
};
