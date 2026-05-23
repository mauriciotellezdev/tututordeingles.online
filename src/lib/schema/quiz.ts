export const quizSchemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "description", "questions", "createdAt", "updatedAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1 },
      description: { bsonType: "string", minLength: 1 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      questions: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["_id", "question", "answers", "correctAnswerId"],
          additionalProperties: false,
          properties: {
            _id: { bsonType: "objectId" },
            question: { bsonType: "string", minLength: 1 },
            correctAnswerId: { bsonType: "objectId" },
            answers: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "object",
                required: ["_id", "answer"],
                additionalProperties: false,
                properties: {
                  _id: { bsonType: "objectId" },
                  answer: { bsonType: "string", minLength: 1 },
                },
              },
            },
          },
        },
      },
    },
  },
};