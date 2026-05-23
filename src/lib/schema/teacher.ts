export const teacherSchemaValidation = {
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
      verificationCode: { bsonType: "string", minLength: 6, maxLength: 6 },
      verificationCodeExpires: { bsonType: "date" },
    },
  },
};