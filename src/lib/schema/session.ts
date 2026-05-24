export const sessionSchemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "studentId",
      "type",
      "dateTime",
      "duration",
      "status",
      "createdAt",
      "updatedAt",
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      studentId: { bsonType: "objectId" },
      type: { bsonType: "string", enum: ["intro", "tutoring"] },
      dateTime: { bsonType: "date" },
      duration: { bsonType: "int", minimum: 1 },
      status: { bsonType: "string", enum: ["booked", "completed", "canceled"] },
      meetingLink: { bsonType: "string", minLength: 1 },
      creditId: { bsonType: ["objectId", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
};